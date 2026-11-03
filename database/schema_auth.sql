-- =============================================================================
-- ESQUEMA DE BASE DE DATOS: AUTENTICACIÓN Y CONTROL DE ACCESOS (RBAC)
-- Proyecto: RP-AGB
-- Motor: PostgreSQL 16
-- Base de datos: proyecto_db
-- =============================================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Limpieza si se desea recrear (opcional)
-- DROP TABLE IF EXISTS refresh_tokens CASCADE;
-- DROP TABLE IF EXISTS role_permissions CASCADE;
-- DROP TABLE IF EXISTS user_roles CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS permissions CASCADE;
-- DROP TABLE IF EXISTS roles CASCADE;

-- -----------------------------------------------------------------------------
-- 1. TABLA: roles
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE roles IS 'Roles disponibles en el sistema (ej. SUPERADMIN, ADMIN, OPERADOR).';

-- -----------------------------------------------------------------------------
-- 2. TABLA: permissions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE permissions IS 'Catálogo de permisos atómicos del sistema clasificados por módulo.';

-- -----------------------------------------------------------------------------
-- 3. TABLA: users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(25),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'Cuentas de usuario para autenticación y auditoría.';

-- -----------------------------------------------------------------------------
-- 4. TABLA INTERMEDIA: user_roles (N:M Usuarios - Roles)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

COMMENT ON TABLE user_roles IS 'Asignación de uno o más roles a un usuario.';

-- -----------------------------------------------------------------------------
-- 5. TABLA INTERMEDIA: role_permissions (N:M Roles - Permisos)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

COMMENT ON TABLE role_permissions IS 'Matriz de permisos asignados a cada rol.';

-- -----------------------------------------------------------------------------
-- 6. TABLA: refresh_tokens (Sesiones JWT y revocación)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE refresh_tokens IS 'Tokens de refresco para invalidación segura de sesiones JWT.';

-- -----------------------------------------------------------------------------
-- ÍNDICES PARA ALTO RENDIMIENTO
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);

-- -----------------------------------------------------------------------------
-- DATOS INICIALES (SEEDS / SEMILLAS)
-- -----------------------------------------------------------------------------

-- 1. Insertar Roles Principales
INSERT INTO roles (name, description, is_system_role) VALUES
    ('SUPERADMIN', 'Acceso irrestricto a todas las funcionalidades del sistema', TRUE),
    ('ADMIN', 'Administrador general del sistema y gestión operativa', TRUE),
    ('OPERADOR', 'Usuario con permisos de lectura y operaciones diarias', FALSE),
    ('CONSULTOR', 'Usuario con acceso de solo lectura / consulta', FALSE)
ON CONFLICT (name) DO NOTHING;

-- 2. Insertar Permisos Base
INSERT INTO permissions (code, name, module, description) VALUES
    -- Módulo: Usuarios
    ('USERS_CREATE', 'Crear usuarios', 'USUARIOS', 'Permite registrar nuevos usuarios en el sistema'),
    ('USERS_READ', 'Ver usuarios', 'USUARIOS', 'Permite consultar el listado y detalle de usuarios'),
    ('USERS_UPDATE', 'Modificar usuarios', 'USUARIOS', 'Permite actualizar datos de usuarios existentes'),
    ('USERS_DELETE', 'Eliminar / Inactivar usuarios', 'USUARIOS', 'Permite desactivar o eliminar cuentas de usuario'),
    
    -- Módulo: Roles y Permisos
    ('ROLES_MANAGE', 'Gestionar roles', 'ROLES', 'Permite crear roles y asignar permisos a roles'),
    ('ROLES_ASSIGN', 'Asignar roles a usuarios', 'ROLES', 'Permite asociar o quitar roles a un usuario'),
    
    -- Módulo: Auditoría y Sesiones
    ('SESSIONS_READ', 'Ver sesiones activas', 'SEGURIDAD', 'Permite consultar sesiones y tokens activos'),
    ('SESSIONS_REVOKE', 'Revocar sesiones', 'SEGURIDAD', 'Permite forzar cierre de sesión de cualquier usuario')
ON CONFLICT (code) DO NOTHING;

-- 3. Asignar todos los permisos al rol SUPERADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'SUPERADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 4. Asignar permisos básicos al rol ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('USERS_CREATE', 'USERS_READ', 'USERS_UPDATE', 'ROLES_ASSIGN', 'SESSIONS_READ')
WHERE r.name = 'ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 5. Usuario Administrador Inicial
-- Contraseña temporal: "Admin123!" cifrada con pgcrypto (Blowfish / bcrypt)
INSERT INTO users (email, password_hash, first_name, last_name, is_active)
VALUES (
    'admin@rpagb.com',
    crypt('Admin123!', gen_salt('bf', 10)),
    'Administrador',
    'Sistema',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- 6. Asignar rol SUPERADMIN al usuario inicial
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'admin@rpagb.com' AND r.name = 'SUPERADMIN'
ON CONFLICT (user_id, role_id) DO NOTHING;
