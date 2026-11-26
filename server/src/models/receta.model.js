import { pool } from '../../db.js';

// Columnas comunes para listados y detalle de recetas.
export const CAMPOS_LISTA = `
    r.id_receta, r.nom_receta, r.foto, r.puntaje, r.estado_receta,
    r.fecha_subida, r.id_usuario,
    (u.nom_pla || ' ' || u.prim_ap) AS autor,
    (SELECT COUNT(*)::int FROM puntuacion p WHERE p.id_receta = r.id_receta) AS total_votos,
    COALESCE((
        SELECT json_agg(
            json_build_object('id_categoria', c.id_categoria, 'nom_categoria', c.nom_categoria)
            ORDER BY c.nom_categoria
        )
        FROM clasifica cl
        JOIN categoria c ON c.id_categoria = cl.id_categoria
        WHERE cl.id_receta = r.id_receta
    ), '[]'::json) AS categorias`;

export const FROM_RECETA = `FROM receta r JOIN usuario u ON u.id_usuario = r.id_usuario`;

export async function consultarReceta(idReceta) {
    const { rows } = await pool.query(
        `SELECT ${CAMPOS_LISTA}, r.ingredientes, r.pasos, r.fecha_validacion
         ${FROM_RECETA}
         WHERE r.id_receta = $1`,
        [idReceta]
    );
    return rows[0] ?? null;
}
