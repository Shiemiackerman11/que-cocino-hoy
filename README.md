# Verificación de correo local

El registro y la verificación funcionan localmente sin enviar correos. Al registrar una cuenta o generar un enlace nuevo, el backend imprime la URL de verificación en su terminal. Abre ese enlace en el navegador para activar la cuenta.

Configura `server/.env` a partir de `server/.env.example`. `CLIENT_URL` debe apuntar al cliente; localmente es `http://localhost:5173`.

Para una base nueva, ejecuta `BD/que-cocino-hoy-schema.sql`. Para una base existente, ejecuta `BD/migracion-verificacion-correo.sql` una vez. Los tokens se guardan como hashes, expiran según `TOKEN_VERIFICACION_HORAS`, se invalidan al generar otro enlace y solo pueden utilizarse una vez.
