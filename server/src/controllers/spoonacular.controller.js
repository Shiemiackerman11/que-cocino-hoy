import { pool } from '../../db.js';
import { HttpError } from '../utils/httpError.js';
import { paginacion, validarId } from '../utils/validators.js';
import {
    buscarCategoria, categoriaPublica, categoriasOrdenadas,
} from '../config/categorias-spoonacular.js';
import {
    aRecetaDetalle, aRecetaLista, buscarRecetas, contarRecetasCategoria, obtenerRecetaSpoonacular,
} from '../services/spoonacular.service.js';

const MAX_INGREDIENTES = 10;
const MAX_LARGO_TERMINO = 100;

// Si el conteo falla (cuota agotada, sin clave...) la categoría se muestra igual, sin número.
async function conCantidad(categoria) {
    let cantidad = null;
    try {
        cantidad = await contarRecetasCategoria(categoria);
    } catch (error) {
        console.error(`[spoonacular] No se pudo contar la categoría "${categoria.id}": ${error.message}`);
    }
    return { ...categoriaPublica(categoria), cantidad };
}

// ---------- Categorías ----------
export const listarCategorias = async (req, res) => {
    res.json(await Promise.all(categoriasOrdenadas().map(conCantidad)));
};

export const obtenerCategoria = async (req, res) => {
    const categoria = buscarCategoria(String(req.params.id));
    if (!categoria) throw new HttpError(404, 'Categoría no encontrada');
    res.json(await conCantidad(categoria));
};

// ---------- Recetas ----------
function textoOpcional(valor, campo) {
    if (typeof valor !== 'string' || !valor.trim()) return '';
    const texto = valor.trim();
    if (texto.length > MAX_LARGO_TERMINO) {
        throw new HttpError(400, `${campo} no puede exceder ${MAX_LARGO_TERMINO} caracteres`);
    }
    return texto;
}

function listaIngredientes(valor) {
    if (typeof valor !== 'string') return [];
    return valor
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.slice(0, 40))
        .slice(0, MAX_INGREDIENTES);
}

// GET /api/spoonacular/recetas?q=&ingredientes=a,b&categoria=postres&pagina=1&limite=12
export const listarRecetas = async (req, res) => {
    const q = textoOpcional(req.query.q, 'La búsqueda');
    const ingredientes = listaIngredientes(req.query.ingredientes);

    let categoria = null;
    if (typeof req.query.categoria === 'string' && req.query.categoria) {
        categoria = buscarCategoria(req.query.categoria);
        if (!categoria) throw new HttpError(404, 'Categoría no encontrada');
    }
    if (!q && !ingredientes.length && !categoria) {
        throw new HttpError(400, 'Indica un texto de búsqueda, ingredientes o una categoría');
    }

    const { pagina, limite, offset } = paginacion(req.query, 24);
    const { resultados, total } = await buscarRecetas({ q, ingredientes, categoria, limite, offset });

    res.json({
        datos: resultados.map((r) => aRecetaLista(r, categoria)),
        paginacion: { pagina, limite, total, total_paginas: Math.ceil(total / limite) },
    });
};

// GET /api/spoonacular/recetas/:id  (con sesión de usuario también indica si es favorita)
export const obtenerReceta = async (req, res) => {
    const id = validarId(req.params.id);
    const receta = aRecetaDetalle(await obtenerRecetaSpoonacular(id));

    receta.favorita = false;
    if (req.auth?.rol === 'usuario') {
        const { rowCount } = await pool.query(
            'SELECT 1 FROM favorito_api WHERE id_usuario = $1 AND spoonacular_id = $2',
            [req.auth.id, id]
        );
        receta.favorita = rowCount > 0;
    }
    res.json(receta);
};
