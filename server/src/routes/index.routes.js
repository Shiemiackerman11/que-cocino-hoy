import express from "express";
import authRoutes from './auth.routes.js';
import cuentaRoutes from './cuenta.routes.js';
import categoriaRoutes from './categoria.routes.js';
import recetaRoutes from './receta.routes.js';
import adminRoutes from './admin.routes.js';

const router = express.Router();

router.get('/health', (req, res) => res.json({ ok: true }));

router.use('/auth', authRoutes);
router.use('/cuenta', cuentaRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/recetas', recetaRoutes);
router.use('/admin', adminRoutes);

//Rutas protegidas


export default router;