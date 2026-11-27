import express from 'express';
import { verifyToken, authOpcional, requireRole } from '../../middlewares/authMiddleware.js';
import {
    listarRecetas, sugerirReceta, obtenerReceta, listarMisRecetas,
    crearReceta, actualizarReceta, eliminarReceta,
} from '../controllers/receta.controller.js';
import { puntuarReceta, eliminarPuntuacion } from '../controllers/puntuacion.controller.js';

const router = express.Router();

// Públicas (el orden importa: las rutas fijas van antes de /:id)
router.get('/', listarRecetas);
router.get('/sugerencia', sugerirReceta);

// Usuario autenticado
router.get('/mias', verifyToken, requireRole('usuario'), listarMisRecetas);
router.post('/', verifyToken, requireRole('usuario'), crearReceta);

// Detalle: público, pero el autor y los admins también ven recetas no publicadas
router.get('/:id', authOpcional, obtenerReceta);
router.put('/:id', verifyToken, requireRole('usuario'), actualizarReceta);
router.delete('/:id', verifyToken, requireRole('usuario', 'admin'), eliminarReceta);

router.post('/:id/puntuacion', verifyToken, requireRole('usuario'), puntuarReceta);
router.delete('/:id/puntuacion', verifyToken, requireRole('usuario'), eliminarPuntuacion);

export default router;
