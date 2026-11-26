// Mapa de roles -> tablas. Los nombres solo vienen de aquí (nunca del cliente),
// por eso es seguro interpolarlos en las consultas SQL.
export const ROLES = Object.freeze({
    usuario: {
        tabla: 'usuario',
        id: 'id_usuario',
        tablaVerificacion: 'verificacion_usuario',
    },
    admin: {
        tabla: 'administrador',
        id: 'id_admin',
        tablaVerificacion: 'verificacion_administrador',
    },
});

export const esRol = (valor) => typeof valor === 'string' && Object.hasOwn(ROLES, valor);
