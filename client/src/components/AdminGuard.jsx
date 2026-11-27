// client/src/components/AdminGuard.jsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { verificarSesionAdmin, obtenerAdmin } from '../services/adminService';

export default function AdminGuard({ children }) {
    const [estado, setEstado] = useState('verificando'); // verificando | autorizado | denegado

    useEffect(() => {
        // Primero revisa localStorage para respuesta inmediata
        const adminLocal = obtenerAdmin();
        if (!adminLocal) {
            setEstado('denegado');
            return;
        }

        // Luego verifica con el servidor que la cookie siga vigente
        verificarSesionAdmin()
            .then((admin) => {
                setEstado(admin ? 'autorizado' : 'denegado');
            })
            .catch(() => setEstado('denegado'));
    }, []);

    if (estado === 'verificando') {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                fontSize: '1rem',
                color: '#64748b',
            }}>
                Verificando sesión...
            </div>
        );
    }

    if (estado === 'denegado') {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
}