import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { reenviarVerificacion, verificarCorreo } from '../services/authService';
import '../styles/Login.css';
import '../styles/revisarCorreo.css';

export default function RevisarCorreo() {
    const location = useLocation();
    const navigate = useNavigate();
    const parametros = new URLSearchParams(location.search);
    const token = parametros.get('token');
    const tipo = parametros.get('tipo') || 'usuario';
    const correo = location.state?.email || '';
    const [estado, setEstado] = useState(token ? 'verificando' : 'esperando');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const tokenProcesado = useRef(null);

    useEffect(() => {
        if (!token || tokenProcesado.current === token) return;
        tokenProcesado.current = token;
        verificarCorreo(token, tipo)
            .then(() => setEstado('verificado'))
            .catch((err) => {
                setEstado('invalido');
                setError(err.message || 'El enlace no es válido o ya expiró.');
            });
    }, [token, tipo]);

    const handleReenviar = async () => {
        if (loading || !correo) return;
        setLoading(true);
        setError('');
        setMensaje('');
        try {
            await reenviarVerificacion(correo, tipo);
            setMensaje('Se generó un nuevo enlace. Cópialo desde la terminal del backend para verificar la cuenta.');
        } catch (err) {
            setError(err.message || 'Error al generar un nuevo enlace de verificación.');
        } finally {
            setLoading(false);
        }
    };

    const verificado = estado === 'verificado';
    const procesando = estado === 'verificando';

    return (
        <div className="revisar-correo-container login-page">
            <header className="login-header">
                <Link to="/" className="logo"><span className="logo-icono">🍳</span>Qué cocino hoy</Link>
                <Link to="/" className="volver">← Volver al inicio</Link>
            </header>
            <main className="revisar-correo-main">
                <section className="mensaje-reenviar">
                    {procesando ? (
                        <><h1>Verificando tu correo…</h1><p>Espera un momento mientras confirmamos tu cuenta.</p></>
                    ) : verificado ? (
                        <>
                            <h1>¡Correo verificado!</h1>
                            <p>Tu cuenta está activa. Ya puedes iniciar sesión.</p>
                            <button type="button" className="btn-reenviar" onClick={() => navigate('/login')}>
                                Iniciar sesión
                            </button>
                        </>
                    ) : token ? (
                        <>
                            <h1>Enlace no válido</h1>
                            <p role="alert">{error}</p>
                            <p>Solicita un nuevo enlace desde la pantalla de registro o vuelve a intentarlo con el correo más reciente.</p>
                            <Link to="/login">Ir al inicio de sesión</Link>
                        </>
                    ) : (
                        <>
                            <h1>¡Casi listo!</h1>
                            <p>Tu cuenta quedó pendiente de verificación: <strong>{correo || 'Correo no disponible'}</strong></p>
                            {error && <p role="alert">{error}</p>}
                            {mensaje && <p role="status">{mensaje}</p>}
                            <p>Copia el enlace de verificación que aparece en la terminal del backend y ábrelo en el navegador para activar tu cuenta.</p>
                            <button type="button" className="btn-reenviar" onClick={handleReenviar} disabled={loading || !correo}>
                                {loading ? 'Generando enlace...' : 'Generar nuevo enlace'}
                            </button>
                        </>
                    )}
                </section>
            </main>
            <footer className="login-footer">
                <span>Buenas ideas para aprovechar lo que ya tienes.</span>
                <div className="footer-enlaces">
                    <Link to="/privacidad">Privacidad</Link>
                    <Link to="/terminos">Términos</Link>
                    <Link to="/ayuda">Ayuda</Link>
                </div>
            </footer>
        </div>
    );
}
