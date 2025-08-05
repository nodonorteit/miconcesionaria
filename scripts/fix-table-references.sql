-- Script para corregir referencias de tablas
-- Verificar qué tablas existen realmente

-- Verificar tablas existentes
SELECT 'TABLAS EXISTENTES:' as info;
SHOW TABLES;

-- Verificar estructura de tabla de vendedores
SELECT 'ESTRUCTURA SELLERS:' as info;
DESCRIBE sellers;

-- Verificar estructura de tabla de clientes
SELECT 'ESTRUCTURA CLIENT:' as info;
DESCRIBE Client;

-- Verificar estructura de tabla de vehículos
SELECT 'ESTRUCTURA VEHICLE:' as info;
DESCRIBE Vehicle;

-- Verificar foreign keys de sales
SELECT 'FOREIGN KEYS DE SALES:' as info;
SELECT 
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'miconcesionaria' 
AND TABLE_NAME = 'sales' 
AND REFERENCED_TABLE_NAME IS NOT NULL; 