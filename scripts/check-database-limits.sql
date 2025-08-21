-- Script para verificar límites de la base de datos
-- Ejecutar para diagnosticar por qué se trunca el HTML del template

-- 1. Verificar estructura de la tabla document_templates
DESCRIBE document_templates;

-- 2. Verificar límites de campos TEXT/LONGTEXT
SHOW CREATE TABLE document_templates;

-- 3. Verificar configuración de MySQL/MariaDB
SHOW VARIABLES LIKE 'max_allowed_packet';
SHOW VARIABLES LIKE 'group_concat_max_len';
SHOW VARIABLES LIKE 'sql_mode';

-- 4. Verificar el template actual (debe mostrar solo 191 caracteres)
SELECT
    id,
    name,
    type,
    isActive,
    isDefault,
    LENGTH(content) as content_length,
    SUBSTRING(content, 1, 200) as content_preview,
    variables
FROM document_templates
WHERE type = 'BOLETO_COMPRA_VENTA';

-- 5. Verificar si hay otros templates con contenido largo
SELECT
    name,
    type,
    LENGTH(content) as content_length,
    SUBSTRING(content, 1, 100) as content_preview
FROM document_templates
ORDER BY LENGTH(content) DESC;

-- 6. Verificar configuración del servidor
SELECT @@version, @@version_compile_os;
