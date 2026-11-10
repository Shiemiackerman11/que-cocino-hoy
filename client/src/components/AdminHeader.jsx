// components/AdminHeader.jsx
// Header de la página de administración:
// muestra el logo, badge "Admin" y botón para volver al sitio principal.

import { useNavigate } from 'react-router-dom';

function AdminHeader() {
  const navigate = useNavigate();

  return (
    <header className="admin-header">
      {/* Logo + badge */}
      <a href="/" className="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 11h18M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M12 3v4" />
          <path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
        </svg>
        Delicias Culinarias
        <span className="admin-badge">Admin</span>
      </a>

      {/* Botón volver */}
      <button className="btn-volver" onClick={() => navigate('/')}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span className="volver-texto">Volver al sitio</span>
      </button>
    </header>
  );
}

export default AdminHeader;