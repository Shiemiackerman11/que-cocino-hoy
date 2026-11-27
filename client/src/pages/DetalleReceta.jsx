// client/src/pages/DetalleReceta.jsx  (ruta /receta/:id)
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SimpleHeader from '../components/SimpleHeader';
import { agregarFavorito, obtenerReceta, quitarFavorito } from '../services/recetasService';
import { cerrarSesion, obtenerToken } from '../services/authService';
import { generarRecetaPdf } from '../utils/generarRecetaPdf';
import { formatearTiempo } from '../utils/texto';
import '../styles/DetalleReceta.css';

const ESTRELLAS = [1, 2, 3, 4, 5];

export default function DetalleReceta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receta, setReceta] = useState(null);
  const [estado, setEstado] = useState('cargando'); // cargando | listo | error
  const [error, setError] = useState(null);
  const [favorita, setFavorita] = useState(false);
  const [guardandoFavorito, setGuardandoFavorito] = useState(false);
  const [errorFavorito, setErrorFavorito] = useState('');
  const [puntos, setPuntos] = useState(0);
  const [puntosHover, setPuntosHover] = useState(0);

  useEffect(() => {
    let activo = true;
    setEstado('cargando');
    setError(null);
    setFavorita(false);
    setErrorFavorito('');
    setPuntos(0);

    obtenerReceta(id)
      .then((datos) => {
        if (!activo) return;
        setReceta(datos);
        setFavorita(Boolean(datos.favorita));
        document.title = `${datos.titulo} - Qué cocino hoy`;
        setEstado('listo');
      })
      .catch((err) => {
        if (!activo) return;
        setError(err);
        setEstado('error');
      });

    return () => {
      activo = false;
    };
  }, [id]);

  // Guardar o quitar de favoritos (requiere sesión). La calificación con estrellas sigue siendo local.
  const alternarFavorito = async () => {
    if (!obtenerToken()) {
      navigate('/login');
      return;
    }
    setGuardandoFavorito(true);
    setErrorFavorito('');
    try {
      if (favorita) await quitarFavorito(receta.id);
      else await agregarFavorito(receta.id);
      setFavorita(!favorita);
    } catch (err) {
      if (err.status === 401) {
        cerrarSesion();
        navigate('/login');
        return;
      }
      setErrorFavorito(err.message);
    } finally {
      setGuardandoFavorito(false);
    }
  };

  const estrellasActivas = puntosHover || puntos;

  if (estado !== 'listo') {
    return (
      <div className="pagina-receta">
        <SimpleHeader volverA="/" textoVolver="← Volver al catálogo" />
        <main className="mensaje-estado">
          {estado === 'cargando' ? (
            <p>Cargando receta...</p>
          ) : (
            <>
              <h2>{error?.status === 404 ? 'No encontramos esta receta' : 'No pudimos cargar la receta'}</h2>
              <p>
                {error?.status === 404 || !error?.message
                  ? 'Puede que haya sido retirada o que el enlace esté incompleto.'
                  : error.message}
              </p>
              <Link to="/" className="btn-volver">Volver al catálogo</Link>
            </>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="pagina-receta">
      <SimpleHeader volverA={`/categoria/${receta.categoriaId}`} textoVolver="← Volver al catálogo" />

      <main className="contenedor-receta">
        <div className="columna-imagen">
          {receta.imagen ? (
            <img src={receta.imagen} alt={receta.titulo} className="imagen-principal" />
          ) : (
            <div className="imagen-principal--vacia" aria-hidden="true">🍽️</div>
          )}
          <div className="tarjeta-datos">
            <div className="dato-item">
              <span className="dato-icono">⏱️</span>
              <span className="dato-label">Tiempo</span>
              <span className="dato-valor">{formatearTiempo(receta.tiempo)}</span>
            </div>
            <div className="dato-item">
              <span className="dato-icono">👨‍🍳</span>
              <span className="dato-label">Complejidad</span>
              <span className="dato-valor">{receta.complejidad ?? 'N/D'}</span>
            </div>
          </div>
        </div>

        <div className="columna-contenido">
          <span className="categoria-badge">{receta.categoria}</span>
          <h1 className="titulo-receta">{receta.titulo}</h1>
          <p className="descripcion-receta">{receta.descripcionLarga ?? receta.descripcion}</p>

          <div className="acciones-container">
            <button
              type="button"
              className="btn-descargar-pdf"
              onClick={() => generarRecetaPdf(receta)}
            >
              ⬇️ Descargar receta 
            </button>
            
            <button
              type="button"
              className={`btn-guardar${favorita ? ' guardada' : ''}`}
              aria-pressed={favorita}
              disabled={guardandoFavorito}
              onClick={alternarFavorito}
            >
              {favorita ? '❤️ Guardada en favoritos' : '🤍 Guardar en favoritos'}
            </button>

            <div className="puntuacion-container">
              <span className="puntuacion-texto">Califica:</span>
              <div className="estrellas" onMouseLeave={() => setPuntosHover(0)}>
                {ESTRELLAS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`estrella${n <= estrellasActivas ? ' activa' : ''}`}
                    aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
                    aria-pressed={n === puntos}
                    onMouseEnter={() => setPuntosHover(n)}
                    onFocus={() => setPuntosHover(n)}
                    onBlur={() => setPuntosHover(0)}
                    onClick={() => setPuntos(n)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>

          {errorFavorito && <p className="error-favorito" role="alert">{errorFavorito}</p>}

          <section className="seccion-receta">
            <h2 className="seccion-titulo">Ingredientes</h2>
            {receta.ingredientes.length > 0 ? (
              <ul className="lista-ingredientes">
                {receta.ingredientes.map((ing, indice) => (
                  <li key={`${indice}-${ing.nombre}`}>
                    <span className="ingrediente-cantidad">{ing.cantidad}</span>
                    <span>{ing.nombre}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="sin-datos">Esta receta no incluye la lista de ingredientes.</p>
            )}
          </section>

          <section className="seccion-receta">
            <h2 className="seccion-titulo">Pasos de preparación</h2>
            {receta.pasos.length > 0 ? (
              <ol className="lista-pasos">
                {receta.pasos.map((paso, indice) => (
                  <li key={`${indice}-${paso.titulo}`}>
                    <strong>{paso.titulo}:</strong> {paso.texto}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="sin-datos">Esta receta no incluye los pasos de preparación.</p>
            )}
          </section>

          <p className="atribucion">
            Receta de{' '}
            {receta.fuente?.url ? (
              <a href={receta.fuente.url} target="_blank" rel="noopener noreferrer">
                {receta.fuente.nombre ?? 'la fuente original'}
              </a>
            ) : (
              receta.fuente?.nombre ?? 'la fuente original'
            )}
            . Datos de{' '}
            <a href={receta.spoonacularUrl} target="_blank" rel="noopener noreferrer">
              spoonacular
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
