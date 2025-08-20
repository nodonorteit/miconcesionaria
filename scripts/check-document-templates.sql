-- Script para verificar templates de documento en la base de datos
-- Ejecutar en la base de datos para diagnosticar el problema del preview

-- 1. Verificar si la tabla existe
SHOW TABLES LIKE 'document_templates';

-- 2. Verificar estructura de la tabla
DESCRIBE document_templates;

-- 3. Verificar si hay templates
SELECT 
    id,
    name,
    type,
    isActive,
    isDefault,
    LENGTH(content) as content_length,
    variables,
    createdAt,
    updatedAt
FROM document_templates;

-- 4. Verificar si hay templates activos
SELECT COUNT(*) as total_templates,
       COUNT(CASE WHEN isActive = 1 THEN 1 END) as active_templates,
       COUNT(CASE WHEN isDefault = 1 THEN 1 END) as default_templates
FROM document_templates;

-- 5. Verificar contenido del template "Boleto Estándar"
SELECT 
    name,
    type,
    SUBSTRING(content, 1, 200) as content_preview,
    LENGTH(content) as content_length,
    variables
FROM document_templates 
WHERE name = 'Boleto Estándar';

-- 6. Verificar si hay templates del tipo BOLETO_COMPRA_VENTA
SELECT 
    name,
    type,
    isActive,
    isDefault
FROM document_templates 
WHERE type = 'BOLETO_COMPRA_VENTA';
