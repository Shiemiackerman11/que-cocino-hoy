// client/src/components/RecipeListCard.jsx
// Tarjeta de receta para el listado de una categoría.
import { Link } from 'react-router-dom';
import '../styles/RecipeListCard.css';

export default function RecipeListCard({ receta }) {
  const { id, titulo, descripcion, tiempo, complejidad, calificacion, opiniones, imagen } = receta;

  return (
    <Link to={`/receta/${id}`} className="tarjeta">
      <div className="tarjeta-imagen">
        <img src={imagen} alt={titulo} loading="lazy" />
        <span className="badge-tiempo">⏱️ {tiempo} min</span>
      </div>
      <div className="tarjeta-info">
        <h3 className="tarjeta-titulo">{titulo}</h3>
        <p className="tarjeta-descripcion">{descripcion}</p>
        <div className="tarjeta-footer">
          <span className="complejidad">👨‍🍳 {complejidad}</span>
          <div className="puntuacion">★ {calificacion} <span>({opiniones})</span></div>
        </div>
      </div>
    </Link>
  );
}
