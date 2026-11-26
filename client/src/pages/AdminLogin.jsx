// pages/AdminLogin.jsx
// Página completa de acceso al panel de administración.
// Ensambla: AdminHeader + LoginCard + AdminFooter
// y aplica el layout de fondo oscuro.

import AdminHeader from '../components/AdminHeader';
import LoginCard from '../components/LoginCard';
import AdminFooter from '../components/AdminFooter';
import '../styles/adminLogin.css';

function AdminLogin() {
  return (
    <div className="admin-page">
      <AdminHeader />

      <main className="contenedor-login">
        <LoginCard />
      </main>

      <AdminFooter />
    </div>
  );
}

export default AdminLogin;