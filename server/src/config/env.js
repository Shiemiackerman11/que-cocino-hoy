import 'dotenv/config';

const numero = (valor, porDefecto) => {
    const n = Number(valor);
    return Number.isFinite(n) && n > 0 ? n : porDefecto;
};

export const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 16) {
    throw new Error('Define JWT_SECRET (mínimo 16 caracteres) en el archivo .env');
}

export const JWT_EXPIRES_IN_SEGUNDOS = numero(process.env.JWT_EXPIRES_IN_HORAS, 12) * 3600;
export const TOKEN_VERIFICACION_HORAS = numero(process.env.TOKEN_VERIFICACION_HORAS, 24);
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Si está vacía, el registro de administradores queda deshabilitado.
export const ADMIN_REGISTRATION_KEY = process.env.ADMIN_REGISTRATION_KEY || '';

export const SMTP = {
    host: process.env.SMTP_HOST,
    port: numero(process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || '¿Qué cocino hoy? <no-reply@quecocinohoy.local>',
};
