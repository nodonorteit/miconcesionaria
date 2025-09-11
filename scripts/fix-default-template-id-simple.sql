-- Script simple para arreglar el template por defecto que tiene ID vacío
-- Este script genera un nuevo ID para el template que tiene id = ''

-- Verificar el estado actual
SELECT 
    id, 
    name, 
    type, 
    CASE 
        WHEN id = '' THEN 'ID VACÍO'
        WHEN id IS NULL THEN 'ID NULL'
        ELSE 'ID VÁLIDO'
    END as estado_id,
    createdAt,
    updatedAt
FROM document_templates 
WHERE type = 'BOLETO_COMPRA_VENTA';

-- Generar un nuevo ID para el template con ID vacío usando una función simple
UPDATE document_templates 
SET id = CONCAT(
    'cm', 
    SUBSTRING(REPLACE(REPLACE(REPLACE(TO_BASE64(SHA2(CONCAT(NOW(), RAND()), 256)), '+', ''), '/', ''), '=', ''), 1, 20)
)
WHERE id = '' AND type = 'BOLETO_COMPRA_VENTA';

-- Verificar el resultado
SELECT 
    id, 
    name, 
    type, 
    CASE 
        WHEN id = '' THEN 'ID VACÍO'
        WHEN id IS NULL THEN 'ID NULL'
        ELSE 'ID VÁLIDO'
    END as estado_id,
    createdAt,
    updatedAt
FROM document_templates 
WHERE type = 'BOLETO_COMPRA_VENTA';
