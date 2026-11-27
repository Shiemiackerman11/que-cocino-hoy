import bcrypt from 'bcrypt';
import pkg from 'pg';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Leer el .env manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

// Parsear el .env a mano
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key) env[key.trim()] = rest.join('=').trim();
}

console.log('Variables cargadas:', {
    DB_USER: env.DB_USER,
    DB_PASSWORD: env.DB_PASSWORD ? '***' : 'VACÍA',
    DB_HOST: env.DB_HOST,
    DB_PORT: env.DB_PORT,
    DB_NAME: env.DB_NAME,
});

const { Pool } = pkg;

const pool = new Pool({
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    database: env.DB_NAME,
});

const nom_pla = 'Admin';
const prim_ap = 'Principal';
const fecha_nac = '1990-01-01';
const correo = 'admin@admin.com';
const password = 'Admin123';

try {
    const hash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
        `INSERT INTO administrador 
            (nom_pla, prim_ap, fecha_nac, correo, password_hash, estado_cuenta, correo_verificado_en)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVO', now())
         RETURNING id_admin, correo, estado_cuenta`,
        [nom_pla, prim_ap, fecha_nac, correo, hash]
    );

    console.log('✅ Admin creado exitosamente:');
    console.log(rows[0]);
} catch (error) {
    if (error.code === '23505') {
        console.log('⚠️  Ya existe un admin con ese correo.');
    } else {
        console.error('❌ Error:', error.message);
    }
} finally {
    await pool.end();
}