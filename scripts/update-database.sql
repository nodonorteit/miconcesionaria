-- Script para actualizar la base de datos en el servidor
-- Ejecutar en MariaDB: mysql -u miconcesionaria -p miconcesionaria < update-database.sql

-- Agregar campo category a la tabla vehicle_types
ALTER TABLE vehicle_types 
ADD COLUMN category ENUM('AUTOMOTIVE', 'MOTORCYCLE', 'COMMERCIAL', 'AGRICULTURAL', 'MARINE', 'CONSTRUCTION', 'RECREATIONAL', 'SPECIALTY') 
DEFAULT 'AUTOMOTIVE' 
AFTER name;

-- Actualizar tipos existentes con categorías apropiadas
UPDATE vehicle_types SET category = 'AUTOMOTIVE' WHERE name IN ('Sedán', 'SUV', 'Camioneta', 'Hatchback', 'Pickup');
UPDATE vehicle_types SET category = 'MOTORCYCLE' WHERE name IN ('Moto', 'Scooter', 'Cuatriciclo');
UPDATE vehicle_types SET category = 'COMMERCIAL' WHERE name IN ('Camión', 'Furgón', 'Van Comercial');
UPDATE vehicle_types SET category = 'AGRICULTURAL' WHERE name IN ('Tractor', 'Cosechadora');
UPDATE vehicle_types SET category = 'MARINE' WHERE name IN ('Lancha', 'Yate', 'Moto de Agua');
UPDATE vehicle_types SET category = 'CONSTRUCTION' WHERE name IN ('Excavadora', 'Grúa');
UPDATE vehicle_types SET category = 'RECREATIONAL' WHERE name IN ('Caravana', 'Motorhome');

-- Verificar que se aplicaron los cambios
SELECT name, category FROM vehicle_types ORDER BY category, name; 