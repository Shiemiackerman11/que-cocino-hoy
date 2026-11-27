import express from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import {
    listarFavoritos, agregarFavorito, quitarFavorito,
} from '../controllers/favorito.controller.js';

const router = express.Router();

router.use(verifyToken, requireRole('usuario'));

router.get('/', listarFavoritos);
router.post('/', agregarFavorito);
router.delete('/:id', quitarFavorito);

export default router;
