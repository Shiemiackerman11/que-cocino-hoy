import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarUsuario } from '../services/authService';
import '../styles/Register.css';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nombre || !formData.primer_apellido || !formData.email || !formData.password) {
      setError('Por favor, completa nombre, primer apellido, correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      await registrarUsuario(formData);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container auth-page">
      {/* ===== HEADER ===== */}
      <header>
        <Link to="/" className="logo">
          <span className="logo-icono">🍳</span>
          Qué cocino hoy
        </Link>
        <Link to="/" className="volver">← Volver al inicio</Link>
      </header>

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <main className="contenedor-principal">
        {/* Lado izquierdo: Imagen */}
        <div className="lado-imagen">
          <span className="badge-imagen">Cocina algo rico hoy</span>
          <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800" alt="Bowl de comida saludable" />
          <div className="texto-imagen">
            <h2>Tu próxima receta favorita empieza aquí.</h2>
            <p>Guarda tus recetas, aprovecha mejor tus ingredientes y encuentra inspiración todos los días.</p>
          </div>
        </div>

        {/* Lado derecho: Formulario */}
        <div className="lado-formulario">
          <h1>Crear una cuenta</h1>
          <p className="subtitulo">Únete y convierte lo que tienes en algo delicioso.</p>

          {/* Botones sociales */}
          <div className="botones-sociales">
            <button type="button" className="btn-social btn-google">
              <span>G</span> Continuar con Google
            </button>
            <button type="button" className="btn-social btn-facebook">
              <span>f</span> Continuar con Facebook
            </button>
          </div>

          {/* Separador */}
          <div className="separador">o usa tu correo</div>

          {error && <div className="error-mensaje">{error}</div>}

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            <div className="campo">
              <label htmlFor="nombre">Nombre</label>
              <input 
                type="text" 
                id="nombre" 
                placeholder="Tu nombre" 
                value={formData.nombre}
                onChange={handleChange}
              />
            </div>

            <div className="campo">
              <label htmlFor="primer_apellido">Primer Apellido</label>
              <input 
                type="text" 
                id="primer_apellido" 
                placeholder="Tu Primer Apellido" 
                value={formData.primer_apellido}
                onChange={handleChange}
              />
            </div>

            <div className="campo">
              <label htmlFor="segundo_apellido">Segundo Apellido</label>
              <input 
                type="text" 
                id="segundo_apellido" 
                placeholder="Tu Segundo Apellido" 
                value={formData.segundo_apellido}
                onChange={handleChange}
              />
            </div>

            <div className="campo">
              <label htmlFor="email">Correo electrónico</label>
              <input 
                type="email" 
                id="email" 
                placeholder="tu@correo.com" 
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="campo campo-password">
              <label htmlFor="password">Contraseña</label>
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="password" 
                placeholder="Mínimo 8 caracteres" 
                value={formData.password}
                onChange={handleChange}
              />
              <button 
                type="button" 
                className="toggle-password" 
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Mostrar contraseña"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            <button type="submit" className="btn-crear" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear mi cuenta'}
            </button>
          </form>

          {/* Términos */}
          <p className="terminos">
            Al crear tu cuenta aceptas los <Link to="/terminos">Términos de uso</Link> y el <Link to="/privacidad">Aviso de privacidad</Link>.
          </p>

          {/* Iniciar sesión */}
          <p className="iniciar-sesion">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer>
        <span>Buenos hábitos para aprovechar lo que ya tienes.</span>
        <div className="footer-enlaces">
          <Link to="/privacidad">Privacidad</Link>
          <Link to="/terminos">Términos</Link>
          <Link to="/ayuda">Ayuda</Link>
        </div>
      </footer>
    </div>
  );
}