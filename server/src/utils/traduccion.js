// Spoonacular solo entiende inglés. Este diccionario traduce los términos más comunes que
// alguien escribiría en español en el buscador; lo que no esté aquí se envía tal cual
// (nombres como "pizza", "tacos" o "brownie" funcionan igual en ambos idiomas).
const DICCIONARIO = {
    // proteínas
    pollo: 'chicken', pavo: 'turkey', res: 'beef', carne: 'beef', cerdo: 'pork', puerco: 'pork',
    cordero: 'lamb', jamon: 'ham', tocino: 'bacon', salchicha: 'sausage', pescado: 'fish',
    atun: 'tuna', camaron: 'shrimp', mariscos: 'seafood', huevo: 'egg', tofu: 'tofu',
    // lácteos
    queso: 'cheese', leche: 'milk', crema: 'cream', mantequilla: 'butter',
    // granos y masas
    arroz: 'rice', frijol: 'beans', lenteja: 'lentils', garbanzo: 'chickpeas', pasta: 'pasta',
    espagueti: 'spaghetti', fideo: 'noodles', pan: 'bread', harina: 'flour', maiz: 'corn',
    avena: 'oats', pastel: 'cake', galleta: 'cookie', helado: 'ice cream', pay: 'pie',
    // verduras
    papa: 'potato', patata: 'potato', camote: 'sweet potato', zanahoria: 'carrot',
    cebolla: 'onion', ajo: 'garlic', jitomate: 'tomato', tomate: 'tomato', chile: 'chili',
    pimiento: 'bell pepper', calabacita: 'zucchini', calabaza: 'pumpkin', espinaca: 'spinach',
    lechuga: 'lettuce', pepino: 'cucumber', champinon: 'mushroom', hongo: 'mushroom',
    brocoli: 'broccoli', coliflor: 'cauliflower', apio: 'celery', elote: 'corn', aguacate: 'avocado',
    // frutas
    limon: 'lemon', naranja: 'orange', manzana: 'apple', platano: 'banana', fresa: 'strawberry',
    piña: 'pineapple', pina: 'pineapple', uva: 'grape', coco: 'coconut', sandia: 'watermelon',
    durazno: 'peach',
    // despensa y especias
    azucar: 'sugar', sal: 'salt', pimienta: 'pepper', aceite: 'oil', vinagre: 'vinegar',
    miel: 'honey', canela: 'cinnamon', vainilla: 'vanilla', cilantro: 'cilantro',
    perejil: 'parsley', albahaca: 'basil', oregano: 'oregano', nuez: 'walnut',
    almendra: 'almond', cacahuate: 'peanut',
    // tipos de platillo
    sopa: 'soup', ensalada: 'salad', postre: 'dessert', bebida: 'beverage', caldo: 'broth',
    guiso: 'stew', desayuno: 'breakfast', cena: 'dinner', botana: 'snack', entrada: 'appetizer',
    hamburguesa: 'burger', vegetariano: 'vegetarian', vegano: 'vegan',
    // conectores
    con: 'with', sin: 'without', y: 'and', de: '', del: '', la: '', el: '', al: '', en: '',
};

const sinAcentos = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function traducirPalabra(palabra) {
    const base = sinAcentos(palabra.toLowerCase());
    for (const candidata of [base, base.replace(/es$/, ''), base.replace(/s$/, '')]) {
        if (Object.hasOwn(DICCIONARIO, candidata)) return DICCIONARIO[candidata];
    }
    return palabra.toLowerCase();
}

export function traducirTermino(texto) {
    return String(texto)
        .trim()
        .split(/\s+/)
        .map(traducirPalabra)
        .filter(Boolean)
        .join(' ');
}
