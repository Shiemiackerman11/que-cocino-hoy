// Acceso a la API de Spoonacular. Todo pasa por aquí: la clave nunca sale del servidor.
import axios from 'axios';
import { SPOONACULAR_API_KEY, SPOONACULAR_BASE_URL, SPOONACULAR_CACHE_MINUTOS } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';
import { crearCache } from '../utils/cache.js';
import { traducirTermino } from '../utils/traduccion.js';
import { clasificarReceta } from '../config/categorias-spoonacular.js';

if (!SPOONACULAR_API_KEY) {
    console.warn('[spoonacular] Falta SPOONACULAR_API_KEY en el .env: las rutas de recetas responderán 503.');
}

const cliente = axios.create({ baseURL: SPOONACULAR_BASE_URL, timeout: 10000 });
const cache = crearCache({ ttlMs: SPOONACULAR_CACHE_MINUTOS * 60 * 1000 });

// complexSearch no permite offset mayor a 900.
const OFFSET_MAXIMO = 900;

// ---------- Llamadas ----------
function traducirError(error) {
    if (error instanceof HttpError) return error;
    const status = error.response?.status;

    if (status === 404) return new HttpError(404, 'Receta no encontrada');
    if (status === 402 || status === 429) {
        return new HttpError(503, 'Se alcanzó el límite de consultas del servicio de recetas. Inténtalo más tarde.', 'SPOONACULAR_LIMITE');
    }
    if (status === 401 || status === 403) {
        console.error('[spoonacular] La API key fue rechazada. Revisa SPOONACULAR_API_KEY en el .env.');
        return new HttpError(503, 'El servicio de recetas no está disponible por ahora', 'SPOONACULAR_CLAVE');
    }
    if (error.code === 'ECONNABORTED') {
        return new HttpError(504, 'El servicio de recetas tardó demasiado en responder');
    }
    console.error('[spoonacular] Error de red o respuesta inesperada:', error.message);
    return new HttpError(502, 'No se pudo consultar el servicio de recetas');
}

async function pedir(ruta, params = {}) {
    if (!SPOONACULAR_API_KEY) {
        throw new HttpError(503, 'El servicio de recetas no está configurado', 'SPOONACULAR_SIN_CLAVE');
    }
    try {
        // La clave va en una cabecera (no en la URL) para que no aparezca en logs ni en errores.
        const { data } = await cliente.get(ruta, { params, headers: { 'x-api-key': SPOONACULAR_API_KEY } });
        return data;
    } catch (error) {
        throw traducirError(error);
    }
}

// Solo recetas con instrucciones, para que el detalle siempre pueda mostrar los pasos.
const FILTROS_BASE = { instructionsRequired: true };

// Cantidad de recetas de una categoría (1 consulta mínima por categoría; se cachea).
export function contarRecetasCategoria(categoria) {
    return cache.obtener(`conteo:${categoria.id}`, async () => {
        const datos = await pedir('/recipes/complexSearch', {
            ...FILTROS_BASE, ...categoria.spoonacular, number: 1,
        });
        return datos.totalResults ?? 0;
    });
}

// Búsqueda por nombre, por ingredientes y/o por categoría, con paginación.
export async function buscarRecetas({ q, ingredientes = [], categoria = null, limite, offset }) {
    if (offset > OFFSET_MAXIMO) return { resultados: [], total: 0 };

    const params = { ...FILTROS_BASE, addRecipeInformation: true, number: limite, offset };
    if (categoria) Object.assign(params, categoria.spoonacular);
    if (q) params.query = traducirTermino(q);
    if (ingredientes.length) params.includeIngredients = ingredientes.map(traducirTermino).join(',');
    // Navegar una categoría: las más populares primero. Con texto de búsqueda manda la relevancia.
    if (categoria && !q) Object.assign(params, { sort: 'popularity', sortDirection: 'desc' });

    const clave = `busqueda:${JSON.stringify(params)}`;
    const datos = await cache.obtener(clave, () => pedir('/recipes/complexSearch', params));
    return { resultados: datos.results ?? [], total: datos.totalResults ?? 0 };
}

// Receta completa (ingredientes, pasos, tiempo...). Se reutiliza al guardar favoritos.
export function obtenerRecetaSpoonacular(id) {
    return cache.obtener(`detalle:${id}`, () =>
        pedir(`/recipes/${id}/information`, { includeNutrition: false })
    );
}

// Varias recetas con una sola consulta (se usa en la lista de favoritos).
export async function obtenerRecetasSpoonacular(ids) {
    const resultado = new Map();
    const faltantes = [];
    for (const id of ids) {
        const guardada = cache.leer(`detalle:${id}`);
        if (guardada) resultado.set(id, guardada);
        else faltantes.push(id);
    }

    if (faltantes.length) {
        const recetas = await pedir('/recipes/informationBulk', {
            ids: faltantes.join(','), includeNutrition: false,
        });
        for (const receta of recetas ?? []) {
            cache.poner(`detalle:${receta.id}`, receta);
            resultado.set(receta.id, receta);
        }
    }
    return resultado;
}

// ---------- Conversión a la forma que usa el cliente ----------
const ENTIDADES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&#39;': "'", '&nbsp;': ' ' };

// Spoonacular devuelve resúmenes e instrucciones con HTML: aquí se pasa a texto plano.
export function htmlATexto(html = '') {
    return String(html ?? '')
        .replace(/<\s*(br|\/p|\/li|\/div|\/h\d)\s*\/?>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&(?:amp|lt|gt|quot|apos|nbsp|#39);/g, (m) => ENTIDADES[m])
        .replace(/[ \t]+/g, ' ')
        .replace(/\s*\n\s*/g, '\n')
        .trim();
}

function resumenCorto(html, max = 140) {
    const texto = htmlATexto(html).replace(/\s+/g, ' ');
    if (texto.length <= max) return texto;
    const corte = texto.slice(0, max).replace(/\s+\S*$/, '');
    return `${corte}…`;
}

const contarPasos = (instrucciones = []) =>
    (instrucciones ?? []).reduce((total, grupo) => total + (grupo.steps?.length ?? 0), 0);

// Spoonacular no tiene un campo de "complejidad": se estima con el tiempo y la cantidad de pasos
// (datos que vienen tanto en el listado como en el detalle, así la etiqueta es la misma en ambos).
export function calcularComplejidad(receta) {
    const puntos = [];
    const tiempo = receta.readyInMinutes;
    if (Number.isFinite(tiempo) && tiempo > 0) puntos.push(tiempo <= 20 ? 0 : tiempo <= 45 ? 1 : 2);
    const pasos = contarPasos(receta.analyzedInstructions);
    if (pasos > 0) puntos.push(pasos <= 4 ? 0 : pasos <= 8 ? 1 : 2);

    if (!puntos.length) return null;
    const promedio = puntos.reduce((a, b) => a + b, 0) / puntos.length;
    if (promedio <= 0.5) return 'Baja';
    return promedio <= 1.5 ? 'Media' : 'Alta';
}

export function aRecetaLista(receta, categoriaFija = null) {
    const categoria = categoriaFija ?? clasificarReceta(receta.dishTypes, receta.vegetarian);
    return {
        id: receta.id,
        titulo: receta.title,
        descripcion: resumenCorto(receta.summary),
        imagen: receta.image ?? null,
        tiempo: Number.isFinite(receta.readyInMinutes) && receta.readyInMinutes > 0 ? receta.readyInMinutes : null,
        complejidad: calcularComplejidad(receta),
        categoriaId: categoria.id,
        categoria: categoria.nombre,
    };
}

function formatearCantidad(ingrediente) {
    // Unidades métricas cuando existen (más naturales para México); si no, las originales.
    const medida = ingrediente.measures?.metric ?? {};
    const cantidad = medida.amount ?? ingrediente.amount;
    const unidad = medida.unitShort ?? ingrediente.unit ?? '';
    if (!Number.isFinite(cantidad) || cantidad <= 0) return '';
    const numero = cantidad >= 10 ? Math.round(cantidad) : Math.round(cantidad * 100) / 100;
    return `${numero} ${unidad}`.trim();
}

// Las URLs vienen de un tercero y el cliente las usa en un enlace: solo se aceptan http(s).
function urlHttp(valor) {
    try {
        const url = new URL(valor);
        return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
    } catch {
        return null;
    }
}

const capitalizar = (texto = '') => texto.charAt(0).toUpperCase() + texto.slice(1);

function extraerIngredientes(receta) {
    return (receta.extendedIngredients ?? []).map((ing) => ({
        cantidad: formatearCantidad(ing),
        nombre: capitalizar(ing.originalName || ing.name || ing.original || ''),
    }));
}

function extraerPasos(receta) {
    const pasos = [];
    for (const grupo of receta.analyzedInstructions ?? []) {
        for (const paso of grupo.steps ?? []) {
            const numero = pasos.length + 1;
            pasos.push({
                titulo: grupo.name ? `Paso ${numero} · ${grupo.name}` : `Paso ${numero}`,
                texto: String(paso.step ?? '').trim(),
            });
        }
    }
    if (pasos.length) return pasos;

    // Respaldo: algunas recetas solo traen el texto de "instructions".
    const texto = htmlATexto(receta.instructions);
    if (!texto) return [];
    let trozos = texto.split('\n').filter(Boolean);
    if (trozos.length === 1) trozos = texto.split(/(?<=[.!?])\s+(?=[A-Z])/);
    return trozos.map((t, i) => ({ titulo: `Paso ${i + 1}`, texto: t.trim() }));
}

export function aRecetaDetalle(receta) {
    return {
        ...aRecetaLista(receta),
        descripcionLarga: htmlATexto(receta.summary),
        porciones: receta.servings ?? null,
        ingredientes: extraerIngredientes(receta),
        pasos: extraerPasos(receta),
        // Spoonacular pide atribución en el plan gratuito.
        fuente: {
            nombre: receta.creditsText || receta.sourceName || null,
            url: urlHttp(receta.sourceUrl),
        },
        spoonacularUrl: urlHttp(receta.spoonacularSourceUrl) ?? 'https://spoonacular.com',
    };
}
