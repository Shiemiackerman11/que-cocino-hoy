// client/src/utils/texto.js
// Minúsculas y sin acentos, para buscar sin importar cómo se escriba.
export function normalizar(texto = '') {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}
