-- Script para verificar datos de talleres
-- Ejecutar: mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria < check-workshops.sql

SELECT 'VERIFICANDO DATOS DE TALLERES:' as info;

SELECT '=== ESTRUCTURA DE LA TABLA workshops ===' as info;
DESCRIBE workshops;

SELECT '=== DATOS DE TALLERES ===' as info;
SELECT id, name, email, phone, address, isActive, createdAt FROM workshops;

SELECT '=== CANTIDAD DE TALLERES ===' as info;
SELECT COUNT(*) as total_workshops FROM workshops WHERE isActive = 1; 