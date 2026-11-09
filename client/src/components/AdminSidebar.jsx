import { NavLink } from 'react-router-dom';
import '../styles/admin.css';

export default function AdminSidebar() {
    return (
        <aside className="sidebar-admin">
            <div className="sidebar-header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11h18M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M12 3v4"/><path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"/></svg>
                <span>Delicias <span className="admin-badge">Admin</span></span>
            </div>

            <ul className="sidebar-nav">
                <li>
                    {/* NavLink agrega automáticamente la clase 'active' cuando la ruta coincide */}
                    <NavLink to="/admin" end className="nav-admin">
                        <span>Dashboard</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/admin/aprobaciones" className="nav-admin">
                        <span>Aprobaciones</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/admin/catalogo" className="nav-admin">
                        <span>Catálogo de Recetas</span>
                    </NavLink>
                </li>
            </ul>

            <div className="sidebar-footer">
                <a href="/logout">
                    <span>Cerrar sesión</span>
                </a>
            </div>
        </aside>
    );
}