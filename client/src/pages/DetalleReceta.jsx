// client/src/pages/DetalleReceta.jsx  (ruta /receta/:id)
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SimpleHeader from '../components/SimpleHeader';
import { obtenerReceta } from '../services/recetasService';
import '../styles/DetalleReceta.css';

const ESTRELLAS = [1, 2, 3, 4, 5];

export default function DetalleReceta() {
  const { id } = useParams();
  const [receta, setReceta] = useState(null);
  const [estado, setEstado] = useState('cargando'); // cargando | listo | error
  const [favorita, setFavorita] = useState(false);
  const [puntos, setPuntos] = useState(0);
  const [puntosHover, setPuntosHover] = useState(0);

  useEffect(() => {
    let activo = true;
    setEstado('cargando');
    setFavorita(false);
    setPuntos(0);

    obtenerReceta(id)
      .then((datos) => {
        if (!activo) return;
        setReceta(datos);
        document.title = `${datos.titulo} - Qué cocino hoy`;
        setEstado('listo');
      })
      .catch(() => activo && setEstado('error'));

    return () => {
      activo = false;
    };
  }, [id]);

  // TODO: al conectar el servidor, enviar favorito y calificación a la API.
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
              <h2>No encontramos esta receta</h2>
              <p>Puede que haya sido retirada o que el enlace esté incompleto.</p>
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
          <img src={receta.imagen} alt={receta.titulo} className="imagen-principal" />
          <div className="tarjeta-datos">
            <div className="dato-item">
              <span className="dato-icono">⏱️</span>
              <span className="dato-label">Tiempo</span>
              <span className="dato-valor">{receta.tiempo} min</span>
            </div>
            <div className="dato-item">
              <span className="dato-icono">👨‍🍳</span>
              <span className="dato-label">Complejidad</span>
              <span className="dato-valor">{receta.complejidad}</span>
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
              className={`btn-guardar${favorita ? ' guardada' : ''}`}
              aria-pressed={favorita}
              onClick={() => setFavorita((actual) => !actual)}
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

          <section className="seccion-receta">
            <h2 className="seccion-titulo">Ingredientes</h2>
            <ul className="lista-ingredientes">
              {receta.ingredientes.map((ing) => (
                <li key={`${ing.cantidad}-${ing.nombre}`}>
                  <span className="ingrediente-cantidad">{ing.cantidad}</span>
                  <span>{ing.nombre}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="seccion-receta">
            <h2 className="seccion-titulo">Pasos de preparación</h2>
            <ol className="lista-pasos">
              {receta.pasos.map((paso) => (
                <li key={paso.titulo}>
                  <strong>{paso.titulo}:</strong> {paso.texto}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>
    </div>
  );
}
