// client/src/services/adminService.js
import { API_URL } from './config';

const CLAVE_ADMIN = 'qch_admin';

export function obtenerAdmin() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_ADMIN));
    } catch {
        return null;
    }
}

function guardarAdmin(admin) {
    localStorage.setItem(CLAVE_ADMIN, JSON.stringify(admin));
}

function limpiarAdmin() {
    localStorage.removeItem(CLAVE_ADMIN);
}

async function enviar(ruta, cuerpo) {
    const respuesta = await fetch(`${API_URL}${ruta}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(cuerpo),
    });
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) throw new Error(datos.mensaje || datos.error || 'Error en la solicitud');
    return datos;
}

export async function loginAdmin(correo, password) {
    const datos = await enviar('/auth/admin/login', { correo, password });
    const admin = {
        nombre: `${datos.cuenta.nom_pla} ${datos.cuenta.prim_ap}`,
        correo: datos.cuenta.correo,
        inicial: datos.cuenta.nom_pla.charAt(0).toUpperCase(),
    };
    guardarAdmin(admin);
    return admin;
}

export async function cerrarSesionAdmin() {
    await fetch(`${API_URL}/auth/admin/logout`, {
        method: 'POST',
        credentials: 'include',
    }).catch(() => {});
    limpiarAdmin();
}

export async function verificarSesionAdmin() {
    try {
        const respuesta = await fetch(`${API_URL}/auth/admin/sesion`, {
            credentials: 'include',
        });
        if (!respuesta.ok) {
            limpiarAdmin();
            return null;
        }
        const datos = await respuesta.json();
        const admin = {
            nombre: `${datos.cuenta.nom_pla} ${datos.cuenta.prim_ap}`,
            correo: datos.cuenta.correo,
            inicial: datos.cuenta.nom_pla.charAt(0).toUpperCase(),
        };
        guardarAdmin(admin);
        return admin;
    } catch {
        return null;
    }
}