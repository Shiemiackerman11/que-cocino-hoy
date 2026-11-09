// client/src/services/recetasService.js
// Endpoints esperados en el servidor Express:
//   GET /api/categorias
//   GET /api/categorias/:id
//   GET /api/recetas?categoria=:id
//   GET /api/recetas/:id
import { API_URL, USAR_DATOS_DEMO, esperar } from './config';
import { CATEGORIAS, RECETAS } from './mockData';

async function pedir(ruta) {
  const respuesta = await fetch(`${API_URL}${ruta}`);
  if (respuesta.status === 404) throw new Error('No encontrado');
  if (!respuesta.ok) throw new Error('No se pudo completar la solicitud.');
  return respuesta.json();
}

export async function obtenerCategorias() {
  if (!USAR_DATOS_DEMO) return pedir('/categorias');
  await esperar();
  return CATEGORIAS;
}

export async function obtenerCategoria(id) {
  if (!USAR_DATOS_DEMO) return pedir(`/categorias/${id}`);
  await esperar();
  const categoria = CATEGORIAS.find((c) => c.id === id);
  if (!categoria) throw new Error('No encontrado');
  return categoria;
}

export async function obtenerRecetasPorCategoria(categoriaId) {
  if (!USAR_DATOS_DEMO) return pedir(`/recetas?categoria=${encodeURIComponent(categoriaId)}`);
  await esperar();
  return RECETAS.filter((r) => r.categoriaId === categoriaId);
}

export async function obtenerReceta(id) {
  if (!USAR_DATOS_DEMO) return pedir(`/recetas/${id}`);
  await esperar();
  const receta = RECETAS.find((r) => String(r.id) === String(id));
  if (!receta) throw new Error('No encontrado');
  return receta;
}
