-- Permite activar una cuenta de usuario al verificar su correo sin requerir
-- aprobación administrativa ni asignación previa de id_admin.
ALTER TABLE usuario
    DROP CONSTRAINT IF EXISTS chk_usuario_activo_con_admin;
