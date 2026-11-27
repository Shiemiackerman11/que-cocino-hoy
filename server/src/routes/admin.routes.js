import express from 'express';
import { verifyToken, requireRole } from '../../middlewares/authMiddleware.js';
import {
    resumen, listarUsuarios, cambiarEstadoUsuario,
    listarRecetasModeracion, validarReceta,
} from '../controllers/admin.controller.js';

const router = express.Router();

router.use(verifyToken, requireRole('admin'));

router.get('/resumen', resumen);

router.get('/usuarios', listarUsuarios);
router.patch('/usuarios/:id/estado', cambiarEstadoUsuario);

router.get('/recetas', listarRecetasModeracion);
router.patch('/recetas/:id/validacion', validarReceta);

export default router;
