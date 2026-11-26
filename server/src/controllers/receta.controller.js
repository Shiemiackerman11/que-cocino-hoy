import { pool } from '../../db.js';
import { HttpError } from '../utils/httpError.js';
import { conTransaccion } from '../utils/transaccion.js';
import {
    escapeLike, paginacion, validarId, validarLista, validarListaIds, validarTexto,
} from '../utils/validators.js';
import { CAMPOS_LISTA, FROM_RECETA, consultarReceta } from '../models/receta.model.js';

const ORDENES = {
    recientes: 'r.fecha_subida DESC, r.id_receta DESC',
    puntaje: 'r.puntaje DESC NULLS LAST, r.fecha_subida DESC, r.id_receta DESC',
    nombre: 'r.nom_receta ASC, r.id_receta ASC',
};

// ---------- Utilidades ----------
// Filtros del catálogo público: q, ingredientes (separados por coma, deben estar todos) y categoria.
function filtrosCatalogo(query) {
    const condiciones = [`r.estado_receta = 'PUBLICADA'`];
    const params = [];

    const q = typeof query.q === 'string' ? query.q.trim() : '';
    if (q) {
        params.push(`%${escapeLike(q)}%`);
        condiciones.push(`r.nom_receta ILIKE $${params.length}`);
    }

    if (typeof query.ingredientes === 'string') {
        const ingredientes = query.ingredientes.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 15);
        for (const ingrediente of ingredientes) {
            params.push(`%${escapeLike(ingrediente)}%`);
            condiciones.push(`r.ingredientes ILIKE $${params.length}`);
        }
    }

    if (typeof query.categoria === 'string' && query.categoria) {
        const ids = validarListaIds(query.categoria.split(','), 'categoria');
        params.push(ids);
        condiciones.push(
            `EXISTS (SELECT 1 FROM clasifica cl
                      WHERE cl.id_receta = r.id_receta
                        AND cl.id_categoria = ANY($${params.length}::int[]))`
        );
    }

    return { where: condiciones.join(' AND '), params };
}

function validarDatosReceta(body, parcial = false) {
    const datos = {};
    const presente = (campo) => body[campo] !== undefined;

    if (!parcial || presente('nom_receta')) {
        datos.nom_receta = validarTexto(body.nom_receta, 'El nombre de la receta', { max: 150 });
    }
    if (!parcial || presente('ingredientes')) {
        datos.ingredientes = validarLista(body.ingredientes, 'Los ingredientes');
    }
    if (!parcial || presente('pasos')) {
        datos.pasos = validarLista(body.pasos, 'Los pasos');
    }
    // La columna "foto" guarda una ruta o URL (máx. 150 caracteres).
    if (presente('foto')) {
        datos.foto = validarTexto(body.foto, 'La foto', { max: 150, requerido: false });
    }
    if (presente('categorias')) {
        datos.categorias = validarListaIds(body.categorias, 'categorias');
    }
    return datos;
}

async function asignarCategorias(client, idReceta, ids) {
    await client.query('DELETE FROM clasifica WHERE id_receta = $1', [idReceta]);
    if (!ids.length) return;

    const { rows } = await client.query(
        'SELECT id_categoria FROM categoria WHERE id_categoria = ANY($1::int[])',
        [ids]
    );
    if (rows.length !== ids.length) {
        throw new HttpError(400, 'Alguna de las categorías indicadas no existe');
    }
    await client.query(
        'INSERT INTO clasifica (id_receta, id_categoria) SELECT $1::int, UNNEST($2::int[])',
        [idReceta, ids]
    );
}

// ---------- Catálogo público ----------
export const listarRecetas = async (req, res) => {
    const { where, params } = filtrosCatalogo(req.query);
    const { pagina, limite, offset } = paginacion(req.query);
    const orden = Object.hasOwn(ORDENES, req.query.orden) ? ORDENES[req.query.orden] : ORDENES.recientes;

    const [datos, conteo] = await Promise.all([
        pool.query(
            `SELECT ${CAMPOS_LISTA} ${FROM_RECETA}
              WHERE ${where}
              ORDER BY ${orden}
              LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
            [...params, limite, offset]
        ),
        pool.query(`SELECT COUNT(*)::int AS total FROM receta r WHERE ${where}`, params),
    ]);

    const total = conteo.rows[0].total;
    res.json({
        datos: datos.rows,
        paginacion: { pagina, limite, total, total_paginas: Math.ceil(total / limite) },
    });
};

// "¿Qué cocino hoy?": una receta publicada al azar, con los mismos filtros del catálogo.
export const sugerirReceta = async (req, res) => {
    const { where, params } = filtrosCatalogo(req.query);
    const { rows } = await pool.query(
        `SELECT ${CAMPOS_LISTA}, r.ingredientes, r.pasos, r.fecha_validacion
         ${FROM_RECETA}
         WHERE ${where}
         ORDER BY random()
         LIMIT 1`,
        params
    );
    if (!rows[0]) throw new HttpError(404, 'No hay recetas que coincidan con tu búsqueda');
    res.json(rows[0]);
};

export const obtenerReceta = async (req, res) => {
    const id = validarId(req.params.id);
    const receta = await consultarReceta(id);
    if (!receta) throw new HttpError(404, 'Receta no encontrada');

    const esDueno = req.auth?.rol === 'usuario' && req.auth.id === receta.id_usuario;
    const esAdmin = req.auth?.rol === 'admin';
    // Las recetas no publicadas solo las ven su autor y los administradores (404 para no revelar su existencia).
    if (receta.estado_receta !== 'PUBLICADA' && !esDueno && !esAdmin) {
        throw new HttpError(404, 'Receta no encontrada');
    }

    if (req.auth?.rol === 'usuario') {
        const { rows } = await pool.query(
            'SELECT valor FROM puntuacion WHERE id_usuario = $1 AND id_receta = $2',
            [req.auth.id, id]
        );
        receta.mi_puntuacion = rows[0]?.valor ?? null;
    }
    res.json(receta);
};

// ---------- Recetas del usuario ----------
export const listarMisRecetas = async (req, res) => {
    const estados = ['PENDIENTE', 'PUBLICADA', 'RECHAZADA'];
    const params = [req.auth.id];
    let filtroEstado = '';
    if (req.query.estado) {
        if (!estados.includes(req.query.estado)) throw new HttpError(400, 'Estado de receta no válido');
        params.push(req.query.estado);
        filtroEstado = `AND r.estado_receta = $2::estado_receta`;
    }

    const { rows } = await pool.query(
        `SELECT ${CAMPOS_LISTA} ${FROM_RECETA}
          WHERE r.id_usuario = $1 ${filtroEstado}
          ORDER BY r.fecha_subida DESC, r.id_receta DESC`,
        params
    );
    res.json(rows);
};

export const crearReceta = async (req, res) => {
    const datos = validarDatosReceta(req.body ?? {});

    const idReceta = await conTransaccion(async (client) => {
        const { rows } = await client.query(
            `INSERT INTO receta (nom_receta, ingredientes, pasos, foto, id_usuario)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id_receta`,
            [datos.nom_receta, datos.ingredientes, datos.pasos, datos.foto ?? null, req.auth.id]
        );
        await asignarCategorias(client, rows[0].id_receta, datos.categorias ?? []);
        return rows[0].id_receta;
    });

    res.status(201).json({
        mensaje: 'Receta enviada. Se publicará cuando un administrador la apruebe.',
        receta: await consultarReceta(idReceta),
    });
};

// Cualquier edición devuelve la receta a PENDIENTE para que se vuelva a revisar.
export const actualizarReceta = async (req, res) => {
    const id = validarId(req.params.id);
    const cambios = validarDatosReceta(req.body ?? {}, true);
    if (!Object.keys(cambios).length) throw new HttpError(400, 'No se enviaron campos para actualizar');

    await conTransaccion(async (client) => {
        const { rows } = await client.query(
            'SELECT * FROM receta WHERE id_receta = $1 AND id_usuario = $2 FOR UPDATE',
            [id, req.auth.id]
        );
        const actual = rows[0];
        if (!actual) throw new HttpError(404, 'Receta no encontrada');

        await client.query(
            `UPDATE receta
                SET nom_receta = $1, ingredientes = $2, pasos = $3, foto = $4,
                    estado_receta = 'PENDIENTE', id_admin = NULL, fecha_validacion = NULL
              WHERE id_receta = $5`,
            [
                cambios.nom_receta ?? actual.nom_receta,
                cambios.ingredientes ?? actual.ingredientes,
                cambios.pasos ?? actual.pasos,
                'foto' in cambios ? cambios.foto : actual.foto,
                id,
            ]
        );
        if (cambios.categorias) await asignarCategorias(client, id, cambios.categorias);
    });

    res.json({
        mensaje: 'Receta actualizada. Volverá a revisión antes de publicarse.',
        receta: await consultarReceta(id),
    });
};

// El autor borra la suya; un administrador puede borrar cualquiera.
// Las filas de "clasifica" y "puntuacion" se eliminan en cascada.
export const eliminarReceta = async (req, res) => {
    const id = validarId(req.params.id);
    const esAdmin = req.auth.rol === 'admin';

    const { rowCount } = await pool.query(
        esAdmin
            ? 'DELETE FROM receta WHERE id_receta = $1'
            : 'DELETE FROM receta WHERE id_receta = $1 AND id_usuario = $2',
        esAdmin ? [id] : [id, req.auth.id]
    );
    if (!rowCount) throw new HttpError(404, 'Receta no encontrada');
    res.json({ mensaje: 'Receta eliminada' });
};
