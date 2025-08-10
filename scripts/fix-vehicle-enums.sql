-- Script para verificar y corregir valores enum en vehículos
-- Ejecutar en la base de datos de staging

-- 1. Verificar vehículos con valores problemáticos
SELECT 
    id, 
    brand, 
    model, 
    fuelType, 
    transmission, 
    status
FROM Vehicle 
WHERE fuelType = '' OR transmission = '' OR fuelType IS NULL OR transmission IS NULL;

-- 2. Corregir valores vacíos o NULL para fuelType
UPDATE Vehicle 
SET fuelType = 'GASOLINE' 
WHERE fuelType = '' OR fuelType IS NULL;

-- 3. Corregir valores vacíos o NULL para transmission
UPDATE Vehicle 
SET transmission = 'MANUAL' 
WHERE transmission = '' OR transmission IS NULL;

-- 4. Verificar que se corrigieron
SELECT 
    id, 
    brand, 
    model, 
    fuelType, 
    transmission, 
    status
FROM Vehicle 
WHERE fuelType = '' OR transmission = '' OR fuelType IS NULL OR transmission IS NULL;

-- 5. Verificar que todos los vehículos tienen valores válidos
SELECT 
    COUNT(*) as total_vehicles,
    COUNT(CASE WHEN fuelType IS NOT NULL AND fuelType != '' THEN 1 END) as valid_fuelType,
    COUNT(CASE WHEN transmission IS NOT NULL AND transmission != '' THEN 1 END) as valid_transmission
FROM Vehicle; 