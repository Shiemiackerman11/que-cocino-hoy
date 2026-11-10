
function DropdownMenu({ categorias, onSelect }) {
    return (
        <div
            className="dropdown-menu"
            id="dropdownMenu"
            role="menu"
            aria-label="Categorías de platillos"
        >
            <h4>Explora por categoría</h4>

            <div className="mega-grid">
                {categorias.map((cat) => (
                    <a
                        key={cat.id}
                        href="#categorias"
                        className="mega-categoria"
                        data-cat={cat.id}
                        role="menuitem"
                        style={{
                            "--cat-color": cat.color,
                            "--cat-bg": cat.bg
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            onSelect(cat.id);
                        }}
                    >
                        <div className="mega-imagen">
                            <img
                                src={cat.imagen}
                                alt={cat.nombre}
                                width="80"
                                height="80"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>

                        <div className="mega-info">
                            <h5>{cat.nombre}</h5>
                            <p>{cat.descripcion}</p>

                            <span className="cantidad">
                                {cat.cantidad} platillos
                            </span>
                        </div>
                    </a>
                ))}
            </div>

            <div className="dropdown-footer">
                <a href="#categorias">
                    Ver todo el menú →
                </a>
            </div>
        </div>
    );
}

export default DropdownMenu;
