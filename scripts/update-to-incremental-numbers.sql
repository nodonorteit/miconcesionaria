-- Script para actualizar todos los documentos a numeración incremental
-- Cambia todos los documentNumber a formato 0000000001, 0000000002, etc.

-- Primero, mostrar el estado actual
SELECT 
    'ANTES DE LA ACTUALIZACIÓN' as estado,
    COUNT(*) as total_documentos,
    MIN(documentNumber) as primer_numero,
    MAX(documentNumber) as ultimo_numero
FROM sale_documents;

-- Crear tabla temporal con numeración incremental
CREATE TEMPORARY TABLE temp_incremental_numbers AS
SELECT 
    id,
    saleId,
    documentNumber,
    createdAt,
    ROW_NUMBER() OVER (ORDER BY createdAt ASC) as incremental_number
FROM sale_documents 
ORDER BY createdAt ASC;

-- Actualizar todos los documentos con numeración incremental
UPDATE sale_documents sd
JOIN temp_incremental_numbers tin ON sd.id = tin.id
SET sd.documentNumber = LPAD(tin.incremental_number, 10, '0');

-- Limpiar tabla temporal
DROP TEMPORARY TABLE temp_incremental_numbers;

-- Mostrar el estado después de la actualización
SELECT 
    'DESPUÉS DE LA ACTUALIZACIÓN' as estado,
    COUNT(*) as total_documentos,
    MIN(documentNumber) as primer_numero,
    MAX(documentNumber) as ultimo_numero
FROM sale_documents;

-- Mostrar algunos ejemplos de documentos actualizados
SELECT 
    id,
    saleId,
    documentNumber,
    createdAt,
    'ACTUALIZADO' as estado
FROM sale_documents 
ORDER BY createdAt ASC 
LIMIT 5;
