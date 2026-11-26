import express from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import {
    obtenerPerfil, actualizarPerfil, cambiarPassword, desactivarCuenta,
} from '../controllers/cuenta.controller.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', obtenerPerfil);
router.patch('/perfil', actualizarPerfil);
router.put('/password', cambiarPassword);
router.post('/desactivar', requireRole('usuario'), desactivarCuenta);

export default router;
