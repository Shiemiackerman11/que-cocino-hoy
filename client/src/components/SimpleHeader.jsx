// client/src/components/SimpleHeader.jsx
import { Link } from 'react-router-dom';
import '../styles/SimpleHeader.css';

export default function SimpleHeader({ volverA = '/', textoVolver = '← Volver al inicio' }) {
  return (
    <header className="encabezado-simple">
      <Link to="/" className="logo">
        <span className="logo-icono">🍳</span> Qué cocino hoy
      </Link>
      <Link to={volverA} className="volver">{textoVolver}</Link>
    </header>
  );
}
