// client/src/components/AdminLayout.jsx
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { obtenerAdmin, cerrarSesionAdmin } from '../services/adminService';

export default function AdminLayout() {
    const navigate = useNavigate();
    const admin = obtenerAdmin();

    const handleLogout = async () => {
        await cerrarSesionAdmin();
        navigate('/admin/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <AdminSidebar />
            <main className="main-admin">
                <div className="top-bar">
                    <h1>Panel de Administración</h1>
                    <div className="admin-profile">
                        <div className="admin-avatar">
                            {admin?.inicial ?? 'A'}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {admin?.nombre ?? 'Administrador'}
                        </span>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#64748b',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                marginLeft: '8px',
                            }}
                        >
                            Salir
                        </button>
                    </div>
                </div>
                <Outlet />
            </main>
            return (
    <div className="admin-wrapper">
        <AdminSidebar />
        <main className="main-admin">
            ...
        </main>
    </div>
);
        </div>
    );
}