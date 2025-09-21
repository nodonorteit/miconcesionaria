-- Script paso a paso para migrar datos de ventas
-- Este script maneja las restricciones de clave foránea

-- 1. Verificar el estado actual
SELECT 
    'ESTADO ACTUAL' as info,
    COUNT(*) as total_ventas,
    COUNT(CASE WHEN sellerId IN (SELECT id FROM sellers) THEN 1 END) as ventas_con_seller_antiguo,
    COUNT(CASE WHEN sellerId IN (SELECT id FROM Client) THEN 1 END) as ventas_con_customer_nuevo
FROM sales;

-- 2. Verificar restricciones de clave foránea
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

-- 4. Mostrar los clientes creados
SELECT 
    'CLIENTES CREADOS' as info,
    COUNT(*) as total_clientes_creados
FROM Client 
WHERE id LIKE 'migrated-seller-%';

-- 5. Crear tabla temporal para la migración
CREATE TEMPORARY TABLE temp_sales_migration AS
SELECT 
    s.id as sale_id,
    s.sellerId as old_seller_id,
    c.id as new_customer_id,
    sel.firstName as seller_name,
    sel.lastName as seller_lastname
FROM sales s
JOIN sellers sel ON s.sellerId = sel.id
JOIN Client c ON (
    c.firstName = sel.firstName 
    AND c.lastName = sel.lastName 
    AND c.email = sel.email
);

-- 6. Mostrar la tabla temporal
SELECT 
    'MIGRACIÓN TEMPORAL' as info,
    COUNT(*) as registros_en_tabla_temporal
FROM temp_sales_migration;

-- 7. Intentar deshabilitar temporalmente las restricciones de clave foránea
SET FOREIGN_KEY_CHECKS = 0;

-- 8. Actualizar las ventas usando la tabla temporal
UPDATE sales s
JOIN temp_sales_migration t ON s.id = t.sale_id
SET s.sellerId = t.new_customer_id;

-- 9. Rehabilitar las restricciones de clave foránea
SET FOREIGN_KEY_CHECKS = 1;

-- 10. Limpiar tabla temporal
DROP TEMPORARY TABLE temp_sales_migration;

-- 11. Verificar el estado después de la migración
SELECT 
    'ESTADO DESPUÉS DE LA MIGRACIÓN' as info,
    COUNT(*) as total_ventas,
    COUNT(CASE WHEN sellerId IN (SELECT id FROM sellers) THEN 1 END) as ventas_con_seller_antiguo,
    COUNT(CASE WHEN sellerId IN (SELECT id FROM Client) THEN 1 END) as ventas_con_customer_nuevo
FROM sales;

-- 12. Mostrar algunos ejemplos de ventas migradas
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
