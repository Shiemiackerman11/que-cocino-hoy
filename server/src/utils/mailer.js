import nodemailer from 'nodemailer';
import { SMTP } from '../config/env.js';

const transporter = SMTP.host
    ? nodemailer.createTransport({
          host: SMTP.host,
          port: SMTP.port,
          secure: SMTP.port === 465,
          auth: SMTP.user ? { user: SMTP.user, pass: SMTP.pass } : undefined,
      })
    : null;

const escapar = (texto) =>
    String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function enviarCorreoVerificacion({ para, nombre, enlace }) {
    // Sin SMTP configurado (desarrollo) el enlace se imprime en consola.
    if (!transporter) {
        console.log(`[DEV] Enlace de verificación para ${para}: ${enlace}`);
        return;
    }

    await transporter.sendMail({
        from: SMTP.from,
        to: para,
        subject: 'Verifica tu correo - ¿Qué cocino hoy?',
        text: `Hola ${nombre}, verifica tu correo entrando a este enlace: ${enlace}`,
        html: `<p>Hola ${escapar(nombre)},</p>
               <p>Verifica tu correo haciendo clic en el siguiente enlace:</p>
               <p><a href="${escapar(enlace)}">Verificar correo</a></p>
               <p>Si no creaste esta cuenta, ignora este mensaje.</p>`,
    });
}
