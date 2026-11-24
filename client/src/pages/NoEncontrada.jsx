// client/src/pages/NoEncontrada.jsx
import { Link } from 'react-router-dom';
import SimpleHeader from '../components/SimpleHeader';
import '../styles/NoEncontrada.css';

export default function NoEncontrada() {
  return (
    <div className="pagina-no-encontrada">
      <SimpleHeader />
      <main>
        <h1>Esta página no existe todavía</h1>
        <p>Revisa la dirección o vuelve al inicio para seguir explorando recetas.</p>
        <Link to="/" className="btn-volver">Ir al inicio</Link>
      </main>
    </div>
  );
}
