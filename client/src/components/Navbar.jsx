// client/src/components/Navbar.jsx
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { obtenerUsuario } from '../services/authService';
import '../styles/Navbar.css';

export default function Navbar({ categorias = [] }) {
  const [menuMovil, setMenuMovil] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const dropdownRef = useRef(null);
  const toggleRef = useRef(null);
  const usuario = obtenerUsuario();

  // Cierra el mega-menú al hacer clic fuera o presionar Escape.
  useEffect(() => {
    if (!dropdownAbierto) return undefined;

    const alHacerClic = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownAbierto(false);
    };
    const alPresionarTecla = (e) => {
      if (e.key === 'Escape') {
        setDropdownAbierto(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener('click', alHacerClic);
    document.addEventListener('keydown', alPresionarTecla);
    return () => {
      document.removeEventListener('click', alHacerClic);
      document.removeEventListener('keydown', alPresionarTecla);
    };
  }, [dropdownAbierto]);

  const cerrarMenus = () => {
    setDropdownAbierto(false);
    setMenuMovil(false);
  };

  return (
    <header className="navbar">
      <div className="menu-container">
        <Link to="/" className="logo" onClick={cerrarMenus}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 11h18M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M12 3v4" />
            <path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
          </svg>
          Delicias Culinarias
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-label="Abrir menú"
          aria-expanded={menuMovil}
          onClick={() => setMenuMovil((abierto) => !abierto)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>

        <nav aria-label="Navegación principal">
          <ul className={`nav-menu${menuMovil ? ' active' : ''}`}>
            <li>
              <NavLink to="/" end onClick={cerrarMenus}>Inicio</NavLink>
            </li>

            <li className={`dropdown${dropdownAbierto ? ' abierto' : ''}`} ref={dropdownRef}>
              <button
                type="button"
                ref={toggleRef}
                className="dropdown-toggle"
                aria-haspopup="true"
                aria-expanded={dropdownAbierto}
                aria-controls="dropdownMenu"
                onClick={() => setDropdownAbierto((abierto) => !abierto)}
              >
                Platillos
                <svg className="flecha" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              <div className="dropdown-menu" id="dropdownMenu" role="menu" aria-label="Categorías de platillos">
                <h4>Explora por categoría</h4>
                <div className="mega-grid">
                  {categorias.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/categoria/${cat.id}`}
                      className="mega-categoria"
                      role="menuitem"
                      style={{ '--cat-color': cat.color, '--cat-bg': cat.bg }}
                      onClick={cerrarMenus}
                    >
                      <div className="mega-imagen">
                        <img src={cat.imagen} alt="" width="80" height="80" loading="lazy" decoding="async" />
                      </div>
                      <div className="mega-info">
                        <h5>{cat.nombre}</h5>
                        <p>{cat.descripcion}</p>
                        <span className="cantidad">{cat.cantidad} platillos</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="dropdown-footer">
                  <a href="#categorias" role="menuitem" onClick={cerrarMenus}>Ver todo el menú →</a>
                </div>
              </div>
            </li>

            <li>
              {usuario ? (
                <NavLink to="/perfil" onClick={cerrarMenus}>Mi perfil</NavLink>
              ) : (
                <NavLink to="/login" onClick={cerrarMenus}>Iniciar sesión</NavLink>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
