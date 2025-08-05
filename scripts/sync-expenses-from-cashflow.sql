-- Script para sincronizar egresos de cashflow a la tabla expenses
-- Ejecutar: mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria < scripts/sync-expenses-from-cashflow.sql

-- Verificar egresos en cashflow que no están en expenses
SELECT '=== EGRESOS EN CASHFLOW ===' as info;
SELECT id, type, amount, description, category, createdAt 
FROM cashflow 
WHERE type = 'EXPENSE' 
ORDER BY createdAt DESC;

-- Verificar egresos en expenses
SELECT '=== EGRESOS EN EXPENSES ===' as info;
SELECT id, type, amount, description, createdAt 
FROM expenses 
ORDER BY createdAt DESC;

-- Insertar egresos de cashflow que no están en expenses
INSERT INTO expenses (id, type, amount, description, workshopId, sellerId, receiptPath, isActive, createdAt, updatedAt)
SELECT 
    CONCAT('exp-', UNIX_TIMESTAMP(c.createdAt), '-', SUBSTRING(c.id, 1, 9)) as id,
    CASE 
        WHEN c.category = 'MAINTENANCE' THEN 'WORKSHOP'
        WHEN c.category = 'PURCHASE' THEN 'PARTS'
        WHEN c.category = 'COMMISSION' THEN 'COMMISSION'
        ELSE 'PARTS'
    END as type,
    ABS(c.amount) as amount,
    c.description,
    NULL as workshopId,
    NULL as sellerId,
    c.receiptPath,
    1 as isActive,
    c.createdAt,
    c.updatedAt
FROM cashflow c
WHERE c.type = 'EXPENSE'
AND NOT EXISTS (
    SELECT 1 FROM expenses e 
    WHERE e.description = c.description 
    AND e.amount = ABS(c.amount)
    AND DATE(e.createdAt) = DATE(c.createdAt)
);

-- Verificar resultado
SELECT '=== EGRESOS SINCRONIZADOS ===' as info;
SELECT COUNT(*) as total_expenses FROM expenses;
SELECT COUNT(*) as total_cashflow_expenses FROM cashflow WHERE type = 'EXPENSE'; 