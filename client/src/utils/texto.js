// client/src/utils/texto.js
// Minúsculas y sin acentos, para buscar sin importar cómo se escriba.
export function normalizar(texto = '') {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}


// 45 -> "45 min", 90 -> "1 h 30 min", sin dato -> "N/D".
export function formatearTiempo(minutos) {
  if (!Number.isFinite(minutos) || minutos <= 0) return 'N/D';
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto ? `${horas} h ${resto} min` : `${horas} h`;
}

// Texto de la tarjeta de categoría. Si el servidor no pudo contar (cuota agotada, etc.), no inventa un número.
export function etiquetaCantidad(cantidad) {
  if (!Number.isFinite(cantidad)) return 'Ver recetas';
  return `${cantidad.toLocaleString('es-MX')} ${cantidad === 1 ? 'platillo' : 'platillos'}`;
}
