-- Script para verificar las tablas antes de crear expenses
-- Ejecutar: mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria < check-tables-before-expenses.sql

SELECT 'VERIFICANDO TABLAS ANTES DE CREAR EXPENSES:' as info;

SELECT '=== TABLAS EXISTENTES ===' as info;
SHOW TABLES;

SELECT '=== ESTRUCTURA DE LA TABLA workshops ===' as info;
DESCRIBE workshops;

SELECT '=== ESTRUCTURA DE LA TABLA sellers ===' as info;
DESCRIBE sellers;

SELECT '=== DATOS DE TALLERES ===' as info;
SELECT id, name FROM workshops LIMIT 5;

SELECT '=== DATOS DE VENDEDORES ===' as info;
SELECT id, name FROM sellers LIMIT 5;

SELECT '=== VERIFICANDO SI EXPENSES YA EXISTE ===' as info;
SHOW TABLES LIKE 'expenses'; 