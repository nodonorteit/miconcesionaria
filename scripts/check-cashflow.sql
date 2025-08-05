-- Script para verificar la tabla cashflow
-- Ejecutar: mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria < check-cashflow.sql

SELECT 'VERIFICANDO TABLA CASHFLOW:' as info;

SELECT '=== ESTRUCTURA DE LA TABLA cashflow ===' as info;
DESCRIBE cashflow;

SELECT '=== DATOS DE CASHFLOW ===' as info;
SELECT id, type, amount, description, category, isActive, createdAt FROM cashflow LIMIT 10;

SELECT '=== CANTIDAD DE ENTRADAS ===' as info;
SELECT COUNT(*) as total_entries FROM cashflow WHERE isActive = 1;

SELECT '=== BALANCE ACTUAL ===' as info;
SELECT 
  SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as total_income,
  SUM(CASE WHEN type = 'EXPENSE' THEN ABS(amount) ELSE 0 END) as total_expenses,
  SUM(amount) as current_balance
FROM cashflow 
WHERE isActive = 1; 