import express from 'express';
import { authOpcional } from '../middlewares/authMiddleware.js';
import {
    listarCategorias, obtenerCategoria, listarRecetas, obtenerReceta,
} from '../controllers/spoonacular.controller.js';

const router = express.Router();

router.get('/categorias', listarCategorias);
router.get('/categorias/:id', obtenerCategoria);

router.get('/recetas', listarRecetas);
// Público; con sesión de usuario además indica si la receta es favorita.
router.get('/recetas/:id', authOpcional, obtenerReceta);

export default router;
