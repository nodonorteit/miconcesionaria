-- Script para verificar el estado actual de la base de datos
-- Este script nos ayudará a entender qué está pasando

-- 1. Verificar el estado actual de las ventas
SELECT 
    'ESTADO ACTUAL DE VENTAS' as info,
    COUNT(*) as total_ventas,
    COUNT(CASE WHEN sellerId IN (SELECT id FROM sellers) THEN 1 END) as ventas_con_seller_antiguo,
    COUNT(CASE WHEN sellerId IN (SELECT id FROM Client) THEN 1 END) as ventas_con_customer_nuevo,
    COUNT(CASE WHEN sellerId NOT IN (SELECT id FROM sellers) AND sellerId NOT IN (SELECT id FROM Client) THEN 1 END) as ventas_con_seller_id_invalido
FROM sales;

-- 2. Verificar restricciones de clave foránea en sales
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'miconcesionaria' 
AND TABLE_NAME = 'sales' 
AND COLUMN_NAME = 'sellerId';

-- 3. Mostrar algunos ejemplos de ventas problemáticas
SELECT 
    s.id,
    s.saleNumber,
    s.sellerId,
    CASE 
        WHEN s.sellerId IN (SELECT id FROM sellers) THEN 'SELLER ANTIGUO'
        WHEN s.sellerId IN (SELECT id FROM Client) THEN 'CUSTOMER NUEVO'
        ELSE 'ID INVÁLIDO'
    END as tipo_seller,
    sel.firstName as seller_nombre_antiguo,
    sel.lastName as seller_apellido_antiguo,
    c.firstName as customer_nombre_nuevo,
    c.lastName as customer_apellido_nuevo
FROM sales s
LEFT JOIN sellers sel ON s.sellerId = sel.id
LEFT JOIN Client c ON s.sellerId = c.id
ORDER BY s.createdAt DESC
LIMIT 10;

-- 4. Verificar si existen clientes migrados
SELECT 
    'CLIENTES MIGRADOS' as info,
    COUNT(*) as total_clientes_migrados
FROM Client 
WHERE id LIKE 'migrated-seller-%';

-- 5. Verificar la estructura de la tabla sales
DESCRIBE sales;
