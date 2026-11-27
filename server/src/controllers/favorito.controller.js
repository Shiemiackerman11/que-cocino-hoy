import { pool } from '../../db.js';
import { HttpError } from '../utils/httpError.js';
import { validarId } from '../utils/validators.js';
import {
    aRecetaLista, obtenerRecetaSpoonacular, obtenerRecetasSpoonacular,
} from '../services/spoonacular.service.js';

// informationBulk acepta hasta 100 ids por consulta.
const MAX_FAVORITOS_LISTADOS = 100;

const contarFavoritos = async (idUsuario) => {
    const { rows } = await pool.query(
        'SELECT COUNT(*)::int AS total FROM favorito_api WHERE id_usuario = $1',
        [idUsuario]
    );
    return rows[0].total;
};

// GET /api/favoritos  ->  { total, datos: [...] }
export const listarFavoritos = async (req, res) => {
    const [lista, total] = await Promise.all([
        pool.query(
            `SELECT spoonacular_id, titulo, imagen, fecha_agregado
               FROM favorito_api
              WHERE id_usuario = $1
              ORDER BY fecha_agregado DESC, spoonacular_id DESC
              LIMIT $2`,
            [req.auth.id, MAX_FAVORITOS_LISTADOS]
        ),
        contarFavoritos(req.auth.id),
    ]);

    // Se completan categoría y tiempo con Spoonacular. Si no está disponible, se muestran
    // los datos guardados en la BD (título e imagen) para que la lista nunca quede vacía.
    let detalles = new Map();
    if (lista.rows.length) {
        try {
            detalles = await obtenerRecetasSpoonacular(lista.rows.map((f) => f.spoonacular_id));
        } catch (error) {
            console.error(`[favoritos] No se pudieron completar los favoritos: ${error.message}`);
        }
    }

    const datos = lista.rows.map((fila) => {
        const receta = detalles.get(fila.spoonacular_id);
        if (receta) return { ...aRecetaLista(receta), fecha_agregado: fila.fecha_agregado };
        return {
            id: fila.spoonacular_id,
            titulo: fila.titulo,
            imagen: fila.imagen,
            tiempo: null,
            complejidad: null,
            categoria: null,
            categoriaId: null,
            fecha_agregado: fila.fecha_agregado,
        };
    });

    res.json({ total, datos });
};

// POST /api/favoritos  { spoonacular_id }
// El título y la imagen se toman de Spoonacular, no del cliente.
export const agregarFavorito = async (req, res) => {
    const idReceta = validarId((req.body ?? {}).spoonacular_id, 'El id de la receta');
    const receta = await obtenerRecetaSpoonacular(idReceta);
    const titulo = String(receta.title || 'Receta sin título').slice(0, 200);

    await pool.query(
        `INSERT INTO favorito_api (id_usuario, spoonacular_id, titulo, imagen)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id_usuario, spoonacular_id) DO NOTHING`,
        [req.auth.id, idReceta, titulo, receta.image ?? null]
    );
    res.status(201).json({ favorita: true, total: await contarFavoritos(req.auth.id) });
};

// DELETE /api/favoritos/:id  (si ya no estaba, también responde bien)
export const quitarFavorito = async (req, res) => {
    const idReceta = validarId(req.params.id, 'El id de la receta');
    await pool.query(
        'DELETE FROM favorito_api WHERE id_usuario = $1 AND spoonacular_id = $2',
        [req.auth.id, idReceta]
    );
    res.json({ favorita: false, total: await contarFavoritos(req.auth.id) });
};
