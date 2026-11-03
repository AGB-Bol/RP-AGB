
-- ============================================================
-- RP-AGB - Datos iniciales de prueba (Desarrollo)
-- Cuentas locales de autenticacion y asignacion de roles.
--
-- Contraseña común: RPAGB_Dev2026!
-- Hash: BCrypt (pgcrypto)
--
-- Idempotente: puede ejecutarse varias veces.
-- Solo para desarrollo local. NO ejecutar en produccion.
-- No modifica cuentas, contraseñas ni permisos existentes.
-- ============================================================

BEGIN;

-- 1. Crear las tres cuentas locales de prueba.
-- ON CONFLICT evita sobrescribir usuarios existentes.

INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    is_active
)
VALUES
(
    'admin.pruebas@rpagb.local',
    '$2a$10$6mSBBIY5sDkaeaeaJpq78ub3FQn3ct9C7XSsOjRNbcdmhpUriOZXq',
    'Administrador',
    'Pruebas AGB',
    TRUE
),
(
    'operador@rpagb.local',
    '$2a$10$6mSBBIY5sDkaeaeaJpq78ub3FQn3ct9C7XSsOjRNbcdmhpUriOZXq',
    'Operador',
    'Pruebas AGB',
    TRUE
),
(
    'consultor@rpagb.local',
    '$2a$10$6mSBBIY5sDkaeaeaJpq78ub3FQn3ct9C7XSsOjRNbcdmhpUriOZXq',
    'Consultor',
    'Pruebas AGB',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- 2. Asignar el rol correspondiente a cada cuenta.
-- No se modifican roles ni permisos existentes.

WITH desired_user_roles (email, role_name) AS (
    VALUES
        ('admin.pruebas@rpagb.local', 'ADMIN'),
        ('operador@rpagb.local', 'OPERADOR'),
        ('consultor@rpagb.local', 'CONSULTOR')
)
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM desired_user_roles AS dur
JOIN users AS u
    ON u.email = dur.email
JOIN roles AS r
    ON r.name = dur.role_name
ON CONFLICT (user_id, role_id) DO NOTHING;

COMMIT;

-- 3. Verificar las cuentas y sus roles.

SELECT
    u.email,
    r.name AS role,
    u.is_active,
    u.created_at
FROM users AS u
JOIN user_roles AS ur ON ur.user_id = u.id
JOIN roles AS r ON r.id = ur.role_id
WHERE u.email IN (
    'admin@rpagb.com',
    'admin.pruebas@rpagb.local',
    'operador@rpagb.local',
    'consultor@rpagb.local'
)
ORDER BY r.name, u.email;

-- 4. Verificar la matriz actual de permisos por rol.

SELECT
    r.name AS role,
    COUNT(rp.permission_id) AS permission_count
FROM roles AS r
LEFT JOIN role_permissions AS rp ON rp.role_id = r.id
GROUP BY r.name
ORDER BY r.name;

