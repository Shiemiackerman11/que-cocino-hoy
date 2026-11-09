import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';

export default function AdminLayout({ titulo }) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <AdminSidebar />
            <main className="main-admin">
                <div className="top-bar">
                    <h1>{titulo}</h1>
                    <div className="admin-profile">
                        <div className="admin-avatar">A</div>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Admin Chef</span>
                    </div>
                </div>
                {/* Aquí se inyectarán las vistas (Pages) dinámicamente */}
                <Outlet /> 
            </main>
        </div>
    );
}