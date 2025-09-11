-- Script para arreglar el template por defecto que tiene ID vacío
-- Este script genera un nuevo ID para el template que tiene id = ''

-- Función para generar un ID similar a los que genera Prisma
-- Prisma usa el formato: cm + 20 caracteres alfanuméricos
DELIMITER $$

CREATE FUNCTION generate_prisma_id() RETURNS VARCHAR(22)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE chars VARCHAR(62) DEFAULT 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    DECLARE result VARCHAR(22) DEFAULT 'cm';
    DECLARE i INT DEFAULT 1;
    DECLARE random_char CHAR(1);
    
    WHILE i <= 20 DO
        SET random_char = SUBSTRING(chars, FLOOR(1 + RAND() * 62), 1);
        SET result = CONCAT(result, random_char);
        SET i = i + 1;
    END WHILE;
    
    RETURN result;
END$$

DELIMITER ;

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
FROM DocumentTemplate 
WHERE type = 'BOLETO_COMPRA_VENTA';

-- Generar un nuevo ID para el template con ID vacío
UPDATE DocumentTemplate 
SET id = generate_prisma_id()
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

-- Limpiar la función temporal
DROP FUNCTION IF EXISTS generate_prisma_id;
