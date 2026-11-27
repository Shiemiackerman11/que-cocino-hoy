import { HttpError } from '../utils/httpError.js';

export const notFound = (req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
};

// Express 5 envía aquí los errores (también los de funciones async).
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
    if (err instanceof HttpError) {
        return res.status(err.status).json({
            error: err.message,
            ...(err.codigo && { codigo: err.codigo }),
        });
    }
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
    }
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ error: 'El cuerpo de la petición es demasiado grande' });
    }
    // Errores de PostgreSQL
    if (err.code === '23505') return res.status(409).json({ error: 'Ya existe un registro con esos datos' });
    if (err.code === '23503') return res.status(409).json({ error: 'La operación depende de otros registros que no existen o están en uso' });
    if (err.code === '23514') return res.status(409).json({ error: 'La operación no cumple las reglas de la base de datos' });

    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
};
