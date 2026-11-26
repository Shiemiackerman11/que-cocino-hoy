// backend/crearAdmin.js
const bcrypt = require('bcrypt');
const db = require('./db');
require('dotenv').config();

async function crearAdmin() {
  const correo = 'admin@delicias.com';
  const passwordPlano = 'Admin123456'; // ⚠️ Cámbiala después
  const passwordHash = await bcrypt.hash(passwordPlano, 10);

  try {
    const resultado = await db.query(
      `INSERT INTO administrador (nom_pla, prim_ap, sec_ap, correo, password_hash, estado_cuenta, correo_verificado_en)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id_admin, correo`,
      ['Admin', 'Delicias', 'Culinarias', correo, passwordHash, 'ACTIVO']
    );

    console.log('✅ Administrador creado:', resultado.rows[0]);
    console.log('📧 Correo:', correo);
    console.log('🔑 Contraseña:', passwordPlano);
    console.log('⚠️  Cámbiala después en producción');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al crear administrador:', err);
    process.exit(1);
  }
}

crearAdmin();