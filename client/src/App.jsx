// client/src/App.jsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import Inicio from './pages/Inicio';
import Categoria from './pages/Categoria';
import DetalleReceta from './pages/DetalleReceta';
import PerfilUsuario from './pages/PerfilUsuario';
import NoEncontrada from './pages/NoEncontrada';
import Login from './components/login';
import Register from './components/Register';

import './styles/global.css';

// Al cambiar de página, vuelve al inicio de la pantalla.
function ScrollArriba() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollArriba />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/categoria/:id" element={<Categoria />} />
        <Route path="/receta/:id" element={<DetalleReceta />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/perfil" element={<PerfilUsuario />} />
        <Route path="*" element={<NoEncontrada />} />
      </Routes>
    </BrowserRouter>
  );
}
