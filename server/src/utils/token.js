import crypto from 'node:crypto';

export const hashToken = (token) =>
    crypto.createHash('sha256').update(String(token)).digest('hex');

// El token en claro solo viaja por correo; en la BD se guarda únicamente su hash.
export function generarTokenVerificacion() {
    const token = crypto.randomBytes(32).toString('hex');
    return { token, tokenHash: hashToken(token) };
}
