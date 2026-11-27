import express from "express";
import authRoutes from './auth.routes.js';
import cuentaRoutes from './cuenta.routes.js';
import categoriaRoutes from './categoria.routes.js';
import recetaRoutes from './receta.routes.js';
import adminRoutes from './admin.routes.js';
import spoonacularRoutes from './spoonacular.routes.js';
import favoritoRoutes from './favorito.routes.js';

const router = express.Router();

router.get('/health', (req, res) => res.json({ ok: true }));

router.use('/auth', authRoutes);
router.use('/cuenta', cuentaRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/recetas', recetaRoutes);
router.use('/admin', adminRoutes);
router.use('/spoonacular', spoonacularRoutes);
router.use('/favoritos', favoritoRoutes);

//Rutas protegidas


export default router;