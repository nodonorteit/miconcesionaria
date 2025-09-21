-- Script para crear el cliente "Concesionaria" en la tabla de clientes
-- Esto permitirá que la concesionaria aparezca en los dropdowns de vendedor/comprador

-- Verificar si ya existe un cliente con nombre "Concesionaria"
SELECT 
    id,
    firstName,
    lastName,
    email,
    documentNumber,
    isActive
FROM Client 
WHERE firstName LIKE '%Concesionaria%' OR lastName LIKE '%Concesionaria%';

-- Crear el cliente "Concesionaria" si no existe
INSERT INTO Client (
    id,
    firstName,
    lastName,
    email,
    phone,
    documentNumber,
    city,
    state,
    address,
    isActive,
    createdAt,
    updatedAt
)
SELECT 
    'dealership-customer-id',
    'Concesionaria',
    'Principal',
    'concesionaria@empresa.com',
    '0000-0000',
    '20-12345678-9', -- CUIT de ejemplo
    'Ciudad',
    'Provincia',
    'Dirección de la concesionaria',
    1,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM Client 
    WHERE firstName = 'Concesionaria' AND lastName = 'Principal'
);

-- Mostrar el cliente creado
SELECT 
    id,
    firstName,
    lastName,
    email,
    documentNumber,
    isActive,
    'CLIENTE CONCESIONARIA' as tipo
FROM Client 
WHERE firstName = 'Concesionaria' AND lastName = 'Principal';
