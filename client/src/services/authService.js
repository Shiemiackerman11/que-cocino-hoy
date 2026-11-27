// client/src/services/authService.js
// Endpoints esperados: POST /api/auth/login y POST /api/auth/registro
import { API_URL, USAR_DATOS_DEMO, esperar } from './config';

const CLAVE_USUARIO = 'qch_usuario';

export function obtenerUsuario() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_USUARIO));
  } catch {
    return null;
  }
}

export async function cerrarSesion() {
  localStorage.removeItem(CLAVE_USUARIO);
  try {
    await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
  } catch {
    // La sesión local queda cerrada aunque el servidor no esté disponible.
  }
}

function guardarSesion(usuario) {
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
}

async function enviar(ruta, cuerpo, mensajeError) {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.mensaje || datos.error || mensajeError);
  return datos;
}

export async function reenviarVerificacion(correo, tipo) {
  return enviar(
    '/auth/reenviar-verificacion',
    { correo, tipo },
    'No se pudo reenviar el correo de verificación.'
  );
}

export async function verificarCorreo(token, tipo) {
  return enviar('/auth/verificar-correo', { token, tipo }, 'No se pudo verificar el correo.');
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
  const datos = await enviar(
    '/auth/login',
    { correo: email, password },
    'Correo o contraseña incorrectos.'
  );

  const cuenta = datos.cuenta;
  const nombre = [cuenta.nom_pla, cuenta.prim_ap, cuenta.sec_ap]
  .filter(Boolean)
  .join(' ');

  const usuario = {
    id: cuenta.id,
    nombre,
    correo: cuenta.correo,
    inicial: nombre.charAt(0).toUpperCase(),
  }

  guardarSesion(usuario);
  return usuario;
}

export async function registrarUsuario(datos) {
  if (USAR_DATOS_DEMO) {
    await esperar(400);
    if (datos.password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
    return { ok: true };
  }

  const cuerpo = {
    nom_pla: datos.nombre,
    prim_ap: datos.primer_apellido,
    sec_ap: datos.segundo_apellido,
    fecha_nac: datos.fecha_nac,
    correo: datos.email,
    password: datos.password,
  };
  return enviar('/auth/registro', cuerpo, 'No se pudo crear la cuenta.');
}
