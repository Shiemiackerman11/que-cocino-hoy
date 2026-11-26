-- =====================================================
-- BASE DE DATOS: ¿QUÉ COCINO HOY?
-- PostgreSQL - Esquema (versión corregida)
-- Ejecutar primero este archivo, después el de datos.
-- =====================================================


-- =========================================
-- 1. TIPOS ENUM
-- =========================================
CREATE TYPE estado_cuenta AS ENUM (
    'PENDIENTE',
    'ACTIVO',
    'SUSPENDIDO',
    'DESACTIVADO'
);

CREATE TYPE estado_receta AS ENUM (
    'PENDIENTE',
    'PUBLICADA',
    'RECHAZADA'
);


-- =========================================
-- 2. ADMINISTRADOR
-- =========================================
CREATE TABLE administrador (
    id_admin INTEGER GENERATED ALWAYS AS IDENTITY,
    nom_pla VARCHAR(100) NOT NULL,
    prim_ap VARCHAR(100) NOT NULL,
    sec_ap VARCHAR(100),
    fecha_nac DATE NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    estado_cuenta estado_cuenta NOT NULL DEFAULT 'PENDIENTE',
    correo_verificado_en TIMESTAMPTZ,

    CONSTRAINT pk_administrador
        PRIMARY KEY (id_admin),

    CONSTRAINT chk_administrador_mayor_edad
        CHECK (fecha_nac <= (CURRENT_DATE - INTERVAL '18 years')),

    CONSTRAINT chk_administrador_activo_verificado
        CHECK (estado_cuenta <> 'ACTIVO' OR correo_verificado_en IS NOT NULL)
);


-- =========================================
-- 3. USUARIO
--    id_admin es opcional: se asigna al aprobar la cuenta.
-- =========================================
CREATE TABLE usuario (
    id_usuario INTEGER GENERATED ALWAYS AS IDENTITY,
    nom_pla VARCHAR(100) NOT NULL,
    prim_ap VARCHAR(100) NOT NULL,
    sec_ap VARCHAR(100),
    fecha_nac DATE NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    estado_cuenta estado_cuenta NOT NULL DEFAULT 'PENDIENTE',
    correo_verificado_en TIMESTAMPTZ,
    id_admin INTEGER,

    CONSTRAINT pk_usuario
        PRIMARY KEY (id_usuario),

    CONSTRAINT fk_usuario_administrador
        FOREIGN KEY (id_admin)
        REFERENCES administrador (id_admin)
        ON DELETE RESTRICT,

    CONSTRAINT chk_usuario_mayor_edad
        CHECK (fecha_nac <= (CURRENT_DATE - INTERVAL '18 years')),

    CONSTRAINT chk_usuario_activo_verificado
        CHECK (estado_cuenta <> 'ACTIVO' OR correo_verificado_en IS NOT NULL),

    CONSTRAINT chk_usuario_activo_con_admin
        CHECK (estado_cuenta <> 'ACTIVO' OR id_admin IS NOT NULL)
);


-- =========================================
-- 4. VERIFICACION_USUARIO
-- =========================================
CREATE TABLE verificacion_usuario (
    id_verificacion BIGINT GENERATED ALWAYS AS IDENTITY,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMPTZ NOT NULL,
    fecha_utilizacion TIMESTAMPTZ,
    fecha_invalidacion TIMESTAMPTZ,
    id_usuario INTEGER NOT NULL,

    CONSTRAINT pk_verificacion_usuario
        PRIMARY KEY (id_verificacion),

    CONSTRAINT fk_verificacion_usuario_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
        ON DELETE RESTRICT,

    CONSTRAINT chk_verificacion_usuario_expiracion
        CHECK (fecha_expiracion > fecha_creacion),

    CONSTRAINT chk_verificacion_usuario_estado_token
        CHECK (
            fecha_utilizacion IS NULL
            OR fecha_invalidacion IS NULL
        )
);

-- Solo un token pendiente (no usado ni invalidado) por usuario
CREATE UNIQUE INDEX uq_verificacion_usuario_pendiente
    ON verificacion_usuario (id_usuario)
    WHERE fecha_utilizacion IS NULL
      AND fecha_invalidacion IS NULL;


-- =========================================
-- 5. VERIFICACION_ADMINISTRADOR
-- =========================================
CREATE TABLE verificacion_administrador (
    id_verificacion BIGINT GENERATED ALWAYS AS IDENTITY,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMPTZ NOT NULL,
    fecha_utilizacion TIMESTAMPTZ,
    fecha_invalidacion TIMESTAMPTZ,
    id_admin INTEGER NOT NULL,

    CONSTRAINT pk_verificacion_administrador
        PRIMARY KEY (id_verificacion),

    CONSTRAINT fk_verificacion_administrador_administrador
        FOREIGN KEY (id_admin)
        REFERENCES administrador (id_admin)
        ON DELETE RESTRICT,

    CONSTRAINT chk_verificacion_administrador_expiracion
        CHECK (fecha_expiracion > fecha_creacion),

    CONSTRAINT chk_verificacion_administrador_estado_token
        CHECK (
            fecha_utilizacion IS NULL
            OR fecha_invalidacion IS NULL
        )
);

CREATE UNIQUE INDEX uq_verificacion_administrador_pendiente
    ON verificacion_administrador (id_admin)
    WHERE fecha_utilizacion IS NULL
      AND fecha_invalidacion IS NULL;


-- =========================================
-- 6. CATEGORIA
-- =========================================
CREATE TABLE categoria (
    id_categoria INTEGER GENERATED ALWAYS AS IDENTITY,
    nom_categoria VARCHAR(100) NOT NULL UNIQUE,

    CONSTRAINT pk_categoria
        PRIMARY KEY (id_categoria)
);


-- =========================================
-- 7. RECETA
--    id_admin y fecha_validacion se llenan al validar la receta.
--    estado_receta controla si aparece en el catálogo público.
-- =========================================
CREATE TABLE receta (
    id_receta INTEGER GENERATED ALWAYS AS IDENTITY,
    nom_receta VARCHAR(150) NOT NULL,
    ingredientes TEXT NOT NULL,
    pasos TEXT NOT NULL,
    foto VARCHAR(150),
    puntaje DOUBLE PRECISION,
    estado_receta estado_receta NOT NULL DEFAULT 'PENDIENTE',
    fecha_subida TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_validacion TIMESTAMPTZ,
    id_usuario INTEGER NOT NULL,
    id_admin INTEGER,

    CONSTRAINT pk_receta
        PRIMARY KEY (id_receta),

    CONSTRAINT fk_receta_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
        ON DELETE RESTRICT,

    CONSTRAINT fk_receta_administrador
        FOREIGN KEY (id_admin)
        REFERENCES administrador (id_admin)
        ON DELETE RESTRICT,

    CONSTRAINT chk_receta_puntaje
        CHECK (puntaje IS NULL OR puntaje BETWEEN 0 AND 5),

    CONSTRAINT chk_receta_validacion
        CHECK (
            estado_receta = 'PENDIENTE'
            OR (id_admin IS NOT NULL AND fecha_validacion IS NOT NULL)
        )
);


-- =========================================
-- 8. CLASIFICA (receta <-> categoria, M:M)
-- =========================================
CREATE TABLE clasifica (
    id_receta INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,

    CONSTRAINT pk_clasifica
        PRIMARY KEY (id_receta, id_categoria),

    CONSTRAINT fk_clasifica_receta
        FOREIGN KEY (id_receta)
        REFERENCES receta (id_receta)
        ON DELETE CASCADE,

    CONSTRAINT fk_clasifica_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categoria (id_categoria)
        ON DELETE CASCADE
);


-- =========================================
-- 9. PUNTUACION (un voto por usuario y receta)
--    receta.puntaje guarda el promedio y se recalcula al votar.
-- =========================================
CREATE TABLE puntuacion (
    id_usuario INTEGER NOT NULL,
    id_receta INTEGER NOT NULL,
    valor SMALLINT NOT NULL,
    fecha TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_puntuacion
        PRIMARY KEY (id_usuario, id_receta),

    CONSTRAINT fk_puntuacion_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_puntuacion_receta
        FOREIGN KEY (id_receta)
        REFERENCES receta (id_receta)
        ON DELETE CASCADE,

    CONSTRAINT chk_puntuacion_valor
        CHECK (valor BETWEEN 1 AND 5)
);


-- =========================================
-- 10. FAVORITO_API (recetas de Spoonacular guardadas por usuario)
-- =========================================
CREATE TABLE favorito_api (
    id_usuario INTEGER NOT NULL,
    spoonacular_id INTEGER NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    imagen TEXT,
    fecha_agregado TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_favorito_api
        PRIMARY KEY (id_usuario, spoonacular_id),

    CONSTRAINT fk_favorito_api_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT chk_favorito_api_spoonacular_id
        CHECK (spoonacular_id > 0)
);


-- =========================================
-- 11. ÍNDICES EN CLAVES FORÁNEAS Y CONSULTAS FRECUENTES
--     (PostgreSQL no los crea automáticamente)
-- =========================================
CREATE INDEX idx_usuario_admin              ON usuario (id_admin);
CREATE INDEX idx_receta_usuario             ON receta (id_usuario);
CREATE INDEX idx_receta_admin               ON receta (id_admin);
CREATE INDEX idx_receta_estado              ON receta (estado_receta);
CREATE INDEX idx_clasifica_categoria        ON clasifica (id_categoria);
CREATE INDEX idx_puntuacion_receta          ON puntuacion (id_receta);
CREATE INDEX idx_favorito_api_spoonacular   ON favorito_api (spoonacular_id);

-- =====================================================
-- FIN DEL ESQUEMA
-- =====================================================