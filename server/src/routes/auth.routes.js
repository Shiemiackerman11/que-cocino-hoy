import express from 'express';
import {
    registrarUsuario, registrarAdmin,
    loginUsuario, loginAdmin,
    verificarCorreo, reenviarVerificacion,
    logoutUsuario, logoutAdmin,
    verificarSesion,
} from '../controllers/auth.controller.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Registro
router.post('/registro', registrarUsuario);
router.post('/admin/registro', registrarAdmin);

// Login
router.post('/login', loginUsuario);
router.post('/admin/login', loginAdmin);

// Logout
router.post('/logout', logoutUsuario);
router.post('/admin/logout', logoutAdmin);

// Verificar sesión activa (el front llama esto al cargar la app)
router.get('/sesion', verifyToken, verificarSesion('usuario'));
router.get('/admin/sesion', verifyToken, requireRole('admin'), verificarSesion('admin'));

// Verificación de correo
router.post('/verificar-correo', verificarCorreo);
router.post('/reenviar-verificacion', reenviarVerificacion);

export default router;