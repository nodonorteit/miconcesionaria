-- Script para corregir la URL del logo de la empresa en la base de datos
-- Este script actualiza la URL del logo de '/logo.svg' a la URL correcta

-- Verificar la configuración actual
SELECT 'Configuración actual:' as info;
SELECT * FROM company_config ORDER BY updatedAt DESC LIMIT 1;

-- Actualizar la URL del logo si es '/logo.svg'
UPDATE company_config 
SET logoUrl = '/uploads/company_logo_1754448284279_parana_automotores.jpeg',
    updatedAt = NOW()
WHERE logoUrl = '/logo.svg' 
   OR logoUrl IS NULL 
   OR logoUrl = '';

-- Verificar la configuración después de la actualización
SELECT 'Configuración después de la actualización:' as info;
SELECT * FROM company_config ORDER BY updatedAt DESC LIMIT 1;

-- Si no hay registros, crear uno nuevo
INSERT INTO company_config (name, logoUrl, description, createdAt, updatedAt)
SELECT 'Parana Automotores', '/uploads/company_logo_1754448284279_parana_automotores.jpeg', 'Sistema de Gestión', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM company_config);

-- Verificar la configuración final
SELECT 'Configuración final:' as info;
SELECT * FROM company_config ORDER BY updatedAt DESC LIMIT 1; 