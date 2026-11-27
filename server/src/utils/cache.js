// Caché en memoria con vencimiento y "de-duplicación" de peticiones en curso:
// si dos usuarios piden lo mismo a la vez, solo se consulta una vez a Spoonacular.
// Cada consulta gasta puntos de la cuota diaria, por eso conviene reutilizar resultados.
export function crearCache({ ttlMs, max = 500 }) {
    const datos = new Map();     // clave -> { valor, expira }
    const enCurso = new Map();   // clave -> Promise

    const leer = (clave) => {
        const entrada = datos.get(clave);
        if (!entrada) return undefined;
        if (entrada.expira <= Date.now()) {
            datos.delete(clave);
            return undefined;
        }
        return entrada.valor;
    };

    const poner = (clave, valor) => {
        datos.delete(clave);
        datos.set(clave, { valor, expira: Date.now() + ttlMs });
        // Map conserva el orden de inserción: se descarta lo más antiguo.
        while (datos.size > max) datos.delete(datos.keys().next().value);
    };

    // Solo se guardan resultados correctos: si `cargar` falla, el error se propaga y no se cachea.
    const obtener = (clave, cargar) => {
        const guardado = leer(clave);
        if (guardado !== undefined) return Promise.resolve(guardado);
        if (enCurso.has(clave)) return enCurso.get(clave);

        const promesa = (async () => {
            try {
                const valor = await cargar();
                poner(clave, valor);
                return valor;
            } finally {
                enCurso.delete(clave);
            }
        })();
        enCurso.set(clave, promesa);
        return promesa;
    };

    return { obtener, leer, poner };
}
