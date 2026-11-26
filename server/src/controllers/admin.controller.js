import { pool } from '../../db.js';
import { HttpError } from '../utils/httpError.js';
import { escapeLike, paginacion, validarId } from '../utils/validators.js';
import { CAMPOS_LISTA, FROM_RECETA, consultarReceta } from '../models/receta.model.js';

const ESTADOS_CUENTA = ['PENDIENTE', 'ACTIVO', 'SUSPENDIDO', 'DESACTIVADO'];
const ESTADOS_RECETA = ['PENDIENTE', 'PUBLICADA', 'RECHAZADA'];

// Clave: estado destino. Valor: estados desde los que se permite llegar a él.
// (Nadie vuelve a PENDIENTE; PENDIENTE -> ACTIVO equivale a "aprobar".)
const TRANSICIONES = {
    ACTIVO: ['PENDIENTE', 'SUSPENDIDO', 'DESACTIVADO'],
    SUSPENDIDO: ['ACTIVO'],
    DESACTIVADO: ['PENDIENTE', 'ACTIVO', 'SUSPENDIDO'],
};

export const resumen = async (req, res) => {
    const { rows } = await pool.query(
        `SELECT
            (SELECT COUNT(*)::int FROM usuario
              WHERE estado_cuenta = 'PENDIENTE' AND correo_verificado_en IS NOT NULL) AS usuarios_por_aprobar,
            (SELECT COUNT(*)::int FROM usuario
              WHERE estado_cuenta = 'PENDIENTE' AND correo_verificado_en IS NULL)     AS usuarios_sin_verificar,
            (SELECT COUNT(*)::int FROM receta WHERE estado_receta = 'PENDIENTE')       AS recetas_pendientes,
            (SELECT COUNT(*)::int FROM receta WHERE estado_receta = 'PUBLICADA')       AS recetas_publicadas`
    );
    res.json(rows[0]);
};

// ---------- Usuarios ----------
export const listarUsuarios = async (req, res) => {
    const condiciones = [];
    const params = [];

    if (req.query.estado) {
        if (!ESTADOS_CUENTA.includes(req.query.estado)) throw new HttpError(400, 'Estado de cuenta no válido');
        params.push(req.query.estado);
        condiciones.push(`estado_cuenta = $${params.length}::estado_cuenta`);
    }
    if (req.query.verificado === 'true' || req.query.verificado === 'false') {
        condiciones.push(`correo_verificado_en IS ${req.query.verificado === 'true' ? 'NOT NULL' : 'NULL'}`);
    }
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (q) {
        params.push(`%${escapeLike(q)}%`);
        condiciones.push(
            `(correo ILIKE $${params.length} OR (nom_pla || ' ' || prim_ap) ILIKE $${params.length})`
        );
    }
    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
    const { pagina, limite, offset } = paginacion(req.query, 100);

    const [datos, conteo] = await Promise.all([
        pool.query(
            `SELECT id_usuario, nom_pla, prim_ap, sec_ap, correo, estado_cuenta,
                    correo_verificado_en, id_admin
               FROM usuario ${where}
              ORDER BY id_usuario DESC
              LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
            [...params, limite, offset]
        ),
        pool.query(`SELECT COUNT(*)::int AS total FROM usuario ${where}`, params),
    ]);

    const total = conteo.rows[0].total;
    res.json({
        datos: datos.rows,
        paginacion: { pagina, limite, total, total_paginas: Math.ceil(total / limite) },
    });
};

export const cambiarEstadoUsuario = async (req, res) => {
    const id = validarId(req.params.id);
    const destino = (req.body ?? {}).estado;
    if (!Object.hasOwn(TRANSICIONES, destino)) {
        throw new HttpError(400, 'El estado debe ser ACTIVO, SUSPENDIDO o DESACTIVADO');
    }

    const { rows } = await pool.query(
        `SELECT estado_cuenta, correo_verificado_en, id_admin FROM usuario WHERE id_usuario = $1`,
        [id]
    );
    const usuario = rows[0];
    if (!usuario) throw new HttpError(404, 'Usuario no encontrado');

    if (!TRANSICIONES[destino].includes(usuario.estado_cuenta)) {
        throw new HttpError(409, `No se puede pasar de ${usuario.estado_cuenta} a ${destino}`);
    }
    if (destino === 'ACTIVO' && !usuario.correo_verificado_en) {
        throw new HttpError(409, 'El usuario aún no ha verificado su correo');
    }

    // Al activar, la BD exige un administrador responsable (chk_usuario_activo_con_admin).
    const idAdmin = destino === 'ACTIVO' ? (usuario.id_admin ?? req.auth.id) : usuario.id_admin;
    const actualizado = await pool.query(
        `UPDATE usuario SET estado_cuenta = $1, id_admin = $2 WHERE id_usuario = $3
     RETURNING id_usuario, nom_pla, prim_ap, sec_ap, correo, estado_cuenta, id_admin`,
        [destino, idAdmin, id]
    );
    res.json({ mensaje: `Estado actualizado a ${destino}`, usuario: actualizado.rows[0] });
};

// ---------- Moderación de recetas ----------
export const listarRecetasModeracion = async (req, res) => {
    const estado = req.query.estado ?? 'PENDIENTE';
    const params = [];
    let filtro = '';
    if (estado !== 'TODAS') {
        if (!ESTADOS_RECETA.includes(estado)) throw new HttpError(400, 'Estado de receta no válido');
        params.push(estado);
        filtro = 'WHERE r.estado_receta = $1::estado_receta';
    }
    const { pagina, limite, offset } = paginacion(req.query, 100);

    const [datos, conteo] = await Promise.all([
        pool.query(
            // Las más antiguas primero: es una cola de revisión.
            `SELECT ${CAMPOS_LISTA} ${FROM_RECETA} ${filtro}
              ORDER BY r.fecha_subida ASC, r.id_receta ASC
              LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
            [...params, limite, offset]
        ),
        pool.query(`SELECT COUNT(*)::int AS total FROM receta r ${filtro}`, params),
    ]);

    const total = conteo.rows[0].total;
    res.json({
        datos: datos.rows,
        paginacion: { pagina, limite, total, total_paginas: Math.ceil(total / limite) },
    });
};

export const validarReceta = async (req, res) => {
    const id = validarId(req.params.id);
    const estado = (req.body ?? {}).estado;
    if (!['PUBLICADA', 'RECHAZADA'].includes(estado)) {
        throw new HttpError(400, 'El estado debe ser PUBLICADA o RECHAZADA');
    }

    const { rowCount } = await pool.query(
        `UPDATE receta
            SET estado_receta = $1, id_admin = $2, fecha_validacion = now()
          WHERE id_receta = $3`,
        [estado, req.auth.id, id]
    );
    if (!rowCount) throw new HttpError(404, 'Receta no encontrada');

    res.json({
        mensaje: estado === 'PUBLICADA' ? 'Receta publicada' : 'Receta rechazada',
        receta: await consultarReceta(id),
    });
};
