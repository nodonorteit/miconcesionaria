-- Script para arreglar el template por defecto que tiene ID vacío
-- Este script genera un nuevo ID para el template que tiene id = ''

-- Primero, verificar el estado actual
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
FROM DocumentTemplate 
WHERE type = 'BOLETO_COMPRA_VENTA';

-- Generar un nuevo ID para el template con ID vacío
-- Usamos una función para generar un ID similar a los que genera Prisma
UPDATE DocumentTemplate 
SET id = CONCAT(
    'cm', 
    SUBSTRING(MD5(CONCAT(NOW(), RAND())), 1, 20)
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
FROM DocumentTemplate 
WHERE type = 'BOLETO_COMPRA_VENTA';
