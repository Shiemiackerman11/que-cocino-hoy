
import { useEffect, useRef, useState } from "react";
import DropdownMenu from "./DropdownMenu";

function Navbar({ categorias, onSelectCategory }) {
    const [dropdownAbierto, setDropdownAbierto] = useState(false);
    const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

    const dropdownRef = useRef(null);

    // Detectar clic fuera del Dropdown
    useEffect(() => {
        function manejarClickExterior(e) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setDropdownAbierto(false);
            }
        }

        function manejarEscape(e) {
            if (e.key === "Escape") {
                setDropdownAbierto(false);
                setMenuMovilAbierto(false);
            }
        }

        document.addEventListener("click", manejarClickExterior);
        document.addEventListener("keydown", manejarEscape);

        return () => {
            document.removeEventListener("click", manejarClickExterior);
            document.removeEventListener("keydown", manejarEscape);
        };
    }, []);

    function seleccionarCategoria(id) {
        setDropdownAbierto(false);
        setMenuMovilAbierto(false);
        onSelectCategory(id);
    }

    return (
        <header>
            <div className="menu-container">

                <a href="#" className="logo">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                    >
                        <path d="M3 11h18M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M12 3v4" />
                        <path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
                    </svg>

                    Que cocino hoy
                </a>

                <button
                    className="menu-toggle"
                    id="menuToggle"
                    aria-label="Abrir menú"
                    aria-expanded={menuMovilAbierto}
                    onClick={() =>
                        setMenuMovilAbierto(!menuMovilAbierto)
                    }
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M3 6h18M3 12h18M3 18h18" />
                    </svg>
                </button>

                <nav aria-label="Navegación principal">
                    <ul
                        className={`nav-menu ${
                            menuMovilAbierto ? "active" : ""
                        }`}
                        id="navMenu"
                    >
                        <li>
                            <a href="#" aria-current="page">
                                Inicio
                            </a>
                        </li>

                        <li
                            className={`dropdown ${
                                dropdownAbierto ? "abierto" : ""
                            }`}
                            ref={dropdownRef}
                            id="dropdownPlatillos"
                        >
                            <button
                                className="dropdown-toggle"
                                id="dropdownToggle"
                                aria-haspopup="true"
                                aria-expanded={dropdownAbierto}
                                aria-controls="dropdownMenu"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDropdownAbierto(!dropdownAbierto);
                                }}
                            >
                                Platillos

                                <svg
                                    className="flecha"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                >
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </button>

                            <DropdownMenu
                                categorias={categorias}
                                onSelect={seleccionarCategoria}
                            />
                        </li>

                        <li>
                            <a href="#">
                                Iniciar sesión
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Navbar;
