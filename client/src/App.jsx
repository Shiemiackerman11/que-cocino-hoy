// client/src/App.jsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import Inicio from './pages/Inicio';
import Categoria from './pages/Categoria';
import DetalleReceta from './pages/DetalleReceta';
import PerfilUsuario from './pages/PerfilUsuario';
import NoEncontrada from './pages/NoEncontrada';
import Login from './components/Login';
import Register from './components/Register';

// Admin
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminAprobaciones from './pages/AdminAprobaciones';
import AdminGuard from './components/AdminGuard';

import './styles/global.css';

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
                {/* Rutas públicas */}
                <Route path="/" element={<Inicio />} />
                <Route path="/categoria/:id" element={<Categoria />} />
                <Route path="/receta/:id" element={<DetalleReceta />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/perfil" element={<PerfilUsuario />} />

                {/* Login admin (público) */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Rutas admin protegidas */}
                <Route path="/admin" element={
                    <AdminGuard>
                        <AdminLayout />
                    </AdminGuard>
                }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="aprobaciones" element={<AdminAprobaciones />} />
                </Route>

                <Route path="*" element={<NoEncontrada />} />
            </Routes>
        </BrowserRouter>
    );
}