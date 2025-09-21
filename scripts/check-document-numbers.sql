-- Verificar el estado actual de los números de documento
SELECT 
    id,
    saleId,
    documentNumber,
    createdAt,
    updatedAt,
    CASE 
        WHEN documentNumber = id THEN 'PROBLEMA: documentNumber = id'
        WHEN documentNumber REGEXP '^[0-9]{12}$' THEN 'CORRECTO: Formato AAAAMMDDHHMM'
        WHEN documentNumber REGEXP '^[a-z0-9]{20,}$' THEN 'PROBLEMA: Es un CUID/ID'
        ELSE 'OTRO FORMATO'
    END as estado_documentNumber
FROM sale_documents 
ORDER BY createdAt DESC 
LIMIT 10;

-- Verificar si hay documentos con documentNumber igual al id
SELECT 
    COUNT(*) as documentos_con_problema
FROM sale_documents 
WHERE documentNumber = id;

-- Mostrar un ejemplo específico si existe
SELECT 
    id,
    saleId,
    documentNumber,
    createdAt
FROM sale_documents 
WHERE documentNumber = id 
LIMIT 1;
