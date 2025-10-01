-- Script para migrar de Sales/Purchases a Transactions unificadas
-- Este script unifica las operaciones de compra y venta en un solo modelo

-- 1. Crear tabla transactions
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    transactionNumber VARCHAR(191) NOT NULL UNIQUE,
    transactionDate DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    type ENUM('PURCHASE', 'SALE') NOT NULL,
    vehicleId VARCHAR(191) NOT NULL,
    customerId VARCHAR(191) NOT NULL,
    commissionistId VARCHAR(191),
    totalAmount DECIMAL(10,2) NOT NULL,
    commission DECIMAL(10,2) DEFAULT 0,
    status ENUM('PENDING', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    notes VARCHAR(191),
    paymentMethod VARCHAR(191) DEFAULT 'CONTADO',
    deliveryDate DATETIME(3),
    createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL
);

-- 2. Crear tabla transaction_documents
CREATE TABLE IF NOT EXISTS transaction_documents (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    documentNumber VARCHAR(191) NOT NULL UNIQUE,
    transactionId VARCHAR(191) NOT NULL,
    templateId VARCHAR(191),
    content TEXT,
    createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL
);

-- 3. Migrar datos de sales a transactions
INSERT INTO transactions (
    id, transactionNumber, transactionDate, type, vehicleId, customerId, 
    commissionistId, totalAmount, commission, status, notes, paymentMethod, 
    deliveryDate, createdAt, updatedAt
)
SELECT 
    CONCAT('txn-sale-', s.id, '-', UNIX_TIMESTAMP()) as id,
    CONCAT(s.saleNumber, '-', UNIX_TIMESTAMP()) as transactionNumber,
    s.saleDate as transactionDate,
    'SALE' as type,
    s.vehicleId,
    s.customerId, -- Comprador
    s.commissionistId,
    s.totalAmount,
    s.commission,
    s.status,
    s.notes,
    'CONTADO' as paymentMethod, -- Default
    NULL as deliveryDate,
    s.createdAt,
    s.updatedAt
FROM sales s;

-- 4. Migrar datos de purchases a transactions
INSERT INTO transactions (
    id, transactionNumber, transactionDate, type, vehicleId, customerId, 
    commissionistId, totalAmount, commission, status, notes, paymentMethod, 
    deliveryDate, createdAt, updatedAt
)
SELECT 
    CONCAT('txn-purchase-', p.id, '-', UNIX_TIMESTAMP()) as id,
    CONCAT(p.purchaseNumber, '-', UNIX_TIMESTAMP()) as transactionNumber,
    p.purchaseDate as transactionDate,
    'PURCHASE' as type,
    p.vehicleId,
    p.sellerId as customerId, -- El cliente que vende
    NULL as commissionistId, -- Las purchases no tenían comisionista
    p.totalAmount,
    p.commission,
    p.status,
    p.notes,
    p.paymentMethod,
    p.deliveryDate,
    p.createdAt,
    p.updatedAt
FROM purchases p;

-- 5. Migrar sale_documents a transaction_documents
INSERT INTO transaction_documents (
    id, documentNumber, transactionId, templateId, content, createdAt, updatedAt
)
SELECT 
    CONCAT('txn-doc-sale-', sd.id, '-', UNIX_TIMESTAMP()) as id,
    CONCAT(sd.documentNumber, '-', UNIX_TIMESTAMP()) as documentNumber,
    CONCAT('txn-sale-', sd.saleId, '-', UNIX_TIMESTAMP()) as transactionId,
    NULL as templateId,
    '' as content, -- Las sale_documents no tenían content
    sd.createdAt,
    sd.updatedAt
FROM sale_documents sd;

-- 6. Migrar purchase_documents a transaction_documents
INSERT INTO transaction_documents (
    id, documentNumber, transactionId, templateId, content, createdAt, updatedAt
)
SELECT 
    CONCAT('txn-doc-purchase-', pd.id, '-', UNIX_TIMESTAMP()) as id,
    CONCAT(pd.documentNumber, '-', UNIX_TIMESTAMP()) as documentNumber,
    CONCAT('txn-purchase-', pd.purchaseId, '-', UNIX_TIMESTAMP()) as transactionId,
    pd.templateId,
    pd.content,
    pd.createdAt,
    pd.updatedAt
FROM purchase_documents pd;

-- 7. Verificar estructura de payments y receipts
-- Nota: Las tablas payments y receipts ya tienen transactionId como campo requerido
-- No necesitamos agregar columnas, solo verificar que existan

-- 8. Verificar migración
SELECT 
    'TRANSACTIONS MIGRADAS' as info,
    COUNT(*) as total,
    SUM(CASE WHEN type = 'SALE' THEN 1 ELSE 0 END) as ventas,
    SUM(CASE WHEN type = 'PURCHASE' THEN 1 ELSE 0 END) as compras
FROM transactions;

SELECT 
    'TRANSACTION DOCUMENTS MIGRADOS' as info,
    COUNT(*) as total
FROM transaction_documents;

-- Nota: payments y receipts se crearán automáticamente con transactionId
-- cuando se usen en el nuevo sistema de transacciones
