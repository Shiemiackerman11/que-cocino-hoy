// client/src/services/authService.js
// Endpoints esperados: POST /api/auth/login y POST /api/auth/registro
import { API_URL, USAR_DATOS_DEMO, esperar } from './config';

const CLAVE_USUARIO = 'qch_usuario';
const CLAVE_TOKEN = 'qch_token';

export function obtenerUsuario() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_USUARIO));
  } catch {
    return null;
  }
}

// JWT de la sesión real (en modo demostración no existe).
export function obtenerToken() {
  return localStorage.getItem(CLAVE_TOKEN);
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE_USUARIO);
  localStorage.removeItem(CLAVE_TOKEN);
}

function guardarSesion(usuario, token) {
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
  if (token) localStorage.setItem(CLAVE_TOKEN, token);
}

async function enviar(ruta, cuerpo, mensajeError) {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.error || datos.mensaje || mensajeError);
  return datos;
}

export async function loginUsuario(email, password) {
  if (USAR_DATOS_DEMO) {
    await esperar(400);
    if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
    const nombre = email.split('@')[0];
    const usuario = {
      nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1),
      correo: email,
      inicial: nombre.charAt(0).toUpperCase(),
    };
    guardarSesion(usuario);
    return usuario;
  }
  const datos = await enviar('/auth/login', { correo: email, password }, 'Correo o contraseña incorrectos.');
  const nombre = datos.cuenta?.nom_pla ?? email.split('@')[0];
  const usuario = {
    nombre: `${nombre} ${datos.cuenta?.prim_ap ?? ''}`.trim(),
    correo: datos.cuenta?.correo ?? email,
    inicial: nombre.charAt(0).toUpperCase(),
  };
  guardarSesion(usuario, datos.token);
  return usuario;
}

export async function registrarUsuario(datos) {
  if (USAR_DATOS_DEMO) {
    await esperar(400);
    if (datos.password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
    return { ok: true };
  }
  return enviar('/auth/registro', datos, 'No se pudo crear la cuenta.');
}
