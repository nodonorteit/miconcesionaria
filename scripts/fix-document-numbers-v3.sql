-- Script para corregir números de documento con manejo de duplicados
-- Agrega segundos para evitar duplicados

-- Primero, mostrar el estado actual
SELECT 
    'ANTES DE LA CORRECCIÓN' as estado,
    COUNT(*) as total_documentos,
    SUM(CASE WHEN documentNumber REGEXP '^[a-z0-9]{20,}$' THEN 1 ELSE 0 END) as documentos_con_cuid,
    SUM(CASE WHEN documentNumber REGEXP '^[0-9]{12}$' THEN 1 ELSE 0 END) as documentos_correctos
FROM sale_documents;

-- Crear una tabla temporal para generar números únicos
CREATE TEMPORARY TABLE temp_document_numbers AS
SELECT 
    id,
    saleId,
    documentNumber,
    createdAt,
    CONCAT(
        YEAR(createdAt),
        LPAD(MONTH(createdAt), 2, '0'),
        LPAD(DAY(createdAt), 2, '0'),
        LPAD(HOUR(createdAt), 2, '0'),
        LPAD(MINUTE(createdAt), 2, '0'),
        LPAD(SECOND(createdAt), 2, '0')
    ) as new_documentNumber,
    ROW_NUMBER() OVER (
        PARTITION BY CONCAT(
            YEAR(createdAt),
            LPAD(MONTH(createdAt), 2, '0'),
            LPAD(DAY(createdAt), 2, '0'),
            LPAD(HOUR(createdAt), 2, '0'),
            LPAD(MINUTE(createdAt), 2, '0'),
            LPAD(SECOND(createdAt), 2, '0')
        ) 
        ORDER BY createdAt
    ) as row_num
FROM sale_documents 
WHERE documentNumber REGEXP '^[a-z0-9]{20,}$';

-- Actualizar con números únicos (agregando contador si hay duplicados)
UPDATE sale_documents sd
JOIN temp_document_numbers tdn ON sd.id = tdn.id
SET sd.documentNumber = CASE 
    WHEN tdn.row_num = 1 THEN tdn.new_documentNumber
    ELSE CONCAT(tdn.new_documentNumber, LPAD(tdn.row_num, 2, '0'))
END;

-- Limpiar tabla temporal
DROP TEMPORARY TABLE temp_document_numbers;

-- Mostrar el estado después de la corrección
SELECT 
    'DESPUÉS DE LA CORRECCIÓN' as estado,
    COUNT(*) as total_documentos,
    SUM(CASE WHEN documentNumber REGEXP '^[a-z0-9]{20,}$' THEN 1 ELSE 0 END) as documentos_con_cuid,
    SUM(CASE WHEN documentNumber REGEXP '^[0-9]{12,14}$' THEN 1 ELSE 0 END) as documentos_correctos
FROM sale_documents;

-- Mostrar algunos ejemplos de documentos corregidos
SELECT 
    id,
    saleId,
    documentNumber,
    createdAt,
    'CORREGIDO' as estado
FROM sale_documents 
WHERE documentNumber REGEXP '^[0-9]{12,14}$'
ORDER BY createdAt DESC 
LIMIT 5;
