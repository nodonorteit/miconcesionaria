-- Script corregido para actualizar TODOS los documentNumber que son CUID/ID
-- Este script actualiza todos los documentNumber que no están en formato AAAAMMDDHHMM

-- Primero, mostrar el estado actual
SELECT 
    'ANTES DE LA CORRECCIÓN' as estado,
    COUNT(*) as total_documentos,
    SUM(CASE WHEN documentNumber REGEXP '^[a-z0-9]{20,}$' THEN 1 ELSE 0 END) as documentos_con_cuid,
    SUM(CASE WHEN documentNumber REGEXP '^[0-9]{12}$' THEN 1 ELSE 0 END) as documentos_correctos
FROM sale_documents;

-- Actualizar TODOS los documentos que tienen CUID como documentNumber
-- Usar la fecha de creación para generar un número consistente
UPDATE sale_documents 
SET documentNumber = CONCAT(
    YEAR(createdAt),
    LPAD(MONTH(createdAt), 2, '0'),
    LPAD(DAY(createdAt), 2, '0'),
    LPAD(HOUR(createdAt), 2, '0'),
    LPAD(MINUTE(createdAt), 2, '0')
)
WHERE documentNumber REGEXP '^[a-z0-9]{20,}$';

-- Mostrar el estado después de la corrección
SELECT 
    'DESPUÉS DE LA CORRECCIÓN' as estado,
    COUNT(*) as total_documentos,
    SUM(CASE WHEN documentNumber REGEXP '^[a-z0-9]{20,}$' THEN 1 ELSE 0 END) as documentos_con_cuid,
    SUM(CASE WHEN documentNumber REGEXP '^[0-9]{12}$' THEN 1 ELSE 0 END) as documentos_correctos
FROM sale_documents;

-- Mostrar algunos ejemplos de documentos corregidos
SELECT 
    id,
    saleId,
    documentNumber,
    createdAt,
    'CORREGIDO' as estado
FROM sale_documents 
WHERE documentNumber REGEXP '^[0-9]{12}$'
ORDER BY createdAt DESC 
LIMIT 5;
