-- Script para crear la tabla de configuración de empresa
-- Ejecutar: mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria < scripts/create-company-config-table.sql

-- Crear tabla de configuración de empresa
CREATE TABLE IF NOT EXISTS company_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT 'AutoMax',
    logoUrl VARCHAR(500) NOT NULL DEFAULT '/logo.svg',
    description VARCHAR(500) DEFAULT 'Sistema de Gestión',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar configuración por defecto si la tabla está vacía
INSERT INTO company_config (name, logoUrl, description)
SELECT 'AutoMax', '/logo.svg', 'Sistema de Gestión'
WHERE NOT EXISTS (SELECT 1 FROM company_config);

-- Verificar que se creó correctamente
SELECT '=== TABLA COMPANY_CONFIG CREADA ===' as info;
DESCRIBE company_config;
SELECT '=== CONFIGURACIÓN ACTUAL ===' as info;
SELECT * FROM company_config; 