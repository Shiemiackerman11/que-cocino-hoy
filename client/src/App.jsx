import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminAprobaciones from './pages/AdminAprobaciones';
import './styles/admin.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Nueva regla: Si el usuario entra a "/", redirigir automáticamente a "/admin" */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* Rutas del Administrador */}
        <Route path="/admin" element={<AdminLayout titulo="Dashboard General" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="aprobaciones" element={<AdminAprobaciones />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}