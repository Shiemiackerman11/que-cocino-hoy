
import { useState } from "react";

function SearchBar({ onSearch }) {
    const [consulta, setConsulta] = useState("");

    const sugerencias = [
        "tacos",
        "pizza",
        "postres",
        "bebidas"
    ];

    function buscar(e) {
        e.preventDefault();
        onSearch(consulta);
    }

    function limpiar() {
        setConsulta("");
        onSearch("");
    }

    function seleccionarSugerencia(texto) {
        setConsulta(texto);
        onSearch(texto);
    }

    return (
        <form
            className="buscador-platillos"
            role="search"
            onSubmit={buscar}
        >
            <div className="buscador-caja">

                <svg
                    className="icono-buscar"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>

                <label
                    htmlFor="buscarPlatillo"
                    className="sr-only"
                >
                    Buscar platillos
                </label>

                <input
                    type="search"
                    id="buscarPlatillo"
                    placeholder="Busca tacos, pizza, postres..."
                    autoComplete="off"
                    value={consulta}
                    onChange={(e) => {
                        setConsulta(e.target.value);
                        onSearch(e.target.value);
                    }}
                />

                {consulta.length > 0 && (
                    <button
                        type="button"
                        className="btn-limpiar visible"
                        aria-label="Limpiar búsqueda"
                        onClick={limpiar}
                    >
                        ×
                    </button>
                )}

                <button
                    type="submit"
                    className="btn-buscar"
                >
                    Buscar
                </button>
            </div>

            <div className="sugerencias-rapidas">
                <span>Prueba:</span>

                {sugerencias.map((texto) => (
                    <button
                        key={texto}
                        type="button"
                        className="chip-sugerencia"
                        data-sugerencia={texto}
                        onClick={() =>
                            seleccionarSugerencia(texto)
                        }
                    >
                        {texto}
                    </button>
                ))}
            </div>
        </form>
    );
}

export default SearchBar;
