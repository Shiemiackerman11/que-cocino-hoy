import express from 'express';
import {
    registrarUsuario, registrarAdmin, loginUsuario, loginAdmin,
    verificarCorreo, reenviarVerificacion,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario);
router.post('/admin/registro', registrarAdmin);
router.post('/admin/login', loginAdmin);
router.post('/verificar-correo', verificarCorreo);
router.post('/reenviar-verificacion', reenviarVerificacion);

export default router;
