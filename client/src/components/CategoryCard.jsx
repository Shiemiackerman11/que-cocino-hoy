
function CategoryCard({ categoria, onSelect }) {
    return (
        <a
            href="#categorias"
            className="categoria"
            data-cat={categoria.id}
            style={{
                "--categoria-color": categoria.color,
                "--categoria-bg": categoria.bg
            }}
            onClick={(e) => {
                e.preventDefault();
                onSelect(categoria.id);
            }}
        >
            <div
                className="categoria-icono"
                aria-hidden="true"
                dangerouslySetInnerHTML={{
                    __html: categoria.icono
                }}
            />

            <h3>{categoria.nombre}</h3>

            <span className="cantidad">
                {categoria.cantidad} platillos
            </span>
        </a>
    );
}

export default CategoryCard;
