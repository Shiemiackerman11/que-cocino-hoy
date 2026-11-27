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

// Spoonacular: la clave vive solo en el servidor (.env). Si falta, el servidor arranca igual
// y las rutas de recetas responden 503 con un mensaje claro.
export const SPOONACULAR_API_KEY = (process.env.SPOONACULAR_API_KEY || '').trim();
export const SPOONACULAR_BASE_URL = process.env.SPOONACULAR_BASE_URL || 'https://api.spoonacular.com';
// El plan gratuito limita cuánto tiempo se puede guardar en caché la información de Spoonacular
// (consulta los términos de tu plan antes de subir este valor).
export const SPOONACULAR_CACHE_MINUTOS = numero(process.env.SPOONACULAR_CACHE_MINUTOS, 60);
