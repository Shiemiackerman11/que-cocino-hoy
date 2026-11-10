// components/LoginCard.jsx
// Tarjeta blanca central con:
//   - Ícono de candado
//   - Título y subtítulo
//   - Formulario (usuario + contraseña + opciones)
//   - Aviso de seguridad

import { useState } from 'react';
import InputField from './InputField';
import PasswordField from './PasswordField';
import SecurityNotice from './SecurityNotice';

function LoginCard() {
  // Estado del formulario
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [recordar, setRecordar] = useState(false);

  // Manejo del envío
  // Aquí conectarás tu servicio del backend (carpeta services/)
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!usuario.trim() || !password) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    // TODO: llamar a authService.login(usuario, password)
    alert('Acceso verificado. Redirigiendo al panel de administración...');
  };

  return (
    <div className="tarjeta-login">
      {/* Ícono de candado */}
      <div className="icono-admin">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <h1>Acceso Administrador</h1>
      <p className="subtitulo">
        Ingresa tus credenciales para gestionar el contenido del sitio.
      </p>

      <form onSubmit={handleSubmit} autoComplete="on">
        {/* Campo usuario */}
        <InputField
          id="adminUser"
          label="Usuario administrador"
          type="text"
          placeholder="admin@delicias.com"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
          autoComplete="username"
        />

        {/* Campo contraseña con toggle */}
        <PasswordField
          id="adminPassword"
          label="Contraseña"
          placeholder="••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Recordarme / Olvidaste contraseña */}
        <div className="opciones">
          <label className="recordarme">
            <input
              type="checkbox"
              checked={recordar}
              onChange={(e) => setRecordar(e.target.checked)}
            />
            Recordarme
          </label>
          <a href="#">¿Olvidaste tu contraseña?</a>
        </div>

        {/* Botón ingresar */}
        <button type="submit" className="btn-ingresar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          Ingresar al panel
        </button>
      </form>

      {/* Aviso de seguridad */}
      <SecurityNotice />
    </div>
  );
}

export default LoginCard;