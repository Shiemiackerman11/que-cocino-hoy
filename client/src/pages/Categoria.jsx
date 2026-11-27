// client/src/pages/Categoria.jsx
// Una sola vista para Entradas, Postres, Bebidas, etc. (ruta /categoria/:id).
// Las recetas vienen de Spoonacular a través del servidor.
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SimpleHeader from '../components/SimpleHeader';
import SearchBar from '../components/SearchBar';
import RecipeListCard from '../components/RecipeListCard';
import { obtenerCategoria, obtenerRecetasPorCategoria } from '../services/recetasService';
import useDebounce from '../utils/useDebounce';
import '../styles/Categoria.css';

const RECETAS_POR_PAGINA = 12;
const MIN_CARACTERES_BUSQUEDA = 2;

// `key={id}` reinicia todo el estado al cambiar de categoría.
export default function Categoria() {
  const { id } = useParams();
  return <VistaCategoria key={id} id={id} />;
}

function VistaCategoria({ id }) {
  const [categoria, setCategoria] = useState(null);
  const [errorCategoria, setErrorCategoria] = useState(null);

  const [recetas, setRecetas] = useState([]);
  const [paginacion, setPaginacion] = useState({ pagina: 1, totalPaginas: 0 });
  const [estado, setEstado] = useState('cargando'); // cargando | listo | error
  const [error, setError] = useState('');
  const [reintento, setReintento] = useState(0);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [errorMas, setErrorMas] = useState('');

  const [consulta, setConsulta] = useState('');
  const consultaRetrasada = useDebounce(consulta.trim(), 500);
  const q = consultaRetrasada.length >= MIN_CARACTERES_BUSQUEDA ? consultaRetrasada : '';
  const idBusqueda = useRef(0); // descarta respuestas de búsquedas ya reemplazadas

  // Datos de la categoría (nombre, descripción, cantidad)
  useEffect(() => {
    let activo = true;
    obtenerCategoria(id)
      .then((datos) => {
        if (!activo) return;
        setCategoria(datos);
        document.title = `${datos.nombre} - Qué cocino hoy`;
      })
      .catch((err) => activo && setErrorCategoria(err));
    return () => {
      activo = false;
    };
  }, [id]);

  // Recetas de la categoría (primera página; se repite al cambiar la búsqueda dentro de la categoría)
  useEffect(() => {
    const identificador = ++idBusqueda.current;
    const controlador = new AbortController();
    setEstado('cargando');
    setErrorMas('');

    obtenerRecetasPorCategoria(id, { q, pagina: 1, limite: RECETAS_POR_PAGINA, signal: controlador.signal })
      .then(({ datos, paginacion: pag }) => {
        if (identificador !== idBusqueda.current) return;
        setRecetas(datos);
        setPaginacion({ pagina: 1, totalPaginas: pag.total_paginas });
        setEstado('listo');
      })
      .catch((err) => {
        if (err.name === 'AbortError' || identificador !== idBusqueda.current) return;
        setError(err.message);
        setEstado('error');
      });

    return () => controlador.abort();
  }, [id, q, reintento]);

  const cargarMas = async () => {
    const identificador = idBusqueda.current;
    const siguiente = paginacion.pagina + 1;
    setCargandoMas(true);
    setErrorMas('');
    try {
      const { datos, paginacion: pag } = await obtenerRecetasPorCategoria(id, {
        q,
        pagina: siguiente,
        limite: RECETAS_POR_PAGINA,
      });
      if (identificador !== idBusqueda.current) return;
      setRecetas((previas) => {
        const yaMostradas = new Set(previas.map((r) => r.id));
        return [...previas, ...datos.filter((r) => !yaMostradas.has(r.id))];
      });
      setPaginacion({ pagina: siguiente, totalPaginas: pag.total_paginas });
    } catch (err) {
      if (identificador === idBusqueda.current) setErrorMas(err.message);
    } finally {
      setCargandoMas(false);
    }
  };

  if (errorCategoria?.status === 404) {
    return (
      <div className="pagina-categoria">
        <SimpleHeader />
        <main className="contenedor-grid">
          <div className="mensaje-estado">
            <h2>No encontramos esta categoría</h2>
            <p>Puede que el enlace esté mal escrito o que la categoría ya no exista.</p>
            <Link to="/" className="btn-volver">Ver todas las categorías</Link>
          </div>
        </main>
      </div>
    );
  }

  const hayMasPaginas = estado === 'listo' && paginacion.pagina < paginacion.totalPaginas;

  return (
    <div className="pagina-categoria">
      <SimpleHeader />

      <section className="hero-categoria">
        <h1>{categoria ? categoria.nombre : errorCategoria ? 'Recetas' : 'Cargando...'}</h1>
        {categoria && <p>{categoria.descripcion}</p>}
      </section>

      <div className="barra-herramientas">
        <SearchBar
          variante="inline"
          valor={consulta}
          onCambio={setConsulta}
          placeholder={`Buscar dentro de ${categoria ? categoria.nombre : 'la categoría'}...`}
          etiqueta="Buscar recetas en esta categoría"
        />
      </div>

      <main className="contenedor-grid">
        {estado === 'cargando' && <p className="mensaje-estado">Cargando recetas...</p>}

        {estado === 'error' && (
          <div className="mensaje-estado" role="alert">
            <h2>No pudimos cargar las recetas</h2>
            <p>{error}</p>
            <button type="button" className="btn-ver-mas" onClick={() => setReintento((n) => n + 1)}>
              Reintentar
            </button>
          </div>
        )}

        {estado === 'listo' && recetas.length === 0 && !q && (
          <div className="mensaje-estado">
            <h2>Aún no hay recetas aquí</h2>
            <p>Estamos preparando esta categoría. Mientras tanto, explora las demás.</p>
            <Link to="/" className="btn-volver">Ver todas las categorías</Link>
          </div>
        )}

        {estado === 'listo' && recetas.length === 0 && q && (
          <div className="mensaje-estado">
            <h2>Sin resultados para “{q}”</h2>
            <p>Prueba con otro nombre o ingrediente.</p>
          </div>
        )}

        {estado === 'listo' && recetas.length > 0 && (
          <div className="grid-recetas">
            {recetas.map((receta) => (
              <RecipeListCard key={receta.id} receta={receta} />
            ))}
          </div>
        )}

        {hayMasPaginas && (
          <div className="contenedor-ver-mas">
            <button type="button" className="btn-ver-mas" onClick={cargarMas} disabled={cargandoMas}>
              {cargandoMas ? 'Cargando...' : 'Ver más recetas'}
            </button>
          </div>
        )}
        {errorMas && <p className="mensaje-estado" role="alert">{errorMas}</p>}
      </main>
    </div>
  );
}
