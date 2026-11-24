// client/src/components/CategoryCard.jsx
import { Link } from 'react-router-dom';
import CategoryIcon from './CategoryIcon';
import '../styles/CategoryCard.css';

export default function CategoryCard({ categoria }) {
  const { id, nombre, cantidad, color, bg } = categoria;

  return (
    <Link
      to={`/categoria/${id}`}
      className="categoria"
      style={{ '--categoria-color': color, '--categoria-bg': bg }}
    >
      <div className="categoria-icono">
        <CategoryIcon id={id} />
      </div>
      <h3>{nombre}</h3>
      <span className="cantidad">{cantidad} platillos</span>
    </Link>
  );
}
