import { pool } from '../../db.js';
import { verifyJwt } from '../utils/jwt.js';
import { ROLES, esRol } from '../utils/roles.js';
import { HttpError } from '../utils/httpError.js';

async function autenticar(req) {
    // 1. Intentar leer desde cookie HttpOnly
    let token = req.cookies?.token || req.cookies?.admin_token;

    // 2. Si no hay cookie, intentar desde header Authorization (para Postman/API)
    if (!token) {
        const [esquema, tokenHeader] = (req.headers.authorization || '').split(' ');
        if (esquema === 'Bearer' && tokenHeader) token = tokenHeader;
    }

    if (!token) throw new HttpError(401, 'Se requiere iniciar sesión');

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

export const authOpcional = async (req, res, next) => {
    if (req.headers.authorization || req.cookies?.token || req.cookies?.admin_token) {
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