// client/src/components/RecipeListCard.jsx
// Tarjeta de receta para listados (categoría y resultados de búsqueda): tiempo y complejidad.
import { Link } from 'react-router-dom';
import { formatearTiempo } from '../utils/texto';
import '../styles/RecipeListCard.css';

export default function RecipeListCard({ receta }) {
  const { id, titulo, descripcion, tiempo, complejidad, imagen } = receta;

  return (
    <Link to={`/receta/${id}`} className="tarjeta">
      <div className="tarjeta-imagen">
        {imagen ? (
          <img src={imagen} alt={titulo} loading="lazy" />
        ) : (
          <div className="tarjeta-sin-imagen" aria-hidden="true">🍽️</div>
        )}
        <span className="badge-tiempo">⏱️ {formatearTiempo(tiempo)}</span>
      </div>
      <div className="tarjeta-info">
        <h3 className="tarjeta-titulo">{titulo}</h3>
        {descripcion && <p className="tarjeta-descripcion">{descripcion}</p>}
        <div className="tarjeta-footer">
          <span className="complejidad">👨‍🍳 Complejidad: {complejidad ?? 'N/D'}</span>
        </div>
      </div>
    </Link>
  );
}
