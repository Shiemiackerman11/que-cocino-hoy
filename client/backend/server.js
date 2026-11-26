// backend/server.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authAdminRoutes = require('./routes/authAdmin');
const adminPanelRoutes = require('./routes/adminPanel');

const app = express();
const PORT = process.env.PORT || 3001;

// ===== MIDDLEWARES GLOBALES =====
app.use(cors({
  origin: process.env.CLIENT_URL, // http://localhost:5173 (tu React)
  credentials: true,              // ← CRÍTICO para que viajen las cookies
}));
app.use(express.json());          // Parsear JSON en las peticiones
app.use(cookieParser());          // ← CRÍTICO para leer req.cookies

// ===== RUTAS =====
app.use('/api/admin', authAdminRoutes);   // /api/admin/login, /api/admin/logout
app.use('/api/admin', adminPanelRoutes);  // /api/admin/recetas-pendientes, /api/admin/perfil

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Delicias Culinarias funcionando 🍳' });
});

// ===== LEVANTAR SERVIDOR =====
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});