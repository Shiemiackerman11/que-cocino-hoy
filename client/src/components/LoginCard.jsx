// components/LoginCard.jsx
// Tarjeta blanca central con:
//   - Ícono de candado
//   - Título y subtítulo
//   - Formulario (usuario + contraseña + opciones)
//   - Aviso de seguridad
// client/src/components/LoginCard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from './InputField';
import PasswordField from './PasswordField';
import SecurityNotice from './SecurityNotice';
import { loginAdmin } from '../services/adminService';

function LoginCard() {
    const navigate = useNavigate();
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [recordar, setRecordar] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!correo.trim() || !password) {
            setError('Por favor, completa todos los campos.');
            return;
        }

        setLoading(true);
        try {
            await loginAdmin(correo, password);
            navigate('/admin');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tarjeta-login">
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

            {error && (
                <div style={{
                    background: '#fee2e2',
                    color: '#b91c1c',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '0.85rem',
                    marginBottom: '16px',
                    textAlign: 'center',
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} autoComplete="on">
                <InputField
                    id="adminCorreo"
                    label="Correo administrador"
                    type="email"
                    placeholder="admin@correo.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                    autoComplete="username"
                />

                <PasswordField
                    id="adminPassword"
                    label="Contraseña"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

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

                <button type="submit" className="btn-ingresar" disabled={loading}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                    {loading ? 'Verificando...' : 'Ingresar al panel'}
                </button>
            </form>

            <SecurityNotice />
        </div>
    );
}

export default LoginCard;