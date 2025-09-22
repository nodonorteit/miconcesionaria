-- Script para corregir la restricción de clave foránea
-- Este script elimina la restricción antigua y crea la nueva

-- 1. Verificar el estado actual
SELECT 
    'ESTADO ANTES DE LA CORRECCIÓN' as info,
    COUNT(*) as total_ventas,
    COUNT(CASE WHEN sellerId IN (SELECT id FROM sellers) THEN 1 END) as ventas_con_seller_antiguo,
    COUNT(CASE WHEN sellerId IN (SELECT id FROM Client) THEN 1 END) as ventas_con_customer_nuevo
FROM sales;

-- 2. Eliminar la restricción de clave foránea antigua
ALTER TABLE sales DROP FOREIGN KEY sales_sellerId_fkey;

-- 3. Verificar que se eliminó la restricción
SELECT 
    'RESTRICCIONES DESPUÉS DE ELIMINAR' as info,
    COUNT(*) as restricciones_restantes
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'miconcesionaria' 
AND TABLE_NAME = 'sales' 
AND COLUMN_NAME = 'sellerId';

-- 4. Actualizar las ventas para usar los nuevos customerId
UPDATE sales s
JOIN sellers sel ON s.sellerId = sel.id
JOIN Client c ON (
    c.firstName = sel.firstName 
    AND c.lastName = sel.lastName 
    AND c.email = sel.email
)
SET s.sellerId = c.id;

-- 5. Verificar la migración
SELECT 
    'ESTADO DESPUÉS DE LA MIGRACIÓN' as info,
    COUNT(*) as total_ventas,
    COUNT(CASE WHEN sellerId IN (SELECT id FROM sellers) THEN 1 END) as ventas_con_seller_antiguo,
    COUNT(CASE WHEN sellerId IN (SELECT id FROM Client) THEN 1 END) as ventas_con_customer_nuevo
FROM sales;

-- 6. Crear la nueva restricción de clave foránea
ALTER TABLE sales ADD CONSTRAINT sales_sellerId_fkey 
FOREIGN KEY (sellerId) REFERENCES Client(id) ON UPDATE CASCADE;

-- 7. Verificar la nueva restricción
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

-- 8. Mostrar algunos ejemplos de ventas migradas
SELECT 
    s.id,
    s.saleNumber,
    s.sellerId,
    c.firstName as seller_nombre_nuevo,
    c.lastName as seller_apellido_nuevo,
    'MIGRADO CORRECTAMENTE' as estado
FROM sales s
JOIN Client c ON s.sellerId = c.id
ORDER BY s.createdAt DESC
LIMIT 5;
