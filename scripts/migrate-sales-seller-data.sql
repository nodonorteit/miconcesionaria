-- Script para migrar datos de ventas existentes al nuevo sistema unificado
-- Este script convierte los sellerId de la tabla sellers a customerId

-- 1. Verificar el estado actual
SELECT 
    'ESTADO ACTUAL DE VENTAS' as info,
    COUNT(*) as total_ventas,
    COUNT(CASE WHEN sellerId IN (SELECT id FROM sellers) THEN 1 END) as ventas_con_seller_antiguo,
    COUNT(CASE WHEN sellerId IN (SELECT id FROM Client) THEN 1 END) as ventas_con_customer_nuevo
FROM sales;

-- 2. Mostrar algunos ejemplos de ventas problemáticas
SELECT 
    s.id,
    s.saleNumber,
    s.sellerId,
    CASE 
        WHEN s.sellerId IN (SELECT id FROM sellers) THEN 'SELLER ANTIGUO'
        WHEN s.sellerId IN (SELECT id FROM Client) THEN 'CUSTOMER NUEVO'
        ELSE 'NO ENCONTRADO'
    END as tipo_seller,
    sel.firstName as seller_nombre_antiguo,
    sel.lastName as seller_apellido_antiguo
FROM sales s
LEFT JOIN sellers sel ON s.sellerId = sel.id
ORDER BY s.createdAt DESC
LIMIT 10;

-- 3. Crear clientes para los sellers que no tienen cliente correspondiente
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
    CONCAT('migrated-seller-', s.id),
    s.firstName,
    s.lastName,
    s.email,
    s.phone,
    CONCAT('MIGRATED-', s.id),
    'Ciudad',
    'Provincia',
    'Dirección migrada',
    1,
    NOW(),
    NOW()
FROM sellers s
WHERE NOT EXISTS (
    SELECT 1 FROM Client c 
    WHERE c.firstName = s.firstName 
    AND c.lastName = s.lastName 
    AND c.email = s.email
);

-- 4. Actualizar las ventas para usar los nuevos customerId
UPDATE sales s
JOIN sellers sel ON s.sellerId = sel.id
JOIN Client c ON (
    c.firstName = sel.firstName 
    AND c.lastName = sel.lastName 
    AND c.email = sel.email
)
SET s.sellerId = c.id;

-- 5. Verificar el estado después de la migración
SELECT 
    'ESTADO DESPUÉS DE LA MIGRACIÓN' as info,
    COUNT(*) as total_ventas,
    COUNT(CASE WHEN sellerId IN (SELECT id FROM sellers) THEN 1 END) as ventas_con_seller_antiguo,
    COUNT(CASE WHEN sellerId IN (SELECT id FROM Client) THEN 1 END) as ventas_con_customer_nuevo
FROM sales;

-- 6. Mostrar algunos ejemplos de ventas migradas
SELECT 
    s.id,
    s.saleNumber,
    s.sellerId,
    c.firstName as seller_nombre_nuevo,
    c.lastName as seller_apellido_nuevo,
    'MIGRADO' as estado
FROM sales s
JOIN Client c ON s.sellerId = c.id
ORDER BY s.createdAt DESC
LIMIT 5;
