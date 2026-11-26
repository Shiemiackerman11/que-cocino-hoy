// backend/routes/authAdmin.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { correo, password } = req.body;

  // 1. Validar que lleguen los datos
  if (!correo || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
  }

  try {
    // 2. Buscar al administrador en la BD
    const resultado = await db.query(
      'SELECT id_admin, nom_pla, correo, password_hash, estado_cuenta FROM administrador WHERE correo = $1',
      [correo]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const admin = resultado.rows[0];

    // 3. Verificar que la cuenta esté activa
    if (admin.estado_cuenta !== 'ACTIVO') {
      return res.status(403).json({ error: 'Tu cuenta no está activa. Contacta al sistema.' });
    }

    // 4. Comparar contraseña con el hash de la BD
    const passwordOk = await bcrypt.compare(password, admin.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // 5. Generar JWT (válido por 1 día)
    const token = jwt.sign(
      { id_admin: admin.id_admin, correo: admin.correo, rol: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 6. Enviar el token en una cookie HttpOnly
    res.cookie('adminToken', token, {
      httpOnly: true,       // ← Bloquea el acceso desde JS (anti-XSS)
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en prod
      sameSite: 'strict',   // ← Evita CSRF
      maxAge: 24 * 60 * 60 * 1000, // 1 día
      path: '/',
    });

    // 7. Responder SIN el token (el navegador ya lo tiene en la cookie)
    res.json({
      success: true,
      message: 'Login exitoso',
      admin: {
        id_admin: admin.id_admin,
        nombre: admin.nom_pla,
        correo: admin.correo,
      },
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /api/admin/logout
router.post('/logout', (req, res) => {
  res.clearCookie('adminToken', { path: '/' });
  res.json({ success: true, message: 'Sesión cerrada.' });
});

module.exports = router;