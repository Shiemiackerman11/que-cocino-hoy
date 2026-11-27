// client/src/pages/Inicio.jsx
import { useEffect, useId, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import CategoryCard from '../components/CategoryCard';
import RecipeListCard from '../components/RecipeListCard';
import { buscarRecetas, obtenerCategorias } from '../services/recetasService';
import useDebounce from '../utils/useDebounce';
import '../styles/Inicio.css';

const SUGERENCIAS = ['tacos', 'pizza', 'postres', 'bebidas'];
const RECETAS_POR_PAGINA = 12;
const MIN_CARACTERES_BUSQUEDA = 2;

function irACategorias() {
  document.getElementById('categorias')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Lleva a los resultados de recetas si ya se están mostrando; si no, a las categorías.
function irAResultados() {
  requestAnimationFrame(() => {
    const destino = document.getElementById('resultados') ?? document.getElementById('categorias');
    destino?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

const BUSQUEDA_INICIAL = {
  estado: 'inactivo', // inactivo | cargando | listo | error
  datos: [],
  total: 0,
  pagina: 1,
  totalPaginas: 0,
  criterios: { q: '', ingredientes: [] },
  error: '',
};

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

  // Estado 3: recetas encontradas en Spoonacular (por nombre y/o ingredientes)
  const [busqueda, setBusqueda] = useState(BUSQUEDA_INICIAL);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [errorMas, setErrorMas] = useState('');
  const idBusqueda = useRef(0); // descarta respuestas de búsquedas ya reemplazadas

  const consultaLimpia = consulta.trim();
  const consultaRetrasada = useDebounce(consultaLimpia, 500);
  const ingredientesClave = ingredientes.join(',');

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

  // --- Búsqueda de recetas: nombre y/o ingredientes, con espera para no gastar consultas por tecla ---
  useEffect(() => {
    const q = consultaRetrasada.length >= MIN_CARACTERES_BUSQUEDA ? consultaRetrasada : '';
    const lista = ingredientesClave ? ingredientesClave.split(',') : [];
    const identificador = ++idBusqueda.current;
    const controlador = new AbortController();
    setErrorMas('');

    if (!q && lista.length === 0) {
      setBusqueda(BUSQUEDA_INICIAL);
      return undefined;
    }

    setBusqueda((previa) => ({ ...previa, estado: 'cargando', error: '' }));
    buscarRecetas({ q, ingredientes: lista, pagina: 1, limite: RECETAS_POR_PAGINA, signal: controlador.signal })
      .then(({ datos, paginacion }) => {
        if (identificador !== idBusqueda.current) return;
        setBusqueda({
          estado: 'listo',
          datos,
          total: paginacion.total,
          pagina: 1,
          totalPaginas: paginacion.total_paginas,
          criterios: { q, ingredientes: lista },
          error: '',
        });
      })
      .catch((err) => {
        if (err.name === 'AbortError' || identificador !== idBusqueda.current) return;
        setBusqueda({ ...BUSQUEDA_INICIAL, estado: 'error', error: err.message });
      });

    return () => controlador.abort();
  }, [consultaRetrasada, ingredientesClave]);

  const cargarMasRecetas = async () => {
    const identificador = idBusqueda.current;
    const siguiente = busqueda.pagina + 1;
    setCargandoMas(true);
    setErrorMas('');
    try {
      const { datos, paginacion } = await buscarRecetas({
        ...busqueda.criterios,
        pagina: siguiente,
        limite: RECETAS_POR_PAGINA,
      });
      if (identificador !== idBusqueda.current) return;
      setBusqueda((previa) => {
        const yaMostradas = new Set(previa.datos.map((r) => r.id));
        return {
          ...previa,
          datos: [...previa.datos, ...datos.filter((r) => !yaMostradas.has(r.id))],
          pagina: siguiente,
          totalPaginas: paginacion.total_paginas,
        };
      });
    } catch (err) {
      if (identificador === idBusqueda.current) setErrorMas(err.message);
    } finally {
      setCargandoMas(false);
    }
  };

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
    irAResultados();
  };

  const hayBusqueda = consultaLimpia.length >= MIN_CARACTERES_BUSQUEDA || ingredientes.length > 0;
  // "inactivo" con texto escrito = la búsqueda está esperando a que dejes de teclear.
  const buscando = hayBusqueda && (busqueda.estado === 'cargando' || busqueda.estado === 'inactivo');
  const sinResultados = busqueda.estado === 'listo' && busqueda.datos.length === 0;
  const hayMasPaginas = busqueda.estado === 'listo' && busqueda.pagina < busqueda.totalPaginas;

  const aplicarSugerencia = (texto) => {
    setConsulta(texto);
    irAResultados();
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
            onBuscar={irAResultados}
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

      {hayBusqueda && (
        <section className="resultados-seccion" id="resultados" aria-labelledby="titulo-resultados">
          <div className="resultados-header">
            <h2 id="titulo-resultados">Recetas encontradas</h2>
            <p className="contador-resultados" id="contadorResultados" aria-live="polite">
              {buscando && 'Buscando recetas...'}
              {busqueda.estado === 'listo' &&
                (sinResultados ? (
                  <>Sin resultados</>
                ) : (
                  <>
                    Mostrando <strong>{busqueda.datos.length}</strong> de{' '}
                    <strong>{busqueda.total.toLocaleString('es-MX')}</strong> recetas
                  </>
                ))}
              {busqueda.estado === 'listo' && busqueda.criterios.q && (
                <> para <strong>“{busqueda.criterios.q}”</strong></>
              )}
              {busqueda.estado === 'listo' && busqueda.criterios.ingredientes.length > 0 && (
                <> con <strong>{busqueda.criterios.ingredientes.join(', ')}</strong></>
              )}
            </p>
          </div>

          {busqueda.estado === 'error' && (
            <p className="estado-carga estado-carga--error" role="alert">{busqueda.error}</p>
          )}

          {busqueda.datos.length > 0 && (
            <div className="grid-recetas">
              {busqueda.datos.map((receta) => (
                <RecipeListCard key={receta.id} receta={receta} />
              ))}
            </div>
          )}

          {hayMasPaginas && (
            <div className="contenedor-ver-mas">
              <button type="button" className="btn-ver-mas" onClick={cargarMasRecetas} disabled={cargandoMas}>
                {cargandoMas ? 'Cargando...' : 'Ver más recetas'}
              </button>
            </div>
          )}
          {errorMas && <p className="estado-carga estado-carga--error" role="alert">{errorMas}</p>}

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
      )}

      <section className="categorias-seccion" id="categorias">
        <div className="categorias-header">
          <span className="etiqueta">— Explora nuestro menú</span>
          <h2>¿Qué se te antoja hoy?</h2>
          <p>Navega por nuestras categorías y encuentra tu próximo platillo favorito.</p>
        </div>

        {cargando && <p className="estado-carga">Cargando categorías...</p>}
        {error && <p className="estado-carga estado-carga--error">{error}</p>}

        <div className="grid-categorias">
          {categorias.map((cat) => (
            <CategoryCard key={cat.id} categoria={cat} />
          ))}
        </div>
      </section>
    </div>
  );
}