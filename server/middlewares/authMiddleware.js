import { pool } from '../db.js';
import { verifyJwt } from '../src/utils/jwt.js';
import { ROLES, esRol } from '../src/utils/roles.js';
import { HttpError } from '../src/utils/httpError.js';

// Valida el JWT y confirma en la BD que la cuenta sigue ACTIVA
// (así una suspensión o desactivación surte efecto de inmediato).
async function autenticar(req) {
    const token = leerCookie(req.headers.cookie, 'qch_token');
    if (!token) {
        throw new HttpError(401, 'Se requiere iniciar sesión');
    }

    const payload = verifyJwt(token);
    if (!payload || !esRol(payload.rol) || !Number.isInteger(payload.sub)) {
        throw new HttpError(401, 'Token inválido o expirado');
    }

    const { tabla, id } = ROLES[payload.rol];
    const { rows } = await pool.query(
        `SELECT estado_cuenta FROM ${tabla} WHERE ${id} = $1`,
        [payload.sub]
    );
    if (!rows[0] || rows[0].estado_cuenta !== 'ACTIVO') {
        throw new HttpError(403, 'Tu cuenta no está activa');
    }

    return { id: payload.sub, rol: payload.rol };
}

export const verifyToken = async (req, res, next) => {
    req.auth = await autenticar(req);
    next();
};

// Para rutas públicas que se comportan distinto si hay sesión (p. ej. ver una receta propia pendiente).
export const authOpcional = async (req, res, next) => {
    if (leerCookie(req.headers.cookie, 'qch_token')) {
        try {
            req.auth = await autenticar(req);
        } catch (error) {
            if (!(error instanceof HttpError)) throw error;
        }
    }
    next();
};

export const requireRole = (...roles) => (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.rol)) {
        throw new HttpError(403, 'No tienes permiso para realizar esta acción');
    }
    next();
};

function leerCookie(header, nombre) {
    if (!header) return null;
    for (const parte of header.split(';')) {
        const separador = parte.indexOf('=');
        if (separador < 0 || parte.slice(0, separador).trim() !== nombre) continue;
        try { return decodeURIComponent(parte.slice(separador + 1).trim()); }
        catch { return null; }
    }
    return null;
}
