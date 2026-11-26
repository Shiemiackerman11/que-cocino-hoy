// JWT HS256 mínimo con el módulo crypto de Node (evita agregar dependencias).
import crypto from 'node:crypto';
import { JWT_SECRET, JWT_EXPIRES_IN_SEGUNDOS } from '../config/env.js';

const b64url = (valor) => Buffer.from(valor).toString('base64url');
const firmar = (contenido) =>
    crypto.createHmac('sha256', JWT_SECRET).update(contenido).digest();

export function signToken(payload, expiraEnSegundos = JWT_EXPIRES_IN_SEGUNDOS) {
    const ahora = Math.floor(Date.now() / 1000);
    const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const cuerpo = b64url(JSON.stringify({ ...payload, iat: ahora, exp: ahora + expiraEnSegundos }));
    const firma = firmar(`${header}.${cuerpo}`).toString('base64url');
    return `${header}.${cuerpo}.${firma}`;
}

// Devuelve el payload si el token es válido y no ha expirado; si no, null.
export function verifyJwt(token) {
    if (typeof token !== 'string') return null;
    const partes = token.split('.');
    if (partes.length !== 3) return null;

    const [header, cuerpo, firma] = partes;
    const esperada = firmar(`${header}.${cuerpo}`);
    const recibida = Buffer.from(firma, 'base64url');
    if (recibida.length !== esperada.length || !crypto.timingSafeEqual(recibida, esperada)) {
        return null;
    }

    try {
        const payload = JSON.parse(Buffer.from(cuerpo, 'base64url').toString('utf8'));
        if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
        return payload;
    } catch {
        return null;
    }
}
