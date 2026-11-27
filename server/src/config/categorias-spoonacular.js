// Categorías del sitio y su equivalencia en Spoonacular.
//
//   spoonacular: filtros que se envían a /recipes/complexSearch para listar la categoría
//                (type = tipo de platillo, diet = dieta). Spoonacular acepta un solo "type".
//   dishTypes:   valores de "dishTypes" de Spoonacular que clasifican una receta dentro de
//                esta categoría cuando aparece en una búsqueda general.
//
// El orden importa: es la prioridad con la que se clasifica una receta que tiene varios tipos.
// Lo que no encaje en ninguna se muestra como "especiales" (o "vegetarianos" si lo es).
export const CATEGORIAS = [
    {
        id: 'postres',
        nombre: 'Postres',
        descripcion: 'Pasteles, helados, flanes y dulces tentaciones.',
        color: '#d97706',
        bg: '#fef3c7',
        imagen: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&q=70&fm=webp',
        palabrasClave: 'pastel helado flan brownie tarta chocolate',
        spoonacular: { type: 'dessert' },
        dishTypes: ['dessert'],
    },
    {
        id: 'bebidas',
        nombre: 'Bebidas',
        descripcion: 'Aguas frescas, jugos, cafés y cocteles.',
        color: '#0891b2',
        bg: '#cffafe',
        imagen: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200&q=70&fm=webp',
        palabrasClave: 'agua jugo café té refresco limonada',
        spoonacular: { type: 'beverage' },
        dishTypes: ['beverage', 'drink'],
    },
    {
        id: 'platos-fuertes',
        nombre: 'Platos Fuertes',
        descripcion: 'Tacos, pastas, carnes y platillos principales.',
        color: '#dc2626',
        bg: '#fee2e2',
        imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=70&fm=webp',
        palabrasClave: 'tacos pizza pasta pollo carne hamburguesa',
        spoonacular: { type: 'main course' },
        dishTypes: ['main course', 'main dish', 'dinner', 'lunch'],
    },
    {
        id: 'entradas',
        nombre: 'Entradas',
        descripcion: 'Guacamole, sopas, ensaladas y botanas para empezar.',
        color: '#16a34a',
        bg: '#dcfce7',
        imagen: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=200&q=70&fm=webp',
        palabrasClave: 'guacamole sopa ensalada ceviche nachos',
        spoonacular: { type: 'appetizer' },
        dishTypes: ['appetizer', 'antipasti', 'antipasto', 'starter', "hor d'oeuvre", 'soup', 'salad'],
    },
    {
        id: 'vegetarianos',
        nombre: 'Vegetarianos',
        descripcion: 'Platillos a base de plantas, verduras y granos.',
        color: '#65a30d',
        bg: '#ecfccb',
        imagen: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=70&fm=webp',
        palabrasClave: 'ensalada verduras tofu quinoa garbanzo vegetariano',
        spoonacular: { diet: 'vegetarian' },
        dishTypes: [],
    },
    {
        id: 'especiales',
        nombre: 'Especiales',
        descripcion: 'Botanas, antojitos y bocadillos para compartir.',
        color: '#9333ea',
        bg: '#f3e8ff',
        imagen: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=200&q=70&fm=webp',
        palabrasClave: 'botana antojito snack bocadillo',
        spoonacular: { type: 'snack' },
        dishTypes: ['snack', 'fingerfood'],
    },
];

// El orden visual en el sitio es distinto al de prioridad de clasificación.
export const ORDEN_VISUAL = ['entradas', 'platos-fuertes', 'postres', 'bebidas', 'vegetarianos', 'especiales'];

const porId = new Map(CATEGORIAS.map((c) => [c.id, c]));

export const categoriasOrdenadas = () => ORDEN_VISUAL.map((id) => porId.get(id));
export const buscarCategoria = (id) => porId.get(id) ?? null;

// Datos que se envían al navegador (sin la configuración interna de Spoonacular).
export const categoriaPublica = ({ id, nombre, descripcion, color, bg, imagen, palabrasClave }) => ({
    id, nombre, descripcion, color, bg, imagen, palabrasClave,
});

export function clasificarReceta(dishTypes = [], esVegetariana = false) {
    const tipos = new Set((dishTypes ?? []).map((t) => String(t).toLowerCase()));
    const encontrada = CATEGORIAS.find((c) => c.dishTypes.some((t) => tipos.has(t)));
    if (encontrada) return encontrada;
    return porId.get(esVegetariana ? 'vegetarianos' : 'especiales');
}
