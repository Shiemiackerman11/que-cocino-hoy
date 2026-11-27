import express from 'express';
import { JWT_COOKIE_NAME, JWT_COOKIE_OPTIONS } from '../config/env.js';
import {
    registrarUsuario, registrarAdmin, loginUsuario, loginAdmin,
    verificarCorreo, reenviarVerificacion,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario);
router.post('/admin/registro', registrarAdmin);
router.post('/admin/login', loginAdmin);
router.post('/logout', (_req, res) => {
    res.clearCookie(JWT_COOKIE_NAME, JWT_COOKIE_OPTIONS);
    res.json({ ok: true });
});
router.post('/verificar-correo', verificarCorreo);
router.post('/reenviar-verificacion', reenviarVerificacion);

export default router;
