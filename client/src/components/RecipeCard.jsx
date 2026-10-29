// client/src/components/RecipeCard.jsx
import React from 'react';

export default function RecipeCard({ receta, onToggleFavorite }) {
  const { id, titulo, categoria, tiempo, calificacion, opiniones, imagen } = receta;

  return (
    <article class="receta-card">
      <div class="receta-img">
        <img src={imagen} alt={titulo} loading="lazy" />
        <button
          class="btn-favorito"
          aria-label="Quitar de favoritos"
          onClick={() => onToggleFavorite && onToggleFavorite(id)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <div class="receta-info">
        <span class="receta-categoria">{categoria}</span>
        <h3>{titulo}</h3>
        <div class="receta-meta">
          <span>⏱ {tiempo} min</span>
          <span>⭐ {calificacion} ({opiniones})</span>
        </div>
      </div>
    </article>
  );
}