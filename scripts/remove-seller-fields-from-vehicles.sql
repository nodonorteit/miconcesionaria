-- Script para eliminar campos individuales del vendedor en la tabla Vehicle
-- Estos campos ya no son necesarios porque usamos la transacción para vincular con el cliente

-- Eliminar columnas de vendedor
ALTER TABLE Vehicle DROP COLUMN IF EXISTS sellerName;
ALTER TABLE Vehicle DROP COLUMN IF EXISTS sellerDocument;
ALTER TABLE Vehicle DROP COLUMN IF EXISTS sellerPhone;

-- Verificar estructura actualizada
DESCRIBE Vehicle;

