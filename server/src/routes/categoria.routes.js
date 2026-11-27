import express from 'express';
import { verifyToken, requireRole } from '../../middlewares/authMiddleware.js';
import {
    listarCategorias, crearCategoria, actualizarCategoria, eliminarCategoria,
} from '../controllers/categoria.controller.js';

const router = express.Router();

router.get('/', listarCategorias);

router.post('/', verifyToken, requireRole('admin'), crearCategoria);
router.put('/:id', verifyToken, requireRole('admin'), actualizarCategoria);
router.delete('/:id', verifyToken, requireRole('admin'), eliminarCategoria);

export default router;
