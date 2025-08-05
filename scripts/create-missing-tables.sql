-- Script para crear tablas faltantes en la base de datos
-- Ejecutar en MariaDB: mysql -u miconcesionaria -p miconcesionaria < create-missing-tables.sql

-- ========================================
-- CREAR TABLAS FALTANTES
-- ========================================

-- 1. Tabla sales (ventas)
CREATE TABLE IF NOT EXISTS sales (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    saleNumber VARCHAR(191) NOT NULL UNIQUE,
    vehicleId VARCHAR(191) NOT NULL,
    customerId VARCHAR(191) NOT NULL,
    sellerId VARCHAR(191) NOT NULL,
    saleDate DATETIME(3) NOT NULL,
    salePrice DECIMAL(10,2) NOT NULL,
    commission DECIMAL(10,2) NOT NULL,
    status ENUM('COMPLETED', 'PENDING', 'CANCELLED') NOT NULL DEFAULT 'COMPLETED',
    isActive BOOLEAN NOT NULL DEFAULT 1,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL,
    FOREIGN KEY (vehicleId) REFERENCES Vehicle(id),
    FOREIGN KEY (customerId) REFERENCES Client(id),
    FOREIGN KEY (sellerId) REFERENCES Seller(id)
);

-- 2. Tabla cashflow (flujo de caja)
CREATE TABLE IF NOT EXISTS cashflow (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    type ENUM('INCOME', 'EXPENSE') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    category ENUM('SALES', 'PURCHASE', 'MAINTENANCE', 'ADMINISTRATIVE', 'MARKETING', 'OTHER') NOT NULL,
    receiptPath VARCHAR(191),
    isActive BOOLEAN NOT NULL DEFAULT 1,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL
);

-- 3. Tabla vehicle_images (imágenes de vehículos)
CREATE TABLE IF NOT EXISTS vehicle_images (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    filename VARCHAR(191) NOT NULL,
    path VARCHAR(191) NOT NULL,
    isPrimary BOOLEAN NOT NULL DEFAULT 0,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    vehicleId VARCHAR(191) NOT NULL,
    FOREIGN KEY (vehicleId) REFERENCES Vehicle(id)
);

-- 4. Tabla sellers (vendedores)
CREATE TABLE IF NOT EXISTS Seller (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    phone VARCHAR(191),
    commissionRate DECIMAL(5,2) NOT NULL DEFAULT 5.00,
    isActive BOOLEAN NOT NULL DEFAULT 1,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL
);

-- 5. Verificar que vehicle_types existe, si no crearla
CREATE TABLE IF NOT EXISTS vehicle_types (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    name VARCHAR(191) NOT NULL UNIQUE,
    category ENUM('AUTOMOTIVE','MOTORCYCLE','COMMERCIAL','AGRICULTURAL','MARINE','CONSTRUCTION','RECREATIONAL','SPECIALTY') DEFAULT 'AUTOMOTIVE',
    description VARCHAR(191),
    isActive BOOLEAN NOT NULL DEFAULT 1,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL
);

-- 6. Verificar que Provider existe, si no crearla
CREATE TABLE IF NOT EXISTS Provider (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    phone VARCHAR(191),
    address TEXT,
    taxId VARCHAR(191) NOT NULL UNIQUE,
    contactPerson VARCHAR(191),
    isActive BOOLEAN NOT NULL DEFAULT 1,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL
);

-- 7. Verificar que Workshop existe, si no crearla
CREATE TABLE IF NOT EXISTS Workshop (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    phone VARCHAR(191),
    address TEXT,
    taxId VARCHAR(191) NOT NULL UNIQUE,
    contactPerson VARCHAR(191),
    specialties TEXT,
    isActive BOOLEAN NOT NULL DEFAULT 1,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL
);

-- 8. Verificar que Client existe, si no crearla
CREATE TABLE IF NOT EXISTS Client (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    phone VARCHAR(191),
    address TEXT,
    taxId VARCHAR(191) NOT NULL UNIQUE,
    isActive BOOLEAN NOT NULL DEFAULT 1,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL
);

-- 9. Verificar que Vehicle tiene vehicleTypeId, si no agregarlo
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'miconcesionaria'
    AND TABLE_NAME = 'Vehicle'
    AND COLUMN_NAME = 'vehicleTypeId'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE Vehicle ADD COLUMN vehicleTypeId VARCHAR(191) NOT NULL AFTER status, ADD FOREIGN KEY (vehicleTypeId) REFERENCES vehicle_types(id);',
    'SELECT "Column vehicleTypeId already exists" as message;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar que se crearon las tablas
SELECT 'TABLAS CREADAS:' as info;
SHOW TABLES;

-- Verificar estructura de las tablas principales
SELECT 'ESTRUCTURA DE TABLAS:' as info;
DESCRIBE sales;
DESCRIBE cashflow;
DESCRIBE vehicle_images;
DESCRIBE Seller;
DESCRIBE vehicle_types;
DESCRIBE Provider;
DESCRIBE Workshop;
DESCRIBE Client; 