-- Verificar TODOS los números de documento y su formato actual
SELECT 
    id,
    saleId,
    documentNumber,
    createdAt,
    CASE 
        WHEN documentNumber REGEXP '^[0-9]{8}$' THEN 'FORMATO AAAAMMDD'
        WHEN documentNumber REGEXP '^[0-9]{10}$' THEN 'FORMATO AAAAMMDD con contador'
        WHEN documentNumber REGEXP '^[0-9]{12}$' THEN 'FORMATO AAAAMMDDHHMM'
        WHEN documentNumber REGEXP '^[0-9]{14}$' THEN 'FORMATO AAAAMMDDHHMMSS'
        WHEN documentNumber REGEXP '^[a-z0-9]{20,}$' THEN 'ES CUID/ID'
        ELSE 'OTRO FORMATO'
    END as formato_actual,
    LENGTH(documentNumber) as longitud
FROM sale_documents 
ORDER BY createdAt DESC;

-- Contar por formato
SELECT 
    CASE 
        WHEN documentNumber REGEXP '^[0-9]{8}$' THEN 'FORMATO AAAAMMDD'
        WHEN documentNumber REGEXP '^[0-9]{10}$' THEN 'FORMATO AAAAMMDD con contador'
        WHEN documentNumber REGEXP '^[0-9]{12}$' THEN 'FORMATO AAAAMMDDHHMM'
        WHEN documentNumber REGEXP '^[0-9]{14}$' THEN 'FORMATO AAAAMMDDHHMMSS'
        WHEN documentNumber REGEXP '^[a-z0-9]{20,}$' THEN 'ES CUID/ID'
        ELSE 'OTRO FORMATO'
    END as formato,
    COUNT(*) as cantidad
FROM sale_documents 
GROUP BY formato
ORDER BY cantidad DESC;
