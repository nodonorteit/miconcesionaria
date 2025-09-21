-- Script para actualizar números de documento al formato AAAAMMDD
-- Cambia de AAAAMMDDHHMMSS a AAAAMMDD

-- Primero, mostrar el estado actual
SELECT 
    'ANTES DE LA ACTUALIZACIÓN' as estado,
    COUNT(*) as total_documentos,
    SUM(CASE WHEN documentNumber REGEXP '^[0-9]{8}$' THEN 1 ELSE 0 END) as formato_AAAAMMDD,
    SUM(CASE WHEN documentNumber REGEXP '^[0-9]{12}$' THEN 1 ELSE 0 END) as formato_AAAAMMDDHHMM,
    SUM(CASE WHEN documentNumber REGEXP '^[0-9]{14}$' THEN 1 ELSE 0 END) as formato_AAAAMMDDHHMMSS
FROM sale_documents;

-- Crear tabla temporal para manejar duplicados
CREATE TEMPORARY TABLE temp_document_numbers AS
SELECT 
    id,
    saleId,
    documentNumber,
    createdAt,
    CONCAT(
        YEAR(createdAt),
        LPAD(MONTH(createdAt), 2, '0'),
        LPAD(DAY(createdAt), 2, '0')
    ) as new_documentNumber,
    ROW_NUMBER() OVER (
        PARTITION BY CONCAT(
            YEAR(createdAt),
            LPAD(MONTH(createdAt), 2, '0'),
            LPAD(DAY(createdAt), 2, '0')
        ) 
        ORDER BY createdAt
    ) as row_num
FROM sale_documents 
WHERE documentNumber REGEXP '^[0-9]{12,14}$';

-- Actualizar con formato AAAAMMDD (agregando contador si hay duplicados)
UPDATE sale_documents sd
JOIN temp_document_numbers tdn ON sd.id = tdn.id
SET sd.documentNumber = CASE 
    WHEN tdn.row_num = 1 THEN tdn.new_documentNumber
    ELSE CONCAT(tdn.new_documentNumber, LPAD(tdn.row_num, 2, '0'))
END;

-- Limpiar tabla temporal
DROP TEMPORARY TABLE temp_document_numbers;

-- Mostrar el estado después de la actualización
SELECT 
    'DESPUÉS DE LA ACTUALIZACIÓN' as estado,
    COUNT(*) as total_documentos,
    SUM(CASE WHEN documentNumber REGEXP '^[0-9]{8}$' THEN 1 ELSE 0 END) as formato_AAAAMMDD,
    SUM(CASE WHEN documentNumber REGEXP '^[0-9]{10}$' THEN 1 ELSE 0 END) as formato_AAAAMMDD_con_contador,
    SUM(CASE WHEN documentNumber REGEXP '^[0-9]{12,14}$' THEN 1 ELSE 0 END) as formato_anterior
FROM sale_documents;

-- Mostrar algunos ejemplos de documentos actualizados
SELECT 
    id,
    saleId,
    documentNumber,
    createdAt,
    'ACTUALIZADO' as estado
FROM sale_documents 
WHERE documentNumber REGEXP '^[0-9]{8,10}$'
ORDER BY createdAt DESC 
LIMIT 5;
