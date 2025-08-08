-- Limpiar configuración de empresa
-- Este script elimina la referencia al logo que no existe

-- Opción 1: Actualizar la configuración para quitar el logo
UPDATE company_config 
SET logoUrl = '', updatedAt = NOW()
WHERE logoUrl LIKE '%company_logo_1754448284279_parana_automotores.jpeg%';

-- Opción 2: Si quieres eliminar toda la configuración (descomenta si es necesario)
-- DELETE FROM company_config WHERE logoUrl LIKE '%company_logo_1754448284279_parana_automotores.jpeg%';

-- Verificar el resultado
SELECT * FROM company_config ORDER BY updatedAt DESC LIMIT 1; 