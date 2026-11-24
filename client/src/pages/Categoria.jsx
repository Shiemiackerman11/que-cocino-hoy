// client/src/pages/Categoria.jsx
// Una sola vista para Platillos, Postres, Bebidas, etc. (ruta /categoria/:id)
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SimpleHeader from '../components/SimpleHeader';
import SearchBar from '../components/SearchBar';
import RecipeListCard from '../components/RecipeListCard';
import { obtenerCategoria, obtenerRecetasPorCategoria } from '../services/recetasService';
import { normalizar } from '../utils/texto';
import '../styles/Categoria.css';

export default function Categoria() {
  const { id } = useParams();
  const [categoria, setCategoria] = useState(null);
  const [recetas, setRecetas] = useState([]);
  const [estado, setEstado] = useState('cargando'); // cargando | listo | error
  const [consulta, setConsulta] = useState('');

  useEffect(() => {
    let activo = true;
    setEstado('cargando');
    setConsulta('');

    Promise.all([obtenerCategoria(id), obtenerRecetasPorCategoria(id)])
      .then(([cat, lista]) => {
        if (!activo) return;
        setCategoria(cat);
        setRecetas(lista);
        document.title = `${cat.nombre} - Qué cocino hoy`;
        setEstado('listo');
      })
      .catch(() => activo && setEstado('error'));

    return () => {
      activo = false;
    };
  }, [id]);

  const visibles = useMemo(() => {
    const q = normalizar(consulta);
    if (!q) return recetas;
    return recetas.filter((r) => normalizar(`${r.titulo} ${r.descripcion}`).includes(q));
  }, [recetas, consulta]);

  if (estado === 'error') {
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

  return (
    <div className="pagina-categoria">
      <SimpleHeader />

      <section className="hero-categoria">
        <h1>{categoria ? categoria.nombre : 'Cargando...'}</h1>
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

        {estado === 'listo' && recetas.length === 0 && (
          <div className="mensaje-estado">
            <h2>Aún no hay recetas aquí</h2>
            <p>Estamos preparando esta categoría. Mientras tanto, explora las demás.</p>
            <Link to="/" className="btn-volver">Ver todas las categorías</Link>
          </div>
        )}

        {estado === 'listo' && recetas.length > 0 && visibles.length === 0 && (
          <div className="mensaje-estado">
            <h2>Sin resultados para “{consulta}”</h2>
            <p>Prueba con otro nombre o ingrediente.</p>
          </div>
        )}

        <div className="grid-recetas">
          {visibles.map((receta) => (
            <RecipeListCard key={receta.id} receta={receta} />
          ))}
        </div>
      </main>
    </div>
  );
}
