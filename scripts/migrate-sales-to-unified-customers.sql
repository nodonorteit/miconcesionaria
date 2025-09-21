-- Script para migrar las ventas existentes al nuevo sistema unificado
-- Este script debe ejecutarse después de aplicar la migración de Prisma

-- 1. Crear el cliente "Concesionaria" si no existe
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
    '20-12345678-9',
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

-- 2. Mostrar el estado actual de las ventas
SELECT 
    'ESTADO ACTUAL DE VENTAS' as info,
    COUNT(*) as total_ventas,
    COUNT(DISTINCT customerId) as clientes_unicos,
    COUNT(DISTINCT sellerId) as vendedores_unicos
FROM sales;

-- 3. Mostrar algunos ejemplos de ventas actuales
SELECT 
    s.id,
    s.saleNumber,
    c.firstName as cliente_nombre,
    c.lastName as cliente_apellido,
    sel.firstName as vendedor_nombre,
    sel.lastName as vendedor_apellido,
    s.totalAmount,
    s.createdAt
FROM sales s
JOIN Client c ON s.customerId = c.id
JOIN sellers sel ON s.sellerId = sel.id
ORDER BY s.createdAt DESC
LIMIT 5;

-- 4. Verificar que todos los sellers tengan un cliente correspondiente
-- (Esto es solo informativo, no modifica datos)
SELECT 
    'SELLERS SIN CLIENTE CORRESPONDIENTE' as info,
    s.id as seller_id,
    s.firstName as seller_nombre,
    s.lastName as seller_apellido,
    s.email as seller_email
FROM sellers s
LEFT JOIN Client c ON (
    c.firstName = s.firstName AND 
    c.lastName = s.lastName AND 
    c.email = s.email
)
WHERE c.id IS NULL;
