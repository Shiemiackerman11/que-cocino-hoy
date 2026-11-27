import { HttpError } from './httpError.js';

export function validarCorreo(valor) {
    const correo = String(valor ?? '').trim().toLowerCase();
    if (!correo || correo.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        throw new HttpError(400, 'El correo no es válido');
    }
    return correo;
}

// bcrypt solo considera los primeros 72 bytes, por eso el máximo.
export function validarPassword(valor) {
    if (
        typeof valor !== 'string' ||
        valor.length < 8 ||
        valor.length > 72 ||
        !/[A-Za-z]/.test(valor) ||
        !/\d/.test(valor)
    ) {
        throw new HttpError(400, 'La contraseña debe tener entre 8 y 72 caracteres, con al menos una letra y un número');
    }
    return valor;
}

export function validarTexto(valor, campo, { max, requerido = true } = {}) {
    if (valor === undefined || valor === null || (typeof valor === 'string' && !valor.trim())) {
        if (requerido) throw new HttpError(400, `${campo} es obligatorio`);
        return null;
    }
    if (typeof valor !== 'string') throw new HttpError(400, `${campo} debe ser texto`);
    const texto = valor.trim();
    if (max && texto.length > max) {
        throw new HttpError(400, `${campo} no puede exceder ${max} caracteres`);
    }
    return texto;
}

export function validarFechaNacimiento(valor) {
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        throw new HttpError(400, 'La fecha de nacimiento no es válida');
    }

    const [anio, mes, dia] = valor.split('-').map(Number);
    const esBisiesto = anio % 4 === 0 && (anio % 100 !== 0 || anio % 400 === 0);
    const diasPorMes = [31, esBisiesto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (anio < 1 || mes < 1 || mes > 12 || dia < 1 || dia > diasPorMes[mes - 1]) {
        throw new HttpError(400, 'La fecha de nacimiento no es válida');
    }

    const hoy = new Date();
    const anioLimite = hoy.getFullYear() - 18;
    const mesActual = hoy.getMonth() + 1;
    const ultimoDiaDelMesLimite = new Date(anioLimite, mesActual, 0).getDate();
    const diaLimite = Math.min(hoy.getDate(), ultimoDiaDelMesLimite);
    const fechaLimite = [
        String(anioLimite).padStart(4, '0'),
        String(mesActual).padStart(2, '0'),
        String(diaLimite).padStart(2, '0'),
    ].join('-');

    if (valor > fechaLimite) {
        throw new HttpError(400, 'Debes tener al menos 18 años para registrarte');
    }
    return valor;
}

export function validarId(valor, campo = 'El id') {
    const n = Number(valor);
    if (!Number.isInteger(n) || n < 1 || n > 2147483647) {
        throw new HttpError(400, `${campo} no es válido`);
    }
    return n;
}

export function validarListaIds(valor, campo) {
    if (!Array.isArray(valor)) throw new HttpError(400, `${campo} debe ser una lista de ids`);
    return [...new Set(valor.map((v) => validarId(v, `Un id de ${campo}`)))];
}

// Ingredientes y pasos se guardan como TEXT, un elemento por línea.
export function validarLista(valor, campo, max = 10000) {
    let texto;
    if (Array.isArray(valor)) {
        const items = valor.map((v) => (typeof v === 'string' ? v.trim() : '')).filter(Boolean);
        if (!items.length) throw new HttpError(400, `${campo} es obligatorio`);
        texto = items.join('\n');
    } else {
        texto = validarTexto(valor, campo, { max });
    }
    if (texto.length > max) throw new HttpError(400, `${campo} no puede exceder ${max} caracteres`);
    return texto;
}

export function paginacion(query, maxLimite = 50) {
    const pagina = Math.max(parseInt(query.pagina, 10) || 1, 1);
    const limite = Math.min(Math.max(parseInt(query.limite, 10) || 12, 1), maxLimite);
    return { pagina, limite, offset: (pagina - 1) * limite };
}

// Escapa comodines de LIKE/ILIKE para que el texto del usuario se busque literal.
export const escapeLike = (texto) => texto.replace(/[\\%_]/g, '\\$&');
