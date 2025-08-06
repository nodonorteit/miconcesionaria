-- Script para verificar la configuración de empresa
-- Ejecutar: mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria < scripts/check-company-config.sql

-- Verificar si la tabla existe
SELECT '=== VERIFICANDO TABLA COMPANY_CONFIG ===' as info;
SHOW TABLES LIKE 'company_config';

-- Verificar estructura de la tabla
SELECT '=== ESTRUCTURA DE LA TABLA ===' as info;
DESCRIBE company_config;

-- Verificar datos en la tabla
SELECT '=== DATOS EN LA TABLA ===' as info;
SELECT * FROM company_config;

-- Verificar si hay datos
SELECT '=== RESUMEN ===' as info;
SELECT 
    COUNT(*) as total_registros,
    MAX(updatedAt) as ultima_actualizacion
FROM company_config; 