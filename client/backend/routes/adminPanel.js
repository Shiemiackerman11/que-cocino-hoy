// backend/routes/adminPanel.js
const express = require('express');
const db = require('../db');
const { verificarAdmin } = require('../middleware/authAdmin');

const router = express.Router();

// GET /api/admin/recetas-pendientes
router.get('/recetas-pendientes', verificarAdmin, async (req, res) => {
  try {
    // Ejemplo de consulta: recetas que aún no tienen aprobación
    const resultado = await db.query(
      `SELECT r.id_receta, r.nom_receta, r.ingredientes, r.pasos, r.foto,
              u.nom_pla AS usuario_nombre
       FROM receta r
       JOIN usuario u ON r.id_usuario = u.id_usuario
       ORDER BY r.id_receta DESC`
    );

    res.json({ recetas: resultado.rows });
  } catch (err) {
    console.error('Error al obtener recetas:', err);
    res.status(500).json({ error: 'Error al obtener recetas.' });
  }
});

// GET /api/admin/perfil (para probar la sesión)
router.get('/perfil', verificarAdmin, (req, res) => {
  res.json({
    message: 'Bienvenido al panel de administración',
    admin: req.admin,
  });
});

module.exports = router;