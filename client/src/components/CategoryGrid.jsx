
import CategoryCard from "./CategoryCard";

function CategoryGrid({ categorias, onSelect }) {
    return (
        <div className="grid-categorias">
            {categorias.map((categoria) => (
                <CategoryCard
                    key={categoria.id}
                    categoria={categoria}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}

export default CategoryGrid;
