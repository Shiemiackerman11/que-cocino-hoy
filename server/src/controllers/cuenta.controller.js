import bcrypt from 'bcrypt';
import { pool } from '../../db.js';
import { ROLES } from '../utils/roles.js';
import { HttpError } from '../utils/httpError.js';
import { validarPassword, validarTexto } from '../utils/validators.js';

const COLUMNAS_PUBLICAS = 'nom_pla, prim_ap, sec_ap, correo, estado_cuenta, correo_verificado_en';

export const obtenerPerfil = async (req, res) => {
    const { tabla, id } = ROLES[req.auth.rol];
    const { rows } = await pool.query(
        `SELECT ${id} AS id, ${COLUMNAS_PUBLICAS} FROM ${tabla} WHERE ${id} = $1`,
        [req.auth.id]
    );
    if (!rows[0]) throw new HttpError(404, 'Cuenta no encontrada');
    res.json({ rol: req.auth.rol, ...rows[0] });
};

export const actualizarPerfil = async (req, res) => {
    const body = req.body ?? {};
    const { tabla, id } = ROLES[req.auth.rol];

    const { rows } = await pool.query(
        `SELECT nom_pla, prim_ap, sec_ap FROM ${tabla} WHERE ${id} = $1`,
        [req.auth.id]
    );
    const actual = rows[0];
    if (!actual) throw new HttpError(404, 'Cuenta no encontrada');

    const nuevo = {
        nom_pla: body.nom_pla !== undefined
            ? validarTexto(body.nom_pla, 'El nombre', { max: 100 }) : actual.nom_pla,
        prim_ap: body.prim_ap !== undefined
            ? validarTexto(body.prim_ap, 'El primer apellido', { max: 100 }) : actual.prim_ap,
        // sec_ap puede enviarse como null o '' para borrarlo
        sec_ap: body.sec_ap !== undefined
            ? validarTexto(body.sec_ap, 'El segundo apellido', { max: 100, requerido: false }) : actual.sec_ap,
    };

    const actualizado = await pool.query(
        `UPDATE ${tabla} SET nom_pla = $1, prim_ap = $2, sec_ap = $3
          WHERE ${id} = $4
      RETURNING ${id} AS id, ${COLUMNAS_PUBLICAS}`,
        [nuevo.nom_pla, nuevo.prim_ap, nuevo.sec_ap, req.auth.id]
    );
    res.json({ mensaje: 'Perfil actualizado', cuenta: actualizado.rows[0] });
};

async function exigirPasswordActual(req, passwordActual) {
    const { tabla, id } = ROLES[req.auth.rol];
    if (typeof passwordActual !== 'string' || !passwordActual) {
        throw new HttpError(400, 'La contraseña actual es obligatoria');
    }
    const { rows } = await pool.query(`SELECT password_hash FROM ${tabla} WHERE ${id} = $1`, [req.auth.id]);
    if (!rows[0] || !(await bcrypt.compare(passwordActual, rows[0].password_hash))) {
        throw new HttpError(401, 'La contraseña actual es incorrecta');
    }
}

export const cambiarPassword = async (req, res) => {
    const { password_actual, password_nueva } = req.body ?? {};
    const { tabla, id } = ROLES[req.auth.rol];

    validarPassword(password_nueva);
    await exigirPasswordActual(req, password_actual);

    const hash = await bcrypt.hash(password_nueva, 10);
    await pool.query(`UPDATE ${tabla} SET password_hash = $1 WHERE ${id} = $2`, [hash, req.auth.id]);
    res.json({ mensaje: 'Contraseña actualizada' });
};

// Solo usuarios: el usuario puede dar de baja su propia cuenta.
export const desactivarCuenta = async (req, res) => {
    await exigirPasswordActual(req, (req.body ?? {}).password);
    await pool.query(
        `UPDATE usuario SET estado_cuenta = 'DESACTIVADO' WHERE id_usuario = $1`,
        [req.auth.id]
    );
    res.json({ mensaje: 'Tu cuenta fue desactivada' });
};
