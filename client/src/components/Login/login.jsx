// client/src/components/Login/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUsuario } from '../../services/authService';
import '../../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor, llena todos los campos.');
      return;
    }

    setLoading(true);

    try {
      await loginUsuario(email, password);
      navigate('/dashboard'); // Redirige a otra ruta (debes crearla luego)
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <a href="/" className="logo">
          <span className="logo-icono">🍳</span>
          Qué cocino hoy
        </a>
        <a href="/" className="volver">← Volver al inicio</a>
      </header>

      <main className="contenedor-principal">
        <div className="lado-imagen">
          <span className="badge-imagen">Cocina algo rico hoy</span>
          <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800" alt="Bowl de comida saludable" />
          <div className="texto-imagen">
            <h2>Qué gusto tenerte de vuelta a la cocina.</h2>
            <p>Retoma tus recetas guardadas y descubre nuevas ideas con lo que ya tienes en casa.</p>
          </div>
        </div>

        <div className="lado-formulario">
          <h1>Iniciar sesión</h1>
          <p className="subtitulo">Entra para seguir cocinando sin complicaciones.</p>

          <div className="botones-sociales">
            <button type="button" className="btn-social btn-google"><span>G</span> Continuar con Google</button>
            <button type="button" className="btn-social btn-facebook"><span>f</span> Continuar con Facebook</button>
          </div>

          <div className="separador">o usa tu correo</div>

          {error && <div className="error-mensaje">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="campo">
              <label htmlFor="email">Correo electrónico</label>
              <input 
                type="email" 
                id="email" 
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="campo campo-password">
              <label htmlFor="password">Contraseña</label>
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="toggle-password" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            <div className="olvidaste">
              <a href="/recuperar">¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className="btn-iniciar" disabled={loading}>
              {loading ? 'Cargando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="registro">
            ¿Aún no tienes cuenta? <a href="/registro">Regístrate</a>
          </p>
        </div>
      </main>

      <footer className="login-footer">
        <span>Buenas ideas para aprovechar lo que ya tienes.</span>
        <div className="footer-enlaces">
          <a href="/privacidad">Privacidad</a>
          <a href="/terminos">Términos</a>
          <a href="/ayuda">Ayuda</a>
        </div>
      </footer>
    </div>
  );
};

export default Login;