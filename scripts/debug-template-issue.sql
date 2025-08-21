-- Script para debuggear el problema del template del boleto
-- Ejecutar en la base de datos para diagnosticar por qué no se usa el template personalizado

-- 1. Verificar si la tabla existe
SHOW TABLES LIKE 'document_templates';

-- 2. Verificar estructura de la tabla
DESCRIBE document_templates;

-- 3. Verificar todos los templates
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

-- 4. Verificar específicamente el template del boleto
SELECT
    id,
    name,
    type,
    isActive,
    isDefault,
    LENGTH(content) as content_length,
    variables
FROM document_templates
WHERE type = 'BOLETO_COMPRA_VENTA';

-- 5. Verificar si hay templates por defecto
SELECT
    COUNT(*) as total_templates,
    COUNT(CASE WHEN isActive = 1 THEN 1 END) as active_templates,
    COUNT(CASE WHEN isDefault = 1 THEN 1 END) as default_templates,
    COUNT(CASE WHEN type = 'BOLETO_COMPRA_VENTA' THEN 1 END) as boleto_templates,
    COUNT(CASE WHEN type = 'BOLETO_COMPRA_VENTA' AND isDefault = 1 THEN 1 END) as boleto_default_templates
FROM document_templates;

-- 6. Verificar el contenido del template del boleto
SELECT
    name,
    type,
    isActive,
    isDefault,
    SUBSTRING(content, 1, 300) as content_preview,
    LENGTH(content) as content_length,
    variables
FROM document_templates
WHERE type = 'BOLETO_COMPRA_VENTA'
LIMIT 1;

-- 7. Verificar si hay templates con el mismo tipo pero diferentes configuraciones
SELECT
    name,
    type,
    isActive,
    isDefault,
    LENGTH(content) as content_length
FROM document_templates
WHERE type LIKE '%BOLETO%' OR type LIKE '%COMPRA%' OR type LIKE '%VENTA%'
ORDER BY isDefault DESC, isActive DESC, createdAt DESC;
