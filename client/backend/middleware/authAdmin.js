// backend/middleware/authAdmin.js
const jwt = require('jsonwebtoken');

const verificarAdmin = (req, res, next) => {
  // 1. Leer el token de la cookie HttpOnly
  const token = req.cookies.adminToken;

  if (!token) {
    return res.status(401).json({ error: 'No autenticado. Inicia sesión.' });
  }

  try {
    // 2. Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Verificar que sea administrador
    if (decoded.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. No eres administrador.' });
    }

    // 4. Adjuntar los datos al request para usarlos en la ruta
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

module.exports = { verificarAdmin };