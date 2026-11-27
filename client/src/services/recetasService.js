// client/src/services/recetasService.js
// Las recetas vienen de Spoonacular a través de nuestro servidor Express:
// la API key nunca llega al navegador. Endpoints usados:
//   GET    /api/spoonacular/categorias
//   GET    /api/spoonacular/categorias/:id
//   GET    /api/spoonacular/recetas?q=&ingredientes=&categoria=&pagina=&limite=
//   GET    /api/spoonacular/recetas/:id
//   GET    /api/favoritos          (requiere sesión)
//   POST   /api/favoritos          (requiere sesión)
//   DELETE /api/favoritos/:id      (requiere sesión)
import { API_URL } from './config';
import { obtenerToken } from './authService';

export class ErrorApi extends Error {
  constructor(mensaje, status = 0, codigo) {
    super(mensaje);
    this.status = status;
    this.codigo = codigo;
  }
}

async function pedir(ruta, { metodo = 'GET', cuerpo, requiereSesion = false, signal } = {}) {
  const token = obtenerToken();
  if (requiereSesion && !token) throw new ErrorApi('Inicia sesión para continuar.', 401);

  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      signal,
      headers: {
        ...(cuerpo ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ErrorApi('No se pudo conectar con el servidor. Revisa que esté encendido.');
  }

  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw new ErrorApi(
      datos.error || datos.mensaje || 'No se pudo completar la solicitud.',
      respuesta.status,
      datos.codigo
    );
  }
  return datos;
}

const consulta = (parametros) => {
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(parametros)) {
    if (valor !== undefined && valor !== null && valor !== '') params.set(clave, valor);
  }
  return params.toString();
};

// ---------- Categorías ----------
export const obtenerCategorias = () => pedir('/spoonacular/categorias');

export const obtenerCategoria = (id) => pedir(`/spoonacular/categorias/${encodeURIComponent(id)}`);

// ---------- Recetas ----------
// Devuelve { datos: [...], paginacion: { pagina, limite, total, total_paginas } }
export function buscarRecetas({ q, ingredientes = [], categoria, pagina = 1, limite = 12, signal } = {}) {
  const parametros = consulta({
    q,
    ingredientes: ingredientes.join(','),
    categoria,
    pagina,
    limite,
  });
  return pedir(`/spoonacular/recetas?${parametros}`, { signal });
}

export const obtenerRecetasPorCategoria = (categoriaId, opciones = {}) =>
  buscarRecetas({ ...opciones, categoria: categoriaId });

// Si hay sesión, la respuesta incluye `favorita`.
export const obtenerReceta = (id) => pedir(`/spoonacular/recetas/${encodeURIComponent(id)}`);

// ---------- Favoritos ----------
// Devuelve { total, datos: [...] }
export const obtenerFavoritos = () => pedir('/favoritos', { requiereSesion: true });

export const agregarFavorito = (id) =>
  pedir('/favoritos', { metodo: 'POST', cuerpo: { spoonacular_id: Number(id) }, requiereSesion: true });

export const quitarFavorito = (id) =>
  pedir(`/favoritos/${encodeURIComponent(id)}`, { metodo: 'DELETE', requiereSesion: true });
