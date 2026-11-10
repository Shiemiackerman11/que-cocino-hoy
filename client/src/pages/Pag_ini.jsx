
import { useMemo, useState } from "react";

import Navbar from "../components/Navbar";
import SearchBar from "../components/Searchbar";
import CategoryGrid from "../components/CategoryGrid";
import EmptyState from "../components/EmptyState";

import { MENU_DATA } from "../data/menuData";
import { normalizar } from "../utils/normalizarTexto";

function HomePage() {
    // Estado de la búsqueda
    const [consulta, setConsulta] = useState("");

    // Categoría seleccionada
    const [categoriaSeleccionada, setCategoriaSeleccionada] =
        useState(null);

    // Permite reiniciar el estado interno del buscador
    const [searchKey, setSearchKey] = useState(0);

    // Filtrar categorías
    const categoriasFiltradas = useMemo(() => {
        const q = normalizar(consulta);

        return MENU_DATA.filter((categoria) => {
            // Si se seleccionó una categoría específica
            if (
                categoriaSeleccionada &&
                categoria.id !== categoriaSeleccionada
            ) {
                return false;
            }

            // Si no hay consulta, mostrar las categorías
            if (q === "") {
                return true;
            }

            const nombre = normalizar(categoria.nombre);
            const palabras = normalizar(categoria.palabrasClave);
            const descripcion = normalizar(categoria.descripcion);

            return (
                nombre.includes(q) ||
                palabras.includes(q) ||
                descripcion.includes(q)
            );
        });
    }, [consulta, categoriaSeleccionada]);

    // Función para buscar
    function manejarBusqueda(texto) {
        setConsulta(texto);
        setCategoriaSeleccionada(null);
    }

    // Función para seleccionar una categoría
    function manejarSeleccionCategoria(id) {
        setCategoriaSeleccionada(id);
        setConsulta("");
        setSearchKey((actual) => actual + 1);

        document.getElementById("categorias")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    // Limpiar selección de categoría
    function limpiarFiltroCategoria() {
        setCategoriaSeleccionada(null);
        setConsulta("");
        setSearchKey((actual) => actual + 1);
    }

    // Obtener el nombre de la categoría seleccionada
    const nombreCategoria = MENU_DATA.find(
        (categoria) => categoria.id === categoriaSeleccionada
    )?.nombre;

    return (
        <>
            {/* Navegación */}
            <Navbar
                categorias={MENU_DATA}
                onSelectCategory={manejarSeleccionCategoria}
            />

            {/* Sección principal */}
            <section className="hero">

                <h1>Bienvenido a Que cocino hoy</h1>

                <p>
                    Busca tu platillo favorito o explora por categorías.
                </p>

                <SearchBar
                    key={searchKey}
                    onSearch={manejarBusqueda}
                />

            </section>

            {/* Sección de categorías */}
            <section
                className="categorias-seccion"
                id="categorias"
            >
                <div className="categorias-header">

                    <span className="etiqueta">
                        — Explora nuestro menú
                    </span>

                    <h2>¿Qué se te antoja hoy?</h2>

                    <p>
                        Navega por nuestras categorías y encuentra
                        tu próximo platillo favorito.
                    </p>

                </div>

                {/* Contador de resultados */}
                <p
                    className="contador-resultados"
                    aria-live="polite"
                >
                    {categoriaSeleccionada ? (
                        <>
                            Mostrando categoría:{" "}
                            <strong>{nombreCategoria}</strong>

                            {" · "}

                            <button
                                type="button"
                                onClick={limpiarFiltroCategoria}
                            >
                                Ver todas
                            </button>
                        </>
                    ) : consulta.trim() !== "" ? (
                        categoriasFiltradas.length === 0 ? (
                            <>
                                Sin resultados para{" "}
                                <strong>"{consulta}"</strong>
                            </>
                        ) : (
                            <>
                                Mostrando{" "}
                                <strong>
                                    {categoriasFiltradas.length}
                                </strong>
                                {" de "}
                                {MENU_DATA.length} categorías para{" "}
                                <strong>"{consulta}"</strong>
                            </>
                        )
                    ) : null}
                </p>

                {/* Tarjetas de categorías */}
                <CategoryGrid
                    categorias={categoriasFiltradas}
                    onSelect={manejarSeleccionCategoria}
                />

                {/* Estado vacío */}
                {categoriasFiltradas.length === 0 && (
                    <EmptyState />
                )}

            </section>
        </>
    );
}

export default HomePage;
