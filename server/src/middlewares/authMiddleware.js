import { pool } from '../../db.js';
import { verifyJwt } from '../utils/jwt.js';
import { ROLES, esRol } from '../utils/roles.js';
import { HttpError } from '../utils/httpError.js';

// Valida el JWT y confirma en la BD que la cuenta sigue ACTIVA
// (así una suspensión o desactivación surte efecto de inmediato).
async function autenticar(req) {
    const [esquema, token] = (req.headers.authorization || '').split(' ');
    if (esquema !== 'Bearer' || !token) {
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
    if (req.headers.authorization) {
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
