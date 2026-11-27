// client/src/services/authService.js
import { API_URL, USAR_DATOS_DEMO, esperar } from './config';

const CLAVE_USUARIO = 'qch_usuario';

export function obtenerUsuario() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_USUARIO));
    } catch {
        return null;
    }
}

function guardarUsuario(usuario) {
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
}

function limpiarUsuario() {
    localStorage.removeItem(CLAVE_USUARIO);
}

async function enviar(ruta, cuerpo) {
    const respuesta = await fetch(`${API_URL}${ruta}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // necesario para enviar/recibir cookies
        body: JSON.stringify(cuerpo),
    });
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) throw new Error(datos.mensaje || datos.error || 'Error en la solicitud');
    return datos;
}

export async function loginUsuario(correo, password) {
    if (USAR_DATOS_DEMO) {
        await esperar(400);
        if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
        const nombre = correo.split('@')[0];
        const usuario = {
            nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1),
            correo,
            inicial: nombre.charAt(0).toUpperCase(),
        };
        guardarUsuario(usuario);
        return usuario;
    }

    const datos = await enviar('/auth/login', { correo, password });
    // El token viene en cookie HttpOnly, solo guardamos los datos públicos
    const usuario = {
        nombre: `${datos.cuenta.nom_pla} ${datos.cuenta.prim_ap}`,
        correo: datos.cuenta.correo,
        inicial: datos.cuenta.nom_pla.charAt(0).toUpperCase(),
    };
    guardarUsuario(usuario);
    return usuario;
}

export async function registrarUsuario(datos) {
    if (USAR_DATOS_DEMO) {
        await esperar(400);
        if (datos.password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
        return { ok: true };
    }
    return enviar('/auth/registro', {
        nom_pla: datos.nombre,
        prim_ap: datos.primer_apellido,
        sec_ap: datos.segundo_apellido || null,
        correo: datos.email,
        password: datos.password,
    });
}

export async function cerrarSesion() {
    if (!USAR_DATOS_DEMO) {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        }).catch(() => {});
    }
    limpiarUsuario();
}

// Verifica con el servidor si hay sesión activa (al recargar la página)
export async function verificarSesionActiva() {
    if (USAR_DATOS_DEMO) return obtenerUsuario();
    try {
        const respuesta = await fetch(`${API_URL}/auth/sesion`, {
            credentials: 'include',
        });
        if (!respuesta.ok) {
            limpiarUsuario();
            return null;
        }
        const datos = await respuesta.json();
        const usuario = {
            nombre: `${datos.cuenta.nom_pla} ${datos.cuenta.prim_ap}`,
            correo: datos.cuenta.correo,
            inicial: datos.cuenta.nom_pla.charAt(0).toUpperCase(),
        };
        guardarUsuario(usuario);
        return usuario;
    } catch {
        return null;
    }
}