import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
    user: 'postgres',
    password: '', //NOTA: La contraseña es la contraseña que TU definiste al instalar Postgres
    host: 'localhost',
    port: 5432,
    database: 'que-cocino-hoy'
});