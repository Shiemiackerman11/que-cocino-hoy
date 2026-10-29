// client/src/pages/PerfilUsuario.jsx
import React, { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard';
import '../styles/PerfilUsuario.css';

export default function PerfilUsuario() {
  // Estado de navegación entre pestañas
  const [seccionActiva, setSeccionActiva] = useState('recetas');

  // Estado para la información del usuario
  const [usuario, setUsuario] = useState({
    nombre: 'Daniel Pérez',
    correo: 'daniel@ejemplo.com',
    inicial: 'D',
    stats: {
      guardadas: 12,
      comentarios: 8,
      enviadas: 2,
      aprobadas: 1,
    },
  });

  // Estado para recetas guardadas
  const [recetasGuardadas, setRecetasGuardadas] = useState([
    {
      id: 1,
      titulo: 'Pizza Artesanal de Pepperoni',
      categoria: 'Platos Fuertes',
      tiempo: 45,
      calificacion: 4.8,
      opiniones: 120,
      imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=70&fm=webp',
    },
    {
      id: 2,
      titulo: 'Ensalada de Garbanzo y Limón',
      categoria: 'Vegetarianos',
      tiempo: 15,
      calificacion: 4.5,
      opiniones: 85,
      imagen: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=70&fm=webp',
    },
  ]);

  // Estado para recetas enviadas
  const [recetasEnviadas, setRecetasEnviadas] = useState([
    {
      id: 101,
      titulo: 'Ensalada Mediterránea',
      fecha: '12 de Octubre, 2023',
      estado: 'aprobada',
      mensajeEstado: 'Aprobada y publicada',
      imagen: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&q=70&fm=webp',
    },
    {
      id: 102,
      titulo: 'Pizza Casera con Masa Madre',
      fecha: 'Hace 2 días',
      estado: 'pendiente',
      mensajeEstado: 'Pendiente de revisión',
      imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=150&q=70&fm=webp',
    },
    {
      id: 103,
      titulo: 'Pastel de Chocolate Rápido',
      fecha: '5 de Octubre, 2023',
      estado: 'rechazada',
      mensajeEstado: 'Rechazada - Faltan pasos detallados',
      motivoRechazo: 'La receta no especifica las cantidades exactas de los ingredientes. Por favor, edítala y vuelve a enviarla.',
      imagen: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=150&q=70&fm=webp',
    },
  ]);

  // Estado del formulario para subir receta
  const [nuevaReceta, setNuevaReceta] = useState({
    titulo: '',
    categoria: '',
    descripcion: '',
    imagen: null,
    ingredientes: '',
    pasos: '',
  });

  /*
  // PREPARADO PARA CONEXIÓN FUTURA AL SERVIDOR:
  useEffect(() => {
    // async function fetchPerfil() {
    //   const response = await fetch('/api/usuarios/perfil');
    //   const data = await response.json();
    //   setUsuario(data.usuario);
    //   setRecetasGuardadas(data.guardadas);
    //   setRecetasEnviadas(data.enviadas);
    // }
    // fetchPerfil();
  }, []);
  */

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setNuevaReceta((prev) => ({ ...prev, [id]: value }));
  };

  const handleRemoveFavorite = (id) => {
    setRecetasGuardadas((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmitReceta = (e) => {
    e.preventDefault();
    alert('¡Receta enviada con éxito! Quedará en estado "Pendiente" hasta que el administrador la revise.');
    
    // Simulación de adición a la lista de enviadas
    const nuevaEnviada = {
      id: Date.now(),
      titulo: nuevaReceta.titulo,
      fecha: 'Justo ahora',
      estado: 'pendiente',
      mensajeEstado: 'Pendiente de revisión',
      imagen: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=150&q=70&fm=webp',
    };

    setRecetasEnviadas([nuevaEnviada, ...recetasEnviadas]);
    setNuevaReceta({
      titulo: '',
      categoria: '',
      descripcion: '',
      imagen: null,
      ingredientes: '',
      pasos: '',
    });
    setSeccionActiva('enviadas');
  };

  return (
    <div class="perfil-container">
      {/* ===== HEADER ===== */}
      <header class="perfil-header">
        <a href="/" class="perfil-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 11h18M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M12 3v4" />
            <path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
          </svg>
          Delicias Culinarias
        </a>
        <div class="header-right">
          <a href="/" class="header-link">Volver al inicio</a>
          <div class="user-menu">
            <div class="avatar">{usuario.inicial}</div>
            <span class="user-name">{usuario.nombre.split(' ')[0]}</span>
          </div>
        </div>
      </header>

      {/* ===== DASHBOARD LAYOUT ===== */}
      <div class="dashboard-layout">
        {/* SIDEBAR */}
        <aside class="sidebar">
          <div class="perfil-card">
            <div class="perfil-avatar-grande">{usuario.inicial}</div>
            <div class="perfil-info">
              <h2>{usuario.nombre}</h2>
              <p>{usuario.correo}</p>
            </div>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-number">{usuario.stats.guardadas}</span>
                <span class="stat-label">Guardadas</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{usuario.stats.comentarios}</span>
                <span class="stat-label">Comentarios</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{usuario.stats.enviadas}</span>
                <span class="stat-label">Enviadas</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{usuario.stats.aprobadas}</span>
                <span class="stat-label">Aprobadas</span>
              </div>
            </div>
          </div>

          {/* Menú de Navegación Lateral */}
          <ul class="sidebar-menu">
            <li>
              <button
                class={seccionActiva === 'recetas' ? 'active' : ''}
                onClick={() => setSeccionActiva('recetas')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Mis recetas guardadas
              </button>
            </li>
            <li>
              <button
                class={seccionActiva === 'subir' ? 'active' : ''}
                onClick={() => setSeccionActiva('subir')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Subir nueva receta
              </button>
            </li>
            <li>
              <button
                class={seccionActiva === 'enviadas' ? 'active' : ''}
                onClick={() => setSeccionActiva('enviadas')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                Mis recetas enviadas
              </button>
            </li>
            <li>
              <button
                class={seccionActiva === 'comentarios' ? 'active' : ''}
                onClick={() => setSeccionActiva('comentarios')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Mis comentarios
              </button>
            </li>
          </ul>

          <button class="btn-logout" onClick={() => alert('Cerrando sesión...')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main class="main-content">
          {/* SECCIÓN 1: RECETAS GUARDADAS */}
          {seccionActiva === 'recetas' && (
            <div class="seccion-contenido">
              <div class="content-header">
                <h1>Mis recetas guardadas</h1>
                <a href="/explorar" class="btn-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Explorar más recetas
                </a>
              </div>

              <div class="grid-recetas">
                {recetasGuardadas.map((receta) => (
                  <RecipeCard
                    key={receta.id}
                    receta={receta}
                    onToggleFavorite={handleRemoveFavorite}
                  />
                ))}
              </div>
            </div>
          )}

          {/* SECCIÓN 2: SUBIR NUEVA RECETA */}
          {seccionActiva === 'subir' && (
            <div class="seccion-contenido">
              <div class="content-header">
                <h1>Subir nueva receta</h1>
              </div>

              <div class="form-card">
                <div class="aviso-admin">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                  <div>
                    <strong>Aviso importante:</strong> Tu receta será enviada al administrador. Una vez que sea revisada y aprobada, aparecerá públicamente en el catálogo para todos los usuarios.
                  </div>
                </div>

                <form onSubmit={handleSubmitReceta}>
                  <div class="form-group">
                    <label htmlFor="titulo">Nombre de la receta</label>
                    <input
                      type="text"
                      id="titulo"
                      value={nuevaReceta.titulo}
                      onChange={handleInputChange}
                      placeholder="Ej. Tacos de pollo al limón"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label htmlFor="categoria">Categoría</label>
                    <select
                      id="categoria"
                      value={nuevaReceta.categoria}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecciona una categoría...</option>
                      <option value="entradas">Entradas</option>
                      <option value="platos-fuertes">Platos Fuertes</option>
                      <option value="postres">Postres</option>
                      <option value="bebidas">Bebidas</option>
                      <option value="vegetarianos">Vegetarianos</option>
                      <option value="especiales">Especiales</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label htmlFor="descripcion">Descripción corta</label>
                    <input
                      type="text"
                      id="descripcion"
                      value={nuevaReceta.descripcion}
                      onChange={handleInputChange}
                      placeholder="Una breve descripción de tu platillo"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label>Imagen del platillo</label>
                    <div
                      class="file-upload"
                      onClick={() => document.getElementById('fileInput').click()}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: '5px' }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <br />Haz clic para subir una foto (JPG, PNG)
                    </div>
                    <input type="file" id="fileInput" accept="image/*" style={{ display: 'none' }} />
                  </div>

                  <div class="form-group">
                    <label htmlFor="ingredientes">Ingredientes (uno por línea)</label>
                    <textarea
                      id="ingredientes"
                      value={nuevaReceta.ingredientes}
                      onChange={handleInputChange}
                      placeholder="2 tazas de harina&#10;1 cucharada de azúcar&#10;..."
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label htmlFor="pasos">Pasos de preparación</label>
                    <textarea
                      id="pasos"
                      value={nuevaReceta.pasos}
                      onChange={handleInputChange}
                      placeholder="1. Mezclar los ingredientes secos...&#10;2. Agregar el agua..."
                      required
                    />
                  </div>

                  <button type="submit" class="btn-submit">Enviar receta para revisión</button>
                </form>
              </div>
            </div>
          )}

          {/* SECCIÓN 3: MIS RECETAS ENVIADAS */}
          {seccionActiva === 'enviadas' && (
            <div class="seccion-contenido">
              <div class="content-header">
                <h1>Mis recetas enviadas</h1>
              </div>
              <p style={{ color: 'var(--color-texto-claro)', marginBottom: '20px', fontSize: '0.95rem' }}>
                Aquí puedes dar seguimiento al estado de las recetas que has compartido con la comunidad.
              </p>

              {recetasEnviadas.map((receta) => (
                <div
                  key={receta.id}
                  class="receta-enviada"
                  style={{ opacity: receta.estado === 'rechazada' ? 0.85 : 1 }}
                >
                  <img src={receta.imagen} alt={receta.titulo} />
                  <div class="receta-enviada-info">
                    <h4>{receta.titulo}</h4>
                    <p>Enviada: {receta.fecha}</p>

                    <span class={`badge badge-${receta.estado}`}>
                      {receta.estado === 'aprobada' && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {receta.estado === 'pendiente' && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      )}
                      {receta.estado === 'rechazada' && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      )}
                      {' '}{receta.mensajeEstado}
                    </span>

                    {receta.motivoRechazo && (
                      <p style={{ marginTop: '5px', fontSize: '0.75rem', color: '#dc2626' }}>
                        <strong>Motivo del admin:</strong> {receta.motivoRechazo}
                      </p>
                    )}
                  </div>

                  {receta.estado === 'aprobada' && (
                    <a href={`/receta/${receta.id}`} class="btn-primary" style={{ padding: '8px 15px', fontSize: '0.8rem' }}>
                      Ver en el catálogo
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* SECCIÓN 4: MIS COMENTARIOS */}
          {seccionActiva === 'comentarios' && (
            <div class="seccion-contenido">
              <div class="content-header">
                <h1>Mis comentarios</h1>
              </div>
              <p style={{ color: 'var(--color-texto-claro)' }}>Aquí se desplegarán tus comentarios e interacciones en otras recetas.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}