import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importamos los estilos globales (con la ruta correcta)
import './styles/Login.css';
import './styles/Register.css';

// Importamos los componentes
import Login from './components/Login/Login';
import Register from './components/Register/Register'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Al entrar a la raíz, redirige al Login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Vistas */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        
        {/* Dashboard temporal */}
        <Route 
          path="/dashboard" 
          element={
            <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
              <h1>¡Bienvenido al Dashboard!</h1>
              <p>Has iniciado sesión correctamente.</p>
              <a href="/login" style={{ color: '#e85d3a' }}>Cerrar sesión</a>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;