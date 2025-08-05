-- Script simple para poblar la base de datos
-- Basado en estructuras mínimas conocidas

-- ========================================
-- 1. LIMPIAR DATOS EXISTENTES
-- ========================================
DELETE FROM vehicle_images;
DELETE FROM Vehicle;
DELETE FROM vehicle_types;
DELETE FROM sales;
DELETE FROM cashflow;
DELETE FROM Client;
DELETE FROM providers;
DELETE FROM workshops;
DELETE FROM sellers;

-- ========================================
-- 2. TIPOS DE VEHÍCULOS
-- ========================================
INSERT INTO vehicle_types (id, name, description, isActive, createdAt, updatedAt) VALUES
('vt-sedan', 'Sedán', 'Automóvil de 4 puertas, 5 plazas', 1, NOW(), NOW()),
('vt-suv', 'SUV', 'Vehículo utilitario deportivo', 1, NOW(), NOW()),
('vt-pickup', 'Pickup', 'Camioneta de carga', 1, NOW(), NOW()),
('vt-hatchback', 'Hatchback', 'Automóvil compacto', 1, NOW(), NOW()),
('vt-camioneta', 'Camioneta', 'Vehículo comercial', 1, NOW(), NOW()),
('vt-moto', 'Motocicleta', 'Moto de dos ruedas', 1, NOW(), NOW()),
('vt-scooter', 'Scooter', 'Moto automática', 1, NOW(), NOW()),
('vt-cuatriciclo', 'Cuatriciclo', 'Vehículo todo terreno', 1, NOW(), NOW()),
('vt-furgon', 'Furgón', 'Vehículo comercial cerrado', 1, NOW(), NOW()),
('vt-camion', 'Camión', 'Vehículo de carga pesada', 1, NOW(), NOW()),
('vt-tractor', 'Tractor', 'Vehículo agrícola', 1, NOW(), NOW()),
('vt-cosechadora', 'Cosechadora', 'Máquina agrícola', 1, NOW(), NOW()),
('vt-lancha', 'Lancha', 'Embarcación recreativa', 1, NOW(), NOW()),
('vt-yate', 'Yate', 'Embarcación de lujo', 1, NOW(), NOW()),
('vt-excavadora', 'Excavadora', 'Máquina de construcción', 1, NOW(), NOW()),
('vt-grua', 'Grúa', 'Máquina de elevación', 1, NOW(), NOW()),
('vt-motorhome', 'Motorhome', 'Casa rodante', 1, NOW(), NOW()),
('vt-caravana', 'Caravana', 'Remolque habitable', 1, NOW(), NOW()),
('vt-ambulancia', 'Ambulancia', 'Vehículo de emergencia', 1, NOW(), NOW()),
('vt-bombero', 'Camión Bombero', 'Vehículo de emergencia', 1, NOW(), NOW());

-- ========================================
-- 3. CLIENTES
-- ========================================
INSERT INTO Client (id, email, phone, address, city, state, zipCode, isActive, createdAt, updatedAt) VALUES
('cl-001', 'juan.perez@email.com', '+54 11 1111-1111', 'Av. Corrientes 1000', 'Buenos Aires', 'CABA', '1043', 1, NOW(), NOW()),
('cl-002', 'maria.garcia@email.com', '+54 11 2222-2222', 'Belgrano 500', 'Buenos Aires', 'CABA', '1425', 1, NOW(), NOW()),
('cl-003', 'carlos.lopez@email.com', '+54 11 3333-3333', 'Palermo 1500', 'Buenos Aires', 'CABA', '1414', 1, NOW(), NOW()),
('cl-004', 'ana.martinez@email.com', '+54 11 4444-4444', 'Villa Crespo 800', 'Buenos Aires', 'CABA', '1415', 1, NOW(), NOW()),
('cl-005', 'roberto.silva@email.com', '+54 11 5555-5555', 'Puerto Madero 300', 'Buenos Aires', 'CABA', '1107', 1, NOW(), NOW()),
('cl-006', 'sofia.torres@email.com', '+54 11 6666-6666', 'Ruta 7 Km 100', 'Luján', 'Buenos Aires', '6700', 1, NOW(), NOW()),
('cl-007', 'miguel.fernandez@email.com', '+54 11 7777-7777', 'Av. Industrial 2000', 'Pilar', 'Buenos Aires', '1629', 1, NOW(), NOW()),
('cl-008', 'laura.morales@email.com', '+54 11 8888-8888', 'Av. General Paz 3000', 'San Miguel', 'Buenos Aires', '1663', 1, NOW(), NOW()),
('cl-009', 'diego.ruiz@email.com', '+54 11 9999-9999', 'Ruta 9 Km 50', 'Escobar', 'Buenos Aires', '1625', 1, NOW(), NOW()),
('cl-010', 'carolina.gomez@email.com', '+54 11 0000-0000', 'Av. San Martín 1500', 'Vicente López', 'Buenos Aires', '1638', 1, NOW(), NOW());

-- ========================================
-- 4. PROVEEDORES
-- ========================================
INSERT INTO providers (id, email, phone, address, isActive, createdAt, updatedAt) VALUES
('prov-001', 'info@autoparts.com', '+54 11 1111-1111', 'Av. Industrial 1000, Pilar', 1, NOW(), NOW()),
('prov-002', 'ventas@motorsport.com', '+54 11 2222-2222', 'Ruta 9 Km 50, Escobar', 1, NOW(), NOW()),
('prov-003', 'contact@cardealer.com', '+54 11 3333-3333', 'Av. Libertador 2000, San Isidro', 1, NOW(), NOW()),
('prov-004', 'info@vehiclesolutions.com', '+54 11 4444-4444', 'Ruta 8 Km 30, Moreno', 1, NOW(), NOW()),
('prov-005', 'sales@premiummotors.com', '+54 11 5555-5555', 'Av. San Martín 1500, Vicente López', 1, NOW(), NOW()),
('prov-006', 'info@marineequipment.com', '+54 11 6666-6666', 'Puerto Madero 500, CABA', 1, NOW(), NOW()),
('prov-007', 'ventas@agmachinery.com', '+54 11 7777-7777', 'Ruta 7 Km 80, Luján', 1, NOW(), NOW()),
('prov-008', 'contact@constequipment.com', '+54 11 8888-8888', 'Av. General Paz 3000, San Miguel', 1, NOW(), NOW());

-- ========================================
-- 5. TALLERES
-- ========================================
INSERT INTO workshops (id, email, phone, address, isActive, createdAt, updatedAt) VALUES
('ws-001', 'info@tallercentral.com', '+54 11 1111-0001', 'Av. Corrientes 2000, CABA', 1, NOW(), NOW()),
('ws-002', 'contact@autoservice.com', '+54 11 2222-0002', 'Belgrano 1000, CABA', 1, NOW(), NOW()),
('ws-003', 'bmw@tallerbmw.com', '+54 11 3333-0003', 'Palermo 1500, CABA', 1, NOW(), NOW()),
('ws-004', 'info@mototaller.com', '+54 11 4444-0004', 'Villa Crespo 800, CABA', 1, NOW(), NOW()),
('ws-005', 'naval@tallernaval.com', '+54 11 5555-0005', 'Puerto Madero 300, CABA', 1, NOW(), NOW()),
('ws-006', 'campo@talleragricola.com', '+54 11 6666-0006', 'Ruta 7 Km 100, Luján', 1, NOW(), NOW()),
('ws-007', 'pesada@tallermaquinaria.com', '+54 11 7777-0007', 'Av. Industrial 2000, Pilar', 1, NOW(), NOW());

-- ========================================
-- 6. VENDEDORES
-- ========================================
INSERT INTO sellers (id, email, phone, commissionRate, isActive, createdAt, updatedAt) VALUES
('sel-001', 'alejandro@miconcesionaria.com', '+54 11 1111-1111', 5.0, 1, NOW(), NOW()),
('sel-002', 'mariana@miconcesionaria.com', '+54 11 2222-2222', 4.5, 1, NOW(), NOW()),
('sel-003', 'carlos@miconcesionaria.com', '+54 11 3333-3333', 6.0, 1, NOW(), NOW()),
('sel-004', 'laura@miconcesionaria.com', '+54 11 4444-4444', 5.5, 1, NOW(), NOW()),
('sel-005', 'roberto@miconcesionaria.com', '+54 11 5555-5555', 4.0, 1, NOW(), NOW()),
('sel-006', 'sofia@miconcesionaria.com', '+54 11 6666-6666', 5.5, 1, NOW(), NOW()),
('sel-007', 'miguel@miconcesionaria.com', '+54 11 7777-7777', 6.5, 1, NOW(), NOW()),
('sel-008', 'ana@miconcesionaria.com', '+54 11 8888-8888', 4.5, 1, NOW(), NOW());

-- ========================================
-- 7. VEHÍCULOS
-- ========================================
INSERT INTO Vehicle (id, brand, model, year, color, mileage, price, description, vin, licensePlate, fuelType, transmission, status, isActive, createdAt, updatedAt, vehicleTypeId) VALUES
-- AUTOMOTIVE
('vh-001', 'Toyota', 'Corolla', 2022, 'Blanco', 15000, 25000.00, 'Excelente estado, único dueño', '1HGBH41JXMN109186', 'ABC123', 'GASOLINE', 'AUTOMATIC', 'AVAILABLE', 1, NOW(), NOW(), 'vt-sedan'),
('vh-002', 'Honda', 'CR-V', 2021, 'Negro', 25000, 32000.00, 'SUV familiar, muy espaciosa', '2T1BURHE0JC123456', 'DEF456', 'GASOLINE', 'AUTOMATIC', 'AVAILABLE', 1, NOW(), NOW(), 'vt-suv'),
('vh-003', 'Ford', 'Ranger', 2020, 'Gris', 45000, 28000.00, 'Pickup 4x4, ideal para trabajo', '3VWDX7AJ5DM123456', 'GHI789', 'DIESEL', 'MANUAL', 'AVAILABLE', 1, NOW(), NOW(), 'vt-pickup'),
('vh-004', 'Volkswagen', 'Golf', 2023, 'Azul', 8000, 22000.00, 'Hatchback deportivo, muy económico', 'WVWZZZ1KZ3W123456', 'JKL012', 'GASOLINE', 'MANUAL', 'AVAILABLE', 1, NOW(), NOW(), 'vt-hatchback'),
('vh-005', 'Chevrolet', 'S10', 2019, 'Rojo', 60000, 18000.00, 'Camioneta confiable, buen precio', '1GCCS14X6MT123456', 'MNO345', 'DIESEL', 'MANUAL', 'AVAILABLE', 1, NOW(), NOW(), 'vt-camioneta'),

-- MOTORCYCLE
('vh-006', 'Honda', 'CBR 600RR', 2021, 'Rojo', 12000, 8500.00, 'Moto deportiva, excelente rendimiento', 'MLHPC3000M123456', 'PQR678', 'GASOLINE', 'MANUAL', 'AVAILABLE', 1, NOW(), NOW(), 'vt-moto'),
('vh-007', 'Yamaha', 'T-Max', 2022, 'Negro', 8000, 12000.00, 'Scooter premium, muy cómoda', 'YAMAHA123456789', 'STU901', 'GASOLINE', 'AUTOMATIC', 'AVAILABLE', 1, NOW(), NOW(), 'vt-scooter'),
('vh-008', 'Polaris', 'Sportsman 850', 2020, 'Verde', 3000, 15000.00, 'Cuatriciclo todoterreno', 'POLARIS123456', 'VWX234', 'GASOLINE', 'AUTOMATIC', 'AVAILABLE', 1, NOW(), NOW(), 'vt-cuatriciclo'),

-- COMMERCIAL
('vh-009', 'Mercedes-Benz', 'Sprinter', 2019, 'Blanco', 80000, 35000.00, 'Furgón comercial, muy espacioso', 'WDB906613123456', 'YZA567', 'DIESEL', 'MANUAL', 'AVAILABLE', 1, NOW(), NOW(), 'vt-furgon'),
('vh-010', 'Iveco', 'Daily', 2018, 'Azul', 120000, 28000.00, 'Camión de carga, muy resistente', 'IVECO123456789', 'BCD890', 'DIESEL', 'MANUAL', 'AVAILABLE', 1, NOW(), NOW(), 'vt-camion'),

-- AGRICULTURAL
('vh-011', 'John Deere', '5075E', 2020, 'Verde', 2000, 45000.00, 'Tractor agrícola, muy eficiente', 'JD123456789', 'EFG123', 'DIESEL', 'MANUAL', 'AVAILABLE', 1, NOW(), NOW(), 'vt-tractor'),
('vh-012', 'New Holland', 'CR9.80', 2019, 'Azul', 1500, 120000.00, 'Cosechadora de alta tecnología', 'NH123456789', 'HIJ456', 'DIESEL', 'AUTOMATIC', 'AVAILABLE', 1, NOW(), NOW(), 'vt-cosechadora'),

-- MARINE
('vh-013', 'Bayliner', 'Element 7', 2021, 'Blanco', 200, 25000.00, 'Lancha recreativa, muy estable', 'BL123456789', 'KLM789', 'GASOLINE', 'MANUAL', 'AVAILABLE', 1, NOW(), NOW(), 'vt-lancha'),
('vh-014', 'Sea Ray', 'Sundancer 350', 2020, 'Azul', 150, 85000.00, 'Yate de lujo, muy confortable', 'SR123456789', 'NOP012', 'DIESEL', 'AUTOMATIC', 'AVAILABLE', 1, NOW(), NOW(), 'vt-yate'),

-- CONSTRUCTION
('vh-015', 'Caterpillar', '320D', 2018, 'Amarillo', 5000, 65000.00, 'Excavadora hidráulica, muy potente', 'CAT123456789', 'QRS345', 'DIESEL', 'HYDRAULIC', 'AVAILABLE', 1, NOW(), NOW(), 'vt-excavadora'),
('vh-016', 'Liebherr', 'LTM 1100-4.2', 2019, 'Amarillo', 3000, 180000.00, 'Grúa telescópica, muy versátil', 'LIE123456789', 'TUV678', 'DIESEL', 'HYDRAULIC', 'AVAILABLE', 1, NOW(), NOW(), 'vt-grua'),

-- RECREATIONAL
('vh-017', 'Winnebago', 'Travato', 2021, 'Blanco', 15000, 75000.00, 'Motorhome compacto, muy práctico', 'WIN123456789', 'WXY901', 'GASOLINE', 'AUTOMATIC', 'AVAILABLE', 1, NOW(), NOW(), 'vt-motorhome'),
('vh-018', 'Airstream', 'Flying Cloud', 2020, 'Plateado', 5000, 45000.00, 'Caravana clásica, muy elegante', 'AIR123456789', 'ZAB234', 'N/A', 'N/A', 'AVAILABLE', 1, NOW(), NOW(), 'vt-caravana'),

-- SPECIALTY
('vh-019', 'Mercedes-Benz', 'Sprinter Ambulancia', 2021, 'Blanco', 30000, 85000.00, 'Ambulancia equipada, lista para usar', 'MBS123456789', 'CDE567', 'DIESEL', 'AUTOMATIC', 'AVAILABLE', 1, NOW(), NOW(), 'vt-ambulancia'),
('vh-020', 'Iveco', 'Daily Bombero', 2020, 'Rojo', 25000, 120000.00, 'Camión bombero, completamente equipado', 'IVB123456789', 'FGH890', 'DIESEL', 'MANUAL', 'AVAILABLE', 1, NOW(), NOW(), 'vt-bombero');

-- ========================================
-- 8. VENTAS
-- ========================================
INSERT INTO sales (id, saleNumber, vehicleId, customerId, sellerId, userId, saleDate, totalAmount, commission, status, notes, createdAt, updatedAt) VALUES
('sale-001', 'V-2024-001', 'vh-001', 'cl-001', 'sel-001', 'admin-2', DATE_SUB(NOW(), INTERVAL 30 DAY), 25000.00, 1250.00, 'COMPLETED', 'Venta Toyota Corolla', NOW(), NOW()),
('sale-002', 'V-2024-002', 'vh-006', 'cl-002', 'sel-002', 'admin-2', DATE_SUB(NOW(), INTERVAL 25 DAY), 8500.00, 382.50, 'COMPLETED', 'Venta Honda CBR 600RR', NOW(), NOW()),
('sale-003', 'V-2024-003', 'vh-013', 'cl-003', 'sel-003', 'admin-2', DATE_SUB(NOW(), INTERVAL 20 DAY), 25000.00, 1375.00, 'COMPLETED', 'Venta Bayliner Element 7', NOW(), NOW()),
('sale-004', 'V-2024-004', 'vh-011', 'cl-004', 'sel-005', 'admin-2', DATE_SUB(NOW(), INTERVAL 15 DAY), 45000.00, 1800.00, 'COMPLETED', 'Venta John Deere 5075E', NOW(), NOW()),
('sale-005', 'V-2024-005', 'vh-017', 'cl-005', 'sel-005', 'admin-2', DATE_SUB(NOW(), INTERVAL 10 DAY), 75000.00, 4500.00, 'COMPLETED', 'Venta Winnebago Travato', NOW(), NOW()),
('sale-006', 'V-2024-006', 'vh-019', 'cl-006', 'sel-006', 'admin-2', DATE_SUB(NOW(), INTERVAL 5 DAY), 85000.00, 4080.00, 'COMPLETED', 'Venta Mercedes Sprinter Ambulancia', NOW(), NOW()),
('sale-007', 'V-2024-007', 'vh-003', 'cl-007', 'sel-007', 'admin-2', DATE_SUB(NOW(), INTERVAL 2 DAY), 28000.00, 1456.00, 'COMPLETED', 'Venta Ford Ranger', NOW(), NOW());

-- Actualizar estado de vehículos vendidos
UPDATE Vehicle SET status = 'SOLD' WHERE id IN ('vh-001', 'vh-006', 'vh-013', 'vh-011', 'vh-017', 'vh-019', 'vh-003');

-- ========================================
-- 9. FLUJO DE CAJA
-- ========================================
INSERT INTO cashflow (id, type, amount, description, category, receiptPath, isActive, createdAt, updatedAt) VALUES
-- INGRESOS
('cf-001', 'INCOME', 25000.00, 'Venta Toyota Corolla 2022', 'SALES', NULL, 1, DATE_SUB(NOW(), INTERVAL 30 DAY), NOW()),
('cf-002', 'INCOME', 8500.00, 'Venta Honda CBR 600RR', 'SALES', NULL, 1, DATE_SUB(NOW(), INTERVAL 25 DAY), NOW()),
('cf-003', 'INCOME', 25000.00, 'Venta Bayliner Element 7', 'SALES', NULL, 1, DATE_SUB(NOW(), INTERVAL 20 DAY), NOW()),
('cf-004', 'INCOME', 45000.00, 'Venta John Deere 5075E', 'SALES', NULL, 1, DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
('cf-005', 'INCOME', 75000.00, 'Venta Winnebago Travato', 'SALES', NULL, 1, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
('cf-006', 'INCOME', 85000.00, 'Venta Mercedes Sprinter Ambulancia', 'SALES', NULL, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
('cf-007', 'INCOME', 28000.00, 'Venta Ford Ranger', 'SALES', NULL, 1, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),

-- EGRESOS
('cf-008', 'EXPENSE', -15000.00, 'Compra Toyota Corolla', 'PURCHASE', NULL, 1, DATE_SUB(NOW(), INTERVAL 35 DAY), NOW()),
('cf-009', 'EXPENSE', -6000.00, 'Compra Honda CBR 600RR', 'PURCHASE', NULL, 1, DATE_SUB(NOW(), INTERVAL 30 DAY), NOW()),
('cf-010', 'EXPENSE', -18000.00, 'Compra Bayliner Element 7', 'PURCHASE', NULL, 1, DATE_SUB(NOW(), INTERVAL 25 DAY), NOW()),
('cf-011', 'EXPENSE', -32000.00, 'Compra John Deere 5075E', 'PURCHASE', NULL, 1, DATE_SUB(NOW(), INTERVAL 20 DAY), NOW()),
('cf-012', 'EXPENSE', -55000.00, 'Compra Winnebago Travato', 'PURCHASE', NULL, 1, DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
('cf-013', 'EXPENSE', -65000.00, 'Compra Mercedes Sprinter Ambulancia', 'PURCHASE', NULL, 1, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
('cf-014', 'EXPENSE', -20000.00, 'Compra Ford Ranger', 'PURCHASE', NULL, 1, DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
('cf-015', 'EXPENSE', -5000.00, 'Mantenimiento taller', 'MAINTENANCE', NULL, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
('cf-016', 'EXPENSE', -3000.00, 'Gastos administrativos', 'ADMINISTRATIVE', NULL, 1, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
('cf-017', 'EXPENSE', -2000.00, 'Publicidad y marketing', 'MARKETING', NULL, 1, NOW(), NOW());

-- ========================================
-- 10. IMÁGENES DE VEHÍCULOS (SIMULADAS)
-- ========================================
INSERT INTO vehicle_images (id, filename, path, isPrimary, createdAt, vehicleId) VALUES
('img-001', 'toyota-corolla-1.jpg', '/uploads/toyota-corolla-1.jpg', 1, NOW(), 'vh-001'),
('img-002', 'toyota-corolla-2.jpg', '/uploads/toyota-corolla-2.jpg', 0, NOW(), 'vh-001'),
('img-003', 'honda-crv-1.jpg', '/uploads/honda-crv-1.jpg', 1, NOW(), 'vh-002'),
('img-004', 'ford-ranger-1.jpg', '/uploads/ford-ranger-1.jpg', 1, NOW(), 'vh-003'),
('img-005', 'volkswagen-golf-1.jpg', '/uploads/volkswagen-golf-1.jpg', 1, NOW(), 'vh-004'),
('img-006', 'chevrolet-s10-1.jpg', '/uploads/chevrolet-s10-1.jpg', 1, NOW(), 'vh-005'),
('img-007', 'honda-cbr-1.jpg', '/uploads/honda-cbr-1.jpg', 1, NOW(), 'vh-006'),
('img-008', 'yamaha-tmax-1.jpg', '/uploads/yamaha-tmax-1.jpg', 1, NOW(), 'vh-007'),
('img-009', 'polaris-sportsman-1.jpg', '/uploads/polaris-sportsman-1.jpg', 1, NOW(), 'vh-008'),
('img-010', 'mercedes-sprinter-1.jpg', '/uploads/mercedes-sprinter-1.jpg', 1, NOW(), 'vh-009'),
('img-011', 'iveco-daily-1.jpg', '/uploads/iveco-daily-1.jpg', 1, NOW(), 'vh-010'),
('img-012', 'john-deere-1.jpg', '/uploads/john-deere-1.jpg', 1, NOW(), 'vh-011'),
('img-013', 'bayliner-element-1.jpg', '/uploads/bayliner-element-1.jpg', 1, NOW(), 'vh-013');

-- ========================================
-- 11. RESUMEN FINAL
-- ========================================
SELECT 'POBLACIÓN COMPLETADA' as info;
SELECT 'Tipos de vehículos:' as tipo, COUNT(*) as cantidad FROM vehicle_types;
SELECT 'Clientes:' as tipo, COUNT(*) as cantidad FROM Client;
SELECT 'Proveedores:' as tipo, COUNT(*) as cantidad FROM providers;
SELECT 'Talleres:' as tipo, COUNT(*) as cantidad FROM workshops;
SELECT 'Vendedores:' as tipo, COUNT(*) as cantidad FROM sellers;
SELECT 'Vehículos:' as tipo, COUNT(*) as cantidad FROM Vehicle;
SELECT 'Ventas:' as tipo, COUNT(*) as cantidad FROM sales;
SELECT 'Flujo de caja:' as tipo, COUNT(*) as cantidad FROM cashflow;
SELECT 'Imágenes:' as tipo, COUNT(*) as cantidad FROM vehicle_images; 