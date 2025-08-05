-- Script para actualizar la base de datos en el servidor
-- Ejecutar en MariaDB: mysql -u miconcesionaria -p miconcesionaria < update-database.sql

-- Verificar si la columna category ya existe
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'miconcesionaria'
    AND TABLE_NAME = 'vehicle_types'
    AND COLUMN_NAME = 'category'
);

-- Solo agregar la columna si no existe
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE vehicle_types ADD COLUMN category ENUM(\'AUTOMOTIVE\', \'MOTORCYCLE\', \'COMMERCIAL\', \'AGRICULTURAL\', \'MARINE\', \'CONSTRUCTION\', \'RECREATIONAL\', \'SPECIALTY\') DEFAULT \'AUTOMOTIVE\' AFTER name;',
    'SELECT \'Column category already exists\' as message;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Actualizar tipos existentes con categorías apropiadas (solo si la columna se agregó)
UPDATE vehicle_types SET category = 'AUTOMOTIVE' WHERE name IN ('Sedán', 'SUV', 'Camioneta', 'Hatchback', 'Pickup') AND category = 'AUTOMOTIVE';
UPDATE vehicle_types SET category = 'MOTORCYCLE' WHERE name IN ('Moto', 'Scooter', 'Cuatriciclo') AND category = 'AUTOMOTIVE';
UPDATE vehicle_types SET category = 'COMMERCIAL' WHERE name IN ('Camión', 'Furgón', 'Van Comercial') AND category = 'AUTOMOTIVE';
UPDATE vehicle_types SET category = 'AGRICULTURAL' WHERE name IN ('Tractor', 'Cosechadora') AND category = 'AUTOMOTIVE';
UPDATE vehicle_types SET category = 'MARINE' WHERE name IN ('Lancha', 'Yate', 'Moto de Agua') AND category = 'AUTOMOTIVE';
UPDATE vehicle_types SET category = 'CONSTRUCTION' WHERE name IN ('Excavadora', 'Grúa') AND category = 'AUTOMOTIVE';
UPDATE vehicle_types SET category = 'RECREATIONAL' WHERE name IN ('Caravana', 'Motorhome') AND category = 'AUTOMOTIVE';

-- Verificar que se aplicaron los cambios
SELECT 'Database updated successfully' as status;
SELECT name, category FROM vehicle_types ORDER BY category, name; 