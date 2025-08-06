-- Script para limpiar la tabla de configuración de empresa
-- Ejecutar: mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria < scripts/clean-company-config.sql

-- Eliminar todos los registros
DELETE FROM company_config;

-- Insertar configuración limpia
INSERT INTO company_config (name, logoUrl, description) 
VALUES ('AutoMax', '/logo.svg', 'Sistema de Gestión');

-- Verificar resultado
SELECT '=== TABLA LIMPIA ===' as info;
SELECT * FROM company_config; 