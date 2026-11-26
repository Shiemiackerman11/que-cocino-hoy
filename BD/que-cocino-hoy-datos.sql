-- =====================================================
-- BASE DE DATOS: ¿QUÉ COCINO HOY?
-- Datos de prueba y consultas de ejemplo
-- Ejecutar DESPUÉS de que-cocino-hoy-tablas.sql
-- =====================================================
-- IMPORTANTE: los password_hash de este archivo son
-- marcadores de prueba. Las contraseñas reales deben
-- hashearse en el backend (Argon2id o bcrypt).


-- =========================================
-- 1. CATEGORÍAS
-- =========================================
INSERT INTO categoria (nom_categoria) VALUES
    ('Entradas'),
    ('Platos Fuertes'),
    ('Postres'),
    ('Bebidas'),
    ('Vegetarianos'),
    ('Especiales');


-- =========================================
-- 2. ADMINISTRADOR
-- =========================================
INSERT INTO administrador
    (nom_pla, prim_ap, sec_ap, fecha_nac, correo, password_hash, estado_cuenta, correo_verificado_en)
VALUES
    ('Ana', 'García', 'López', '1985-03-10', 'admin@cocinohoy.test',
     'HASH_DE_PRUEBA_NO_USAR', 'ACTIVO', CURRENT_TIMESTAMP);


-- =========================================
-- 3. USUARIOS
--    Luis: cuenta activa, aprobada por la administradora.
--    Sofía: registro nuevo, aún pendiente de verificación y aprobación.
-- =========================================
INSERT INTO usuario
    (nom_pla, prim_ap, sec_ap, fecha_nac, correo, password_hash,
     estado_cuenta, correo_verificado_en, id_admin)
VALUES
    ('Luis', 'Martínez', NULL, '1995-07-22', 'luis@cocinohoy.test',
     'HASH_DE_PRUEBA_NO_USAR', 'ACTIVO', CURRENT_TIMESTAMP,
     (SELECT id_admin FROM administrador WHERE correo = 'admin@cocinohoy.test')),
    ('Sofía', 'Ramírez', 'Cruz', '1999-11-05', 'sofia@cocinohoy.test',
     'HASH_DE_PRUEBA_NO_USAR', 'PENDIENTE', NULL, NULL);


-- =========================================
-- 4. RECETAS
--    Tres publicadas (de Luis) y una pendiente (de Sofía).
-- =========================================
INSERT INTO receta
    (nom_receta, ingredientes, pasos, foto, estado_receta,
     fecha_validacion, id_usuario, id_admin)
VALUES
    ('Quesadillas de flor de calabaza',
     'Tortillas de maíz; 1 taza de flor de calabaza; 150 g de queso Oaxaca; 1 jitomate; 1/4 de cebolla',
     '1. Limpiar y picar la flor. 2. Sofreír la cebolla y el jitomate. 3. Agregar la flor y sazonar. 4. Rellenar las tortillas con queso y flor. 5. Dorar en comal.',
     'quesadillas_calabaza.jpg', 'PUBLICADA', CURRENT_TIMESTAMP,
     (SELECT id_usuario FROM usuario WHERE correo = 'luis@cocinohoy.test'),
     (SELECT id_admin FROM administrador WHERE correo = 'admin@cocinohoy.test')),

    ('Pozole rojo',
     '1 kg de maíz cacahuazintle; 1 kg de cerdo; 4 chiles guajillo; 2 chiles ancho; 1 cebolla; 4 dientes de ajo; Orégano; Lechuga; Rábano; Limón',
     '1. Cocer el maíz hasta que reviente. 2. Cocer la carne con cebolla y ajo. 3. Licuar los chiles remojados y colar. 4. Unir todo y dejar hervir 30 minutos. 5. Servir con lechuga, rábano, orégano y limón.',
     'pozole_rojo.jpg', 'PUBLICADA', CURRENT_TIMESTAMP,
     (SELECT id_usuario FROM usuario WHERE correo = 'luis@cocinohoy.test'),
     (SELECT id_admin FROM administrador WHERE correo = 'admin@cocinohoy.test')),

    ('Flan napolitano',
     '1 lata de leche condensada; 1 lata de leche evaporada; 4 huevos; 1 cucharadita de vainilla; 1 taza de azúcar',
     '1. Hacer caramelo con el azúcar en el molde. 2. Licuar leches, huevos y vainilla. 3. Verter sobre el caramelo. 4. Cocer a baño María 1 hora. 5. Enfriar y desmoldar.',
     'flan_napolitano.jpg', 'PUBLICADA', CURRENT_TIMESTAMP,
     (SELECT id_usuario FROM usuario WHERE correo = 'luis@cocinohoy.test'),
     (SELECT id_admin FROM administrador WHERE correo = 'admin@cocinohoy.test')),

    ('Ensalada de nopales',
     '2 nopales cocidos y picados; 1 jitomate; 1/2 cebolla; 1 chile serrano; Cilantro; Queso fresco; Limón',
     '1. Mezclar nopales, jitomate, cebolla y chile. 2. Agregar cilantro y limón. 3. Espolvorear queso fresco al servir.',
     NULL, 'PENDIENTE', NULL,
     (SELECT id_usuario FROM usuario WHERE correo = 'sofia@cocinohoy.test'),
     NULL);


-- =========================================
-- 5. CLASIFICACIÓN (M:M)
-- =========================================
INSERT INTO clasifica (id_receta, id_categoria) VALUES
    ((SELECT id_receta FROM receta WHERE nom_receta = 'Quesadillas de flor de calabaza'),
     (SELECT id_categoria FROM categoria WHERE nom_categoria = 'Entradas')),
    ((SELECT id_receta FROM receta WHERE nom_receta = 'Quesadillas de flor de calabaza'),
     (SELECT id_categoria FROM categoria WHERE nom_categoria = 'Vegetarianos')),
    ((SELECT id_receta FROM receta WHERE nom_receta = 'Pozole rojo'),
     (SELECT id_categoria FROM categoria WHERE nom_categoria = 'Platos Fuertes')),
    ((SELECT id_receta FROM receta WHERE nom_receta = 'Flan napolitano'),
     (SELECT id_categoria FROM categoria WHERE nom_categoria = 'Postres')),
    ((SELECT id_receta FROM receta WHERE nom_receta = 'Ensalada de nopales'),
     (SELECT id_categoria FROM categoria WHERE nom_categoria = 'Vegetarianos'));


-- =========================================
-- 6. PUNTUACIONES DE EJEMPLO
--    Sofía califica recetas de Luis (nunca las propias).
-- =========================================
INSERT INTO puntuacion (id_usuario, id_receta, valor) VALUES
    ((SELECT id_usuario FROM usuario WHERE correo = 'sofia@cocinohoy.test'),
     (SELECT id_receta FROM receta WHERE nom_receta = 'Pozole rojo'), 5),
    ((SELECT id_usuario FROM usuario WHERE correo = 'sofia@cocinohoy.test'),
     (SELECT id_receta FROM receta WHERE nom_receta = 'Flan napolitano'), 4);

-- Recalcula el promedio de las recetas con votos
UPDATE receta r
SET puntaje = sub.promedio
FROM (
    SELECT id_receta, AVG(valor)::DOUBLE PRECISION AS promedio
    FROM puntuacion
    GROUP BY id_receta
) AS sub
WHERE r.id_receta = sub.id_receta;


-- =========================================
-- 7. FAVORITOS DE LA API (Spoonacular)
--    Sofía guardó una receta externa como favorita.
-- =========================================
INSERT INTO favorito_api (id_usuario, spoonacular_id, titulo, imagen) VALUES
    ((SELECT id_usuario FROM usuario WHERE correo = 'sofia@cocinohoy.test'),
     716429, 'Pasta con ajo y aceite (dato de prueba)', NULL);


-- =====================================================
-- CONSULTAS DE EJEMPLO
-- =====================================================

-- A) Recetas publicadas por categoría, ordenadas por puntaje
SELECT r.nom_receta, c.nom_categoria, r.puntaje
FROM receta r
JOIN clasifica cl ON cl.id_receta = r.id_receta
JOIN categoria c  ON c.id_categoria = cl.id_categoria
WHERE r.estado_receta = 'PUBLICADA'
  AND c.nom_categoria = 'Postres'
ORDER BY r.puntaje DESC NULLS LAST;

-- B) Buscar recetas publicadas por ingrediente (ej. "jitomate")
SELECT nom_receta, ingredientes
FROM receta
WHERE estado_receta = 'PUBLICADA'
  AND ingredientes ILIKE '%jitomate%';

-- C) Cola de recetas pendientes de validación para el administrador
SELECT r.id_receta, r.nom_receta, u.nom_pla AS autor, r.fecha_subida
FROM receta r
JOIN usuario u ON u.id_usuario = r.id_usuario
WHERE r.estado_receta = 'PENDIENTE'
ORDER BY r.fecha_subida;

-- D) Cuentas de usuario pendientes de aprobación
SELECT id_usuario, nom_pla, prim_ap, correo, correo_verificado_en
FROM usuario
WHERE estado_cuenta = 'PENDIENTE';

-- E) Favoritos de un usuario
SELECT f.spoonacular_id, f.titulo, f.fecha_agregado
FROM favorito_api f
JOIN usuario u ON u.id_usuario = f.id_usuario
WHERE u.correo = 'sofia@cocinohoy.test'
ORDER BY f.fecha_agregado DESC;

-- F) Validar (publicar) una receta: asignar admin y cambiar estado
--    Ejecutar dentro de una transacción.
-- BEGIN;
-- UPDATE receta
-- SET estado_receta = 'PUBLICADA',
--     id_admin = (SELECT id_admin FROM administrador WHERE correo = 'admin@cocinohoy.test'),
--     fecha_validacion = CURRENT_TIMESTAMP
-- WHERE nom_receta = 'Ensalada de nopales';
-- COMMIT;

-- G) Reenviar verificación: invalidar el token pendiente anterior
--    e insertar el nuevo, en una misma transacción.
-- BEGIN;
-- UPDATE verificacion_usuario
-- SET fecha_invalidacion = CURRENT_TIMESTAMP
-- WHERE id_usuario = (SELECT id_usuario FROM usuario WHERE correo = 'sofia@cocinohoy.test')
--   AND fecha_utilizacion IS NULL
--   AND fecha_invalidacion IS NULL;
-- INSERT INTO verificacion_usuario (token_hash, fecha_expiracion, id_usuario)
-- VALUES ('HASH_DEL_NUEVO_TOKEN', CURRENT_TIMESTAMP + INTERVAL '24 hours',
--         (SELECT id_usuario FROM usuario WHERE correo = 'sofia@cocinohoy.test'));
-- COMMIT;

-- H) Confirmar verificación de correo y activar cuenta
--    (misma transacción, según las notas de implementación)
-- BEGIN;
-- UPDATE verificacion_usuario
-- SET fecha_utilizacion = CURRENT_TIMESTAMP
-- WHERE token_hash = 'HASH_DEL_TOKEN_RECIBIDO'
--   AND fecha_expiracion > CURRENT_TIMESTAMP
--   AND fecha_utilizacion IS NULL
--   AND fecha_invalidacion IS NULL;
-- UPDATE usuario
-- SET correo_verificado_en = CURRENT_TIMESTAMP,
--     estado_cuenta = 'ACTIVO'
-- WHERE id_usuario = (SELECT id_usuario FROM verificacion_usuario
--                     WHERE token_hash = 'HASH_DEL_TOKEN_RECIBIDO');
-- COMMIT;

-- =====================================================
-- FIN DE LOS DATOS
-- =====================================================
