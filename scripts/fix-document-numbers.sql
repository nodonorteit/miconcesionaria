-- Script para corregir números de documento que están usando el ID
-- Este script actualiza los documentNumber que son iguales al id

-- Primero, mostrar el estado actual
SELECT 
    'ANTES DE LA CORRECCIÓN' as estado,
    COUNT(*) as total_documentos,
    SUM(CASE WHEN documentNumber = id THEN 1 ELSE 0 END) as documentos_con_problema
FROM sale_documents;

-- Actualizar documentos donde documentNumber = id
-- Usar la fecha de creación para generar un número consistente
UPDATE sale_documents 
SET documentNumber = CONCAT(
    YEAR(createdAt),
    LPAD(MONTH(createdAt), 2, '0'),
    LPAD(DAY(createdAt), 2, '0'),
    LPAD(HOUR(createdAt), 2, '0'),
    LPAD(MINUTE(createdAt), 2, '0')
)
WHERE documentNumber = id;

-- Mostrar el estado después de la corrección
SELECT 
    'DESPUÉS DE LA CORRECCIÓN' as estado,
    COUNT(*) as total_documentos,
    SUM(CASE WHEN documentNumber = id THEN 1 ELSE 0 END) as documentos_con_problema
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
