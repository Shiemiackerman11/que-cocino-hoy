// client/src/pages/Inicio.jsx
import { useEffect, useId, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import CategoryCard from '../components/CategoryCard';
import { obtenerCategorias } from '../services/recetasService';
import { normalizar } from '../utils/texto';
import '../styles/Inicio.css';

const SUGERENCIAS = ['tacos', 'pizza', 'postres', 'bebidas'];

function irACategorias() {
  document.getElementById('categorias')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Inicio() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Estado 1: Búsqueda por nombre de receta/categoría
  const [consulta, setConsulta] = useState('');

  // Estado 2: Búsqueda por ingredientes encapsulados
  const [ingredientes, setIngredientes] = useState([]);
  const [inputIngrediente, setInputIngrediente] = useState('');
  const idInputIngredientes = useId();

  useEffect(() => {
    document.title = 'Delicias Culinarias - Menú Dinámico';
    let activo = true;

    obtenerCategorias()
      .then((datos) => activo && setCategorias(datos))
      .catch((err) => activo && setError(err.message))
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
  }, []);

  // --- Lógica de encapsulamiento de ingredientes ---
  const agregarIngrediente = (textoCrudo) => {
    // Permite pegar varios ingredientes separados por coma o espacio de golpe
    const nuevos = textoCrudo
      .split(/[\s,]+/)
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    if (nuevos.length === 0) return;

    setIngredientes((prev) => {
      const conjunto = new Set(prev);
      nuevos.forEach((ing) => conjunto.add(ing));
      return Array.from(conjunto);
    });
    setInputIngrediente('');
  };

  const manejarCambioIngrediente = (e) => {
    const valor = e.target.value;
    // Si el último carácter escrito es espacio o coma, encapsula inmediatamente
    if (/[\s,]$/.test(valor)) {
      agregarIngrediente(valor);
    } else {
      setInputIngrediente(valor);
    }
  };

  const manejarTeclaIngrediente = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputIngrediente.trim()) {
        agregarIngrediente(inputIngrediente);
      } else {
        irACategorias();
      }
    } else if (e.key === 'Backspace' && inputIngrediente === '' && ingredientes.length > 0) {
      // Borra la última cápsula si el input está vacío
      setIngredientes((prev) => prev.slice(0, -1));
    } else if (e.key === 'Escape') {
      setInputIngrediente('');
    }
  };

  const eliminarIngrediente = (ingredienteAEliminar) => {
    setIngredientes((prev) => prev.filter((item) => item !== ingredienteAEliminar));
  };

  const limpiarIngredientes = () => {
    setIngredientes([]);
    setInputIngrediente('');
  };

  const manejarSubmitIngredientes = (e) => {
    e.preventDefault();
    if (inputIngrediente.trim()) {
      agregarIngrediente(inputIngrediente);
    }
    irACategorias();
  };

  // --- Filtrado combinado (consulta + ingredientes) ---
  const resultados = useMemo(() => {
    const q = normalizar(consulta);

    return categorias.filter((c) => {
      const textoCategoria = normalizar(`${c.nombre} ${c.palabrasClave}`);

      const coincideConsulta = !q || textoCategoria.includes(q);
      const coincideIngredientes =
        ingredientes.length === 0 ||
        ingredientes.every((ing) => textoCategoria.includes(normalizar(ing)));

      return coincideConsulta && coincideIngredientes;
    });
  }, [categorias, consulta, ingredientes]);

  const hayConsulta = consulta.trim() !== '' || ingredientes.length > 0;
  const sinResultados = hayConsulta && resultados.length === 0;

  const aplicarSugerencia = (texto) => {
    setConsulta(texto);
    irACategorias();
  };

  return (
    <div className="pagina-inicio">
      <Navbar categorias={categorias} />

      <section className="hero-inicio">
        <h1>Bienvenido a Delicias Culinarias</h1>
        <p>Busca tu platillo favorito o filtra por los ingredientes que tienes en casa.</p>

        <div className="hero-buscadores">
          {/* Barra 1: Búsqueda de recetas */}
          <SearchBar
            valor={consulta}
            onCambio={setConsulta}
            onBuscar={irACategorias}
            placeholder="Busca tacos, pizza, postres..."
            etiqueta="Buscar recetas de cocina"
            sugerencias={SUGERENCIAS}
            ariaDescribedBy="contadorResultados"
          />

          {/* Barra 2: Búsqueda por ingredientes encapsulados */}
          <form
            className="buscador buscador--hero buscador--ingredientes"
            role="search"
            onSubmit={manejarSubmitIngredientes}
          >
            <div className="buscador-caja buscador-caja--tags">
              <svg className="icono-buscar" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M2 12h20" />
              </svg>

              <label htmlFor={idInputIngredientes} className="sr-only">
                Ingresar ingredientes separados por espacio o coma
              </label>

              <div className="tags-contenedor">
                {ingredientes.map((ing) => (
                  <span key={ing} className="tag-ingrediente">
                    {ing}
                    <button
                      type="button"
                      aria-label={`Quitar ingrediente ${ing}`}
                      onClick={() => eliminarIngrediente(ing)}
                    >
                      ×
                    </button>
                  </span>
                ))}

                <input
                  type="text"
                  id={idInputIngredientes}
                  value={inputIngrediente}
                  placeholder={
                    ingredientes.length === 0
                      ? 'Ingredientes (ej. pollo, tomate, ajo)...'
                      : 'Añadir otro...'
                  }
                  autoComplete="off"
                  onChange={manejarCambioIngrediente}
                  onKeyDown={manejarTeclaIngrediente}
                  onBlur={() => inputIngrediente.trim() && agregarIngrediente(inputIngrediente)}
                />
              </div>

              {(ingredientes.length > 0 || inputIngrediente) && (
                <button
                  type="button"
                  className="btn-limpiar"
                  aria-label="Limpiar ingredientes"
                  onClick={limpiarIngredientes}
                >
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
                <span>Filtrar</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="categorias-seccion" id="categorias">
        <div className="categorias-header">
          <span className="etiqueta">— Explora nuestro menú</span>
          <h2>¿Qué se te antoja hoy?</h2>
          <p>Navega por nuestras categorías y encuentra tu próximo platillo favorito.</p>
        </div>

        <p className="contador-resultados" id="contadorResultados" aria-live="polite">
          {hayConsulta &&
            (sinResultados ? (
              <>
                Sin resultados
                {consulta && <> para <strong>“{consulta}”</strong></>}
                {ingredientes.length > 0 && <> con ingredientes: <strong>{ingredientes.join(', ')}</strong></>}
              </>
            ) : (
              <>
                Mostrando <strong>{resultados.length}</strong> de {categorias.length} categorías
                {consulta && <> para <strong>“{consulta}”</strong></>}
                {ingredientes.length > 0 && <> con <strong>{ingredientes.join(', ')}</strong></>}
              </>
            ))}
        </p>

        {cargando && <p className="estado-carga">Cargando categorías...</p>}
        {error && <p className="estado-carga estado-carga--error">{error}</p>}

        <div className="grid-categorias">
          {resultados.map((cat) => (
            <CategoryCard key={cat.id} categoria={cat} />
          ))}
        </div>

        {sinResultados && (
          <div className="estado-vacio">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <path d="M8 11h6" />
            </svg>
            <h3>No encontramos resultados</h3>
            <p>Intenta con otra palabra, quita algún ingrediente o explora nuestras categorías populares.</p>
            <div className="sugerencias-vacio">
              {SUGERENCIAS.slice(0, 3).map((texto) => (
                <button key={texto} type="button" className="chip-sugerencia" onClick={() => aplicarSugerencia(texto)}>
                  {texto}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}