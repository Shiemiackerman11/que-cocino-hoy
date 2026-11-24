// client/src/components/RecipeCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/RecipeCard.css';

export default function RecipeCard({ receta, onToggleFavorite }) {
  const { id, titulo, categoria, tiempo, calificacion, opiniones, imagen } = receta;

  return (
    <article className="receta-card">
      <div className="receta-img">
        <Link to={`/receta/${id}`}>
          <img src={imagen} alt={titulo} loading="lazy" />
        </Link>
        <button
          className="btn-favorito"
          aria-label="Quitar de favoritos"
          onClick={() => onToggleFavorite && onToggleFavorite(id)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <div className="receta-info">
        <span className="receta-categoria">{categoria}</span>
        <h3>
          <Link to={`/receta/${id}`}>{titulo}</Link>
        </h3>
        <div className="receta-meta">
          <span>⏱ {tiempo} min</span>
          <span>⭐ {calificacion} ({opiniones})</span>
        </div>
      </div>
    </article>
  );
}