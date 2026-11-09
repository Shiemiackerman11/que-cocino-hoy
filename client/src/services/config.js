// client/src/services/config.js
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

// Mientras el servidor Express no esté listo, los servicios responden con datos de demostración.
// Cambia a false para que usen la API real.
export const USAR_DATOS_DEMO = true;

export const esperar = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));
