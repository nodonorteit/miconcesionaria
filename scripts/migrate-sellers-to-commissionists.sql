-- Script para migrar datos de sellers a commissionists
-- Este script separa los conceptos de clientes y comisionistas

-- 1. Crear tabla commissionists
CREATE TABLE IF NOT EXISTS commissionists (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    firstName VARCHAR(191) NOT NULL,
    lastName VARCHAR(191) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    phone VARCHAR(191),
    commissionRate DECIMAL(5,2) DEFAULT 0.05,
    isActive BOOLEAN DEFAULT true,
    createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL
);

-- 2. Migrar datos de sellers a commissionists
INSERT INTO commissionists (id, firstName, lastName, email, phone, commissionRate, isActive, createdAt, updatedAt)
SELECT 
    CONCAT('comm-', id) as id,
    firstName,
    lastName,
    email,
    phone,
    commissionRate,
    isActive,
    createdAt,
    updatedAt
FROM sellers;

-- 3. Actualizar tabla sales para agregar commissionistId
ALTER TABLE sales ADD COLUMN commissionistId VARCHAR(191);

-- 4. Migrar relaciones de sales con sellers a commissionists
UPDATE sales s
JOIN sellers sel ON s.sellerId COLLATE utf8mb4_unicode_ci = sel.id COLLATE utf8mb4_unicode_ci
SET s.commissionistId = CONCAT('comm-', sel.id)
WHERE s.sellerId IN (SELECT id FROM sellers);

-- 5. Actualizar tabla commissions
ALTER TABLE commissions CHANGE COLUMN sellerId commissionistId VARCHAR(191);

UPDATE commissions c
JOIN sellers s ON c.commissionistId COLLATE utf8mb4_unicode_ci = s.id COLLATE utf8mb4_unicode_ci
SET c.commissionistId = CONCAT('comm-', s.id);

-- 6. Actualizar tabla expenses
ALTER TABLE expenses CHANGE COLUMN sellerId commissionistId VARCHAR(191);

UPDATE expenses e
JOIN sellers s ON e.commissionistId COLLATE utf8mb4_unicode_ci = s.id COLLATE utf8mb4_unicode_ci
SET e.commissionistId = CONCAT('comm-', s.id);

-- 7. Verificar migración
SELECT 
    'COMMISSIONISTS MIGRADOS' as info,
    COUNT(*) as total
FROM commissionists;

SELECT 
    'SALES CON COMMISSIONIST' as info,
    COUNT(*) as total
FROM sales 
WHERE commissionistId IS NOT NULL;

SELECT 
    'COMMISSIONS MIGRADAS' as info,
    COUNT(*) as total
FROM commissions;

SELECT 
    'EXPENSES MIGRADAS' as info,
    COUNT(*) as total
FROM expenses 
WHERE commissionistId IS NOT NULL;
