-- Script para limpiar imágenes huérfanas en la base de datos
-- Ejecutar en la base de datos de staging

-- 1. Verificar imágenes que están en BD pero no existen físicamente
-- (Este es un script de diagnóstico, no de limpieza automática)

-- 2. Mostrar todas las imágenes en la BD
SELECT 
    vi.id,
    vi.filename,
    vi.path,
    vi.vehicleId,
    v.brand,
    v.model,
    vi.isPrimary,
    vi.createdAt
FROM vehicle_images vi
JOIN Vehicle v ON vi.vehicleId = v.id
ORDER BY vi.createdAt DESC;

-- 3. Mostrar imágenes duplicadas por vehículo
SELECT 
    vehicleId,
    COUNT(*) as total_images,
    COUNT(CASE WHEN isPrimary = 1 THEN 1 END) as primary_images,
    GROUP_CONCAT(filename ORDER BY createdAt) as filenames
FROM vehicle_images
GROUP BY vehicleId
HAVING COUNT(*) > 1 OR COUNT(CASE WHEN isPrimary = 1 THEN 1 END) > 1
ORDER BY total_images DESC;

-- 4. Mostrar vehículos sin imágenes
SELECT 
    v.id,
    v.brand,
    v.model,
    v.year,
    COUNT(vi.id) as image_count
FROM Vehicle v
LEFT JOIN vehicle_images vi ON v.id = vi.vehicleId
WHERE vi.id IS NULL
GROUP BY v.id, v.brand, v.model, v.year
ORDER BY v.createdAt DESC; 