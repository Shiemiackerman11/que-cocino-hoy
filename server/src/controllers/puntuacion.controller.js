import { pool } from '../../db.js';
import { HttpError } from '../utils/httpError.js';
import { conTransaccion } from '../utils/transaccion.js';
import { validarId } from '../utils/validators.js';

// receta.puntaje guarda el promedio (2 decimales) y se recalcula con cada cambio.
// Queda NULL cuando ya no hay votos.
async function recalcularPuntaje(client, idReceta) {
    const { rows } = await client.query(
        `UPDATE receta
            SET puntaje = (SELECT ROUND(AVG(valor)::numeric, 2)::double precision
                             FROM puntuacion WHERE id_receta = $1)
          WHERE id_receta = $1
      RETURNING puntaje,
                (SELECT COUNT(*)::int FROM puntuacion WHERE id_receta = $1) AS total_votos`,
        [idReceta]
    );
    return rows[0];
}

export const puntuarReceta = async (req, res) => {
    const idReceta = validarId(req.params.id);
    const valor = (req.body ?? {}).valor;
    if (!Number.isInteger(valor) || valor < 1 || valor > 5) {
        throw new HttpError(400, 'La puntuación debe ser un número entero del 1 al 5');
    }

    const resultado = await conTransaccion(async (client) => {
        // Bloquear la receta serializa los votos simultáneos y evita promedios desactualizados.
        const { rows } = await client.query(
            'SELECT id_usuario, estado_receta FROM receta WHERE id_receta = $1 FOR UPDATE',
            [idReceta]
        );
        const receta = rows[0];
        if (!receta || receta.estado_receta !== 'PUBLICADA') {
            throw new HttpError(404, 'Receta no encontrada');
        }
        if (receta.id_usuario === req.auth.id) {
            throw new HttpError(403, 'No puedes puntuar tu propia receta');
        }

        await client.query(
            `INSERT INTO puntuacion (id_usuario, id_receta, valor)
             VALUES ($1, $2, $3)
             ON CONFLICT (id_usuario, id_receta)
             DO UPDATE SET valor = EXCLUDED.valor, fecha = now()`,
            [req.auth.id, idReceta, valor]
        );
        return recalcularPuntaje(client, idReceta);
    });

    res.json({ mensaje: 'Puntuación registrada', mi_puntuacion: valor, ...resultado });
};

export const eliminarPuntuacion = async (req, res) => {
    const idReceta = validarId(req.params.id);

    const resultado = await conTransaccion(async (client) => {
        await client.query('SELECT 1 FROM receta WHERE id_receta = $1 FOR UPDATE', [idReceta]);
        const { rowCount } = await client.query(
            'DELETE FROM puntuacion WHERE id_usuario = $1 AND id_receta = $2',
            [req.auth.id, idReceta]
        );
        if (!rowCount) throw new HttpError(404, 'No has puntuado esta receta');
        return recalcularPuntaje(client, idReceta);
    });

    res.json({ mensaje: 'Puntuación eliminada', mi_puntuacion: null, ...resultado });
};
