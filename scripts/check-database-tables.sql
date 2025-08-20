-- Script para verificar las tablas existentes en la base de datos
-- Ejecutar en el servidor de producción para diagnosticar el problema

-- Mostrar todas las tablas
SHOW TABLES;

-- Verificar si existe la tabla vehicles
SELECT COUNT(*) as table_exists 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'vehicles';

-- Verificar si existe la tabla sales
SELECT COUNT(*) as table_exists 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'sales';

-- Verificar si existe la tabla customers
SELECT COUNT(*) as table_exists 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'customers';

-- Verificar si existe la tabla sellers
SELECT COUNT(*) as table_exists 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'sellers';

-- Verificar si existe la tabla vehicle_types
SELECT COUNT(*) as table_exists 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'vehicle_types';

-- Verificar si existe la tabla vehicle_images
SELECT COUNT(*) as table_exists 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'vehicle_images';

-- Verificar si existe la tabla sale_documents
SELECT COUNT(*) as table_exists 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'sale_documents';

-- Mostrar estructura de la base de datos
SELECT 
    table_name,
    table_rows,
    data_length,
    index_length
FROM information_schema.tables 
WHERE table_schema = DATABASE()
ORDER BY table_name;
