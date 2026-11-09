// client/src/pages/Inicio.jsx
import { useEffect, useMemo, useState } from 'react';
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
  const [consulta, setConsulta] = useState('');

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

  const resultados = useMemo(() => {
    const q = normalizar(consulta);
    if (!q) return categorias;
    return categorias.filter((c) => normalizar(`${c.nombre} ${c.palabrasClave}`).includes(q));
  }, [categorias, consulta]);

  const hayConsulta = consulta.trim() !== '';
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
        <p>Busca tu platillo favorito o explora por categorías.</p>

        <SearchBar
          valor={consulta}
          onCambio={setConsulta}
          onBuscar={irACategorias}
          placeholder="Busca tacos, pizza, postres..."
          etiqueta="Buscar platillos"
          sugerencias={SUGERENCIAS}
          ariaDescribedBy="contadorResultados"
        />
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
              <>Sin resultados para <strong>“{consulta}”</strong></>
            ) : (
              <>
                Mostrando <strong>{resultados.length}</strong> de {categorias.length} categorías para{' '}
                <strong>“{consulta}”</strong>
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
            <p>Intenta con otra palabra o explora nuestras categorías populares.</p>
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
