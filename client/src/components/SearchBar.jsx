// client/src/components/SearchBar.jsx
import { useId } from 'react';
import '../styles/SearchBar.css';

/**
 * variante "hero":   buscador grande sobre imagen, con chips de sugerencia.
 * variante "inline": buscador compacto dentro de una página de categoría.
 */
export default function SearchBar({
  valor,
  onCambio,
  onBuscar,
  placeholder = 'Buscar...',
  etiqueta = 'Buscar',
  sugerencias = [],
  variante = 'hero',
  ariaDescribedBy,
}) {
  const idInput = useId();

  const alEnviar = (e) => {
    e.preventDefault();
    onBuscar?.(valor);
  };

  const usarSugerencia = (texto) => {
    onCambio(texto);
    onBuscar?.(texto);
  };

  return (
    <form className={`buscador buscador--${variante}`} role="search" onSubmit={alEnviar}>
      <div className="buscador-caja">
        <svg className="icono-buscar" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        <label htmlFor={idInput} className="sr-only">{etiqueta}</label>
        <input
          type="search"
          id={idInput}
          value={valor}
          placeholder={placeholder}
          autoComplete="off"
          aria-describedby={ariaDescribedBy}
          onChange={(e) => onCambio(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && onCambio('')}
        />

        {valor && (
          <button type="button" className="btn-limpiar" aria-label="Limpiar búsqueda" onClick={() => onCambio('')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}

        <button type="submit" className="btn-buscar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <span>Buscar</span>
        </button>
      </div>

      {sugerencias.length > 0 && (
        <div className="sugerencias-rapidas">
          <span>Prueba:</span>
          {sugerencias.map((texto) => (
            <button key={texto} type="button" className="chip-sugerencia" onClick={() => usarSugerencia(texto)}>
              {texto}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
