import { pool } from '../../db.js';
import { HttpError } from '../utils/httpError.js';
import { validarId, validarTexto } from '../utils/validators.js';

export const listarCategorias = async (req, res) => {
    const { rows } = await pool.query(
        `SELECT c.id_categoria, c.nom_categoria,
                COUNT(r.id_receta) FILTER (WHERE r.estado_receta = 'PUBLICADA')::int AS total_recetas
           FROM categoria c
           LEFT JOIN clasifica cl ON cl.id_categoria = c.id_categoria
           LEFT JOIN receta r ON r.id_receta = cl.id_receta
          GROUP BY c.id_categoria
          ORDER BY c.nom_categoria`
    );
    res.json(rows);
};

// El UNIQUE de la BD distingue mayúsculas; aquí se evita "Postres" vs "postres".
async function validarNombreUnico(nombre, idExcluido = 0) {
    const { rowCount } = await pool.query(
        `SELECT 1 FROM categoria WHERE lower(nom_categoria) = lower($1) AND id_categoria <> $2`,
        [nombre, idExcluido]
    );
    if (rowCount) throw new HttpError(409, 'Ya existe una categoría con ese nombre');
}

export const crearCategoria = async (req, res) => {
    const nombre = validarTexto((req.body ?? {}).nom_categoria, 'El nombre de la categoría', { max: 100 });
    await validarNombreUnico(nombre);

    const { rows } = await pool.query(
        `INSERT INTO categoria (nom_categoria) VALUES ($1) RETURNING id_categoria, nom_categoria`,
        [nombre]
    );
    res.status(201).json(rows[0]);
};

export const actualizarCategoria = async (req, res) => {
    const id = validarId(req.params.id);
    const nombre = validarTexto((req.body ?? {}).nom_categoria, 'El nombre de la categoría', { max: 100 });
    await validarNombreUnico(nombre, id);

    const { rows } = await pool.query(
        `UPDATE categoria SET nom_categoria = $1 WHERE id_categoria = $2
         RETURNING id_categoria, nom_categoria`,
        [nombre, id]
    );
    if (!rows[0]) throw new HttpError(404, 'Categoría no encontrada');
    res.json(rows[0]);
};

// Las recetas no se borran: solo se eliminan sus filas en "clasifica" (ON DELETE CASCADE).
export const eliminarCategoria = async (req, res) => {
    const id = validarId(req.params.id);
    const { rowCount } = await pool.query('DELETE FROM categoria WHERE id_categoria = $1', [id]);
    if (!rowCount) throw new HttpError(404, 'Categoría no encontrada');
    res.json({ mensaje: 'Categoría eliminada' });
};
