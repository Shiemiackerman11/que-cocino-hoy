import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { pool } from '../../db.js';
import { ROLES, esRol } from '../utils/roles.js';
import { HttpError } from '../utils/httpError.js';
import { conTransaccion } from '../utils/transaccion.js';
import { signToken } from '../utils/jwt.js';
import { generarTokenVerificacion, hashToken } from '../utils/token.js';
import { enviarCorreoVerificacion } from '../utils/mailer.js';
import { validarCorreo, validarPassword, validarTexto } from '../utils/validators.js';
import { CLIENT_URL, TOKEN_VERIFICACION_HORAS, ADMIN_REGISTRATION_KEY } from '../config/env.js';

// Se compara contra este hash cuando el correo no existe, para no revelar
// por tiempo de respuesta si una cuenta existe o no.
const HASH_FALSO = bcrypt.hashSync('contraseña-de-relleno', 10);

const rolDesdeTipo = (tipo) => {
    if (!esRol(tipo)) throw new HttpError(400, "El tipo debe ser 'usuario' o 'admin'");
    return tipo;
};

// Invalida tokens pendientes (solo se permite uno por cuenta) y crea uno nuevo.
async function crearTokenVerificacion(client, rol, idCuenta) {
    const { id, tablaVerificacion } = ROLES[rol];
    await client.query(
        `UPDATE ${tablaVerificacion}
            SET fecha_invalidacion = now()
          WHERE ${id} = $1 AND fecha_utilizacion IS NULL AND fecha_invalidacion IS NULL`,
        [idCuenta]
    );

    const { token, tokenHash } = generarTokenVerificacion();
    await client.query(
        `INSERT INTO ${tablaVerificacion} (token_hash, fecha_expiracion, ${id})
         VALUES ($1, now() + make_interval(hours => $2), $3)`,
        [tokenHash, TOKEN_VERIFICACION_HORAS, idCuenta]
    );
    return token;
}

// Un fallo del correo no debe deshacer el registro: la persona puede pedir reenvío.
async function enviarVerificacion(rol, cuenta, token) {
    const enlace = `${CLIENT_URL}/verificar-correo?tipo=${rol}&token=${token}`;
    try {
        await enviarCorreoVerificacion({ para: cuenta.correo, nombre: cuenta.nom_pla, enlace });
        return true;
    } catch (error) {
        console.error('No se pudo enviar el correo de verificación:', error.message);
        return false;
    }
}

function verificarClaveAdmin(clave) {
    if (!ADMIN_REGISTRATION_KEY) {
        throw new HttpError(403, 'El registro de administradores está deshabilitado');
    }
    const hash = (v) => crypto.createHash('sha256').update(String(v ?? '')).digest();
    if (!crypto.timingSafeEqual(hash(clave), hash(ADMIN_REGISTRATION_KEY))) {
        throw new HttpError(403, 'Clave de registro incorrecta');
    }
}

// ---------- Registro ----------
const registrar = (rol) => async (req, res) => {
    const body = req.body ?? {};
    if (rol === 'admin') verificarClaveAdmin(body.clave_registro);

    const datos = {
        nom_pla: validarTexto(body.nom_pla, 'El nombre', { max: 100 }),
        prim_ap: validarTexto(body.prim_ap, 'El primer apellido', { max: 100 }),
        sec_ap: validarTexto(body.sec_ap, 'El segundo apellido', { max: 100, requerido: false }),
        correo: validarCorreo(body.correo),
        password: validarPassword(body.password),
    };
    const passwordHash = await bcrypt.hash(datos.password, 10);
    const { tabla, id } = ROLES[rol];

    let resultado;
    try {
        resultado = await conTransaccion(async (client) => {
            const { rows } = await client.query(
                `INSERT INTO ${tabla} (nom_pla, prim_ap, sec_ap, correo, password_hash)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING ${id} AS id, nom_pla, prim_ap, sec_ap, correo, estado_cuenta`,
                [datos.nom_pla, datos.prim_ap, datos.sec_ap, datos.correo, passwordHash]
            );
            const token = await crearTokenVerificacion(client, rol, rows[0].id);
            return { cuenta: rows[0], token };
        });
    } catch (error) {
        if (error.code === '23505') throw new HttpError(409, 'Ya existe una cuenta con ese correo');
        throw error;
    }

    const correoEnviado = await enviarVerificacion(rol, resultado.cuenta, resultado.token);
    res.status(201).json({
        mensaje:
            rol === 'admin'
                ? 'Administrador registrado. Verifica tu correo para activar la cuenta.'
                : 'Cuenta creada. Verifica tu correo; después un administrador deberá aprobar tu cuenta.',
        correo_enviado: correoEnviado,
        cuenta: resultado.cuenta,
    });
};

export const registrarUsuario = registrar('usuario');
export const registrarAdmin = registrar('admin');

// ---------- Verificación de correo ----------
export const verificarCorreo = async (req, res) => {
    const { token, tipo } = req.body ?? {};
    const rol = rolDesdeTipo(tipo);
    if (typeof token !== 'string' || !token) throw new HttpError(400, 'El token es obligatorio');
    const { tabla, id, tablaVerificacion } = ROLES[rol];

    await conTransaccion(async (client) => {
        const { rows } = await client.query(
            `SELECT id_verificacion, ${id} AS id_cuenta, fecha_expiracion,
                    fecha_utilizacion, fecha_invalidacion
               FROM ${tablaVerificacion}
              WHERE token_hash = $1
                FOR UPDATE`,
            [hashToken(token)]
        );
        const v = rows[0];
        if (!v || v.fecha_utilizacion || v.fecha_invalidacion || v.fecha_expiracion < new Date()) {
            throw new HttpError(400, 'El enlace de verificación no es válido o ha expirado');
        }

        await client.query(
            `UPDATE ${tablaVerificacion} SET fecha_utilizacion = now() WHERE id_verificacion = $1`,
            [v.id_verificacion]
        );

        if (rol === 'usuario') {
            // Queda PENDIENTE hasta que un administrador lo apruebe.
            await client.query(
                `UPDATE usuario
                    SET correo_verificado_en = COALESCE(correo_verificado_en, now())
                  WHERE id_usuario = $1`,
                [v.id_cuenta]
            );
        } else {
            await client.query(
                `UPDATE administrador
                    SET correo_verificado_en = COALESCE(correo_verificado_en, now()),
                        estado_cuenta = CASE WHEN estado_cuenta = 'PENDIENTE'
                                             THEN 'ACTIVO'::estado_cuenta
                                             ELSE estado_cuenta END
                  WHERE id_admin = $1`,
                [v.id_cuenta]
            );
        }
    });

    res.json({
        mensaje:
            rol === 'usuario'
                ? 'Correo verificado. Un administrador revisará y aprobará tu cuenta.'
                : 'Correo verificado. Ya puedes iniciar sesión.',
    });
};

export const reenviarVerificacion = async (req, res) => {
    const { correo: correoBruto, tipo } = req.body ?? {};
    const rol = rolDesdeTipo(tipo);
    const correo = validarCorreo(correoBruto);
    const { tabla, id } = ROLES[rol];

    const { rows } = await pool.query(
        `SELECT ${id} AS id, nom_pla, correo
           FROM ${tabla}
          WHERE correo = $1 AND correo_verificado_en IS NULL AND estado_cuenta = 'PENDIENTE'`,
        [correo]
    );

    if (rows[0]) {
        const token = await conTransaccion((client) => crearTokenVerificacion(client, rol, rows[0].id));
        await enviarVerificacion(rol, rows[0], token);
    }

    // Respuesta idéntica exista o no la cuenta (evita enumerar correos).
    res.json({ mensaje: 'Si el correo corresponde a una cuenta pendiente de verificación, recibirás un nuevo enlace.' });
};

// ---------- Login ----------
const iniciarSesion = (rol) => async (req, res) => {
    const body = req.body ?? {};
    const correo = validarCorreo(body.correo);
    if (typeof body.password !== 'string' || !body.password) {
        throw new HttpError(400, 'La contraseña es obligatoria');
    }
    const { tabla, id } = ROLES[rol];

    const { rows } = await pool.query(
        `SELECT ${id} AS id, nom_pla, prim_ap, sec_ap, correo, password_hash,
                estado_cuenta, correo_verificado_en
           FROM ${tabla}
          WHERE correo = $1`,
        [correo]
    );
    const cuenta = rows[0];

    const coincide = await bcrypt.compare(body.password, cuenta?.password_hash ?? HASH_FALSO);
    if (!cuenta || !coincide) throw new HttpError(401, 'Correo o contraseña incorrectos');

    switch (cuenta.estado_cuenta) {
        case 'PENDIENTE':
            if (!cuenta.correo_verificado_en) {
                throw new HttpError(403, 'Debes verificar tu correo antes de iniciar sesión', 'CORREO_NO_VERIFICADO');
            }
            throw new HttpError(403, 'Tu cuenta está pendiente de aprobación por un administrador', 'PENDIENTE_APROBACION');
        case 'SUSPENDIDO':
            throw new HttpError(403, 'Tu cuenta está suspendida', 'CUENTA_SUSPENDIDA');
        case 'DESACTIVADO':
            throw new HttpError(403, 'Tu cuenta está desactivada', 'CUENTA_DESACTIVADA');
    }

    const { password_hash, ...publico } = cuenta;
    res.json({
        token: signToken({ sub: cuenta.id, rol }),
        rol,
        cuenta: publico,
    });
};

export const loginUsuario = iniciarSesion('usuario');
export const loginAdmin = iniciarSesion('admin');
