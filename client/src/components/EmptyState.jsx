
function EmptyState() {
    return (
        <div className="estado-vacio visible">
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
                <path d="M8 11h6" />
            </svg>

            <h3>No encontramos resultados</h3>

            <p>
                Intenta con otra palabra o explora
                nuestras categorías populares.
            </p>
        </div>
    );
}

export default EmptyState;
