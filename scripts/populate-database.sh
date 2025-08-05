#!/bin/bash

# Script para poblar la base de datos con datos ficticios
echo "🎯 Poblando base de datos con datos de prueba..."
echo "================================================"

# Ejecutar script SQL para poblar la base de datos
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria << 'EOF'

-- ========================================
-- POBLAR BASE DE DATOS CON DATOS FICTICIOS
-- ========================================

-- Limpiar datos existentes (mantener admin user)
-- Usar DELETE con verificación de existencia de tabla
SET @sql = 'DELETE FROM vehicle_images';
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = 'DELETE FROM Vehicle';
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = 'DELETE FROM vehicle_types';
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = 'DELETE FROM sales';
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = 'DELETE FROM cashflow';
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = 'DELETE FROM Client';
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = 'DELETE FROM Provider';
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = 'DELETE FROM Workshop';
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = 'DELETE FROM Seller';
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- 1. TIPOS DE VEHÍCULOS
-- ========================================
INSERT INTO vehicle_types (id, name, category, description, isActive, createdAt, updatedAt) VALUES
-- AUTOMOTIVE
('vt-sedan', 'Sedán', 'AUTOMOTIVE', 'Vehículo de pasajeros con 4 puertas', 1, NOW(), NOW()),
('vt-suv', 'SUV', 'AUTOMOTIVE', 'Vehículo utilitario deportivo', 1, NOW(), NOW()),
('vt-camioneta', 'Camioneta', 'AUTOMOTIVE', 'Vehículo de carga ligera', 1, NOW(), NOW()),
('vt-hatchback', 'Hatchback', 'AUTOMOTIVE', 'Vehículo compacto con portón trasero', 1, NOW(), NOW()),
('vt-pickup', 'Pickup', 'AUTOMOTIVE', 'Camioneta con caja de carga', 1, NOW(), NOW()),
('vt-coupe', 'Coupé', 'AUTOMOTIVE', 'Vehículo deportivo de 2 puertas', 1, NOW(), NOW()),
('vt-wagon', 'Wagon', 'AUTOMOTIVE', 'Vehículo familiar con maletero extendido', 1, NOW(), NOW()),

-- MOTORCYCLE
('vt-moto', 'Moto', 'MOTORCYCLE', 'Motocicleta de dos ruedas', 1, NOW(), NOW()),
('vt-scooter', 'Scooter', 'MOTORCYCLE', 'Motocicleta urbana con plataforma', 1, NOW(), NOW()),
('vt-cuatriciclo', 'Cuatriciclo', 'MOTORCYCLE', 'Vehículo todo terreno de 4 ruedas', 1, NOW(), NOW()),
('vt-enduro', 'Enduro', 'MOTORCYCLE', 'Motocicleta todoterreno', 1, NOW(), NOW()),
('vt-custom', 'Custom', 'MOTORCYCLE', 'Motocicleta personalizada', 1, NOW(), NOW()),

-- COMMERCIAL
('vt-camion', 'Camión', 'COMMERCIAL', 'Vehículo de carga pesada', 1, NOW(), NOW()),
('vt-furgon', 'Furgón', 'COMMERCIAL', 'Vehículo de carga cerrado', 1, NOW(), NOW()),
('vt-van', 'Van Comercial', 'COMMERCIAL', 'Furgoneta para uso comercial', 1, NOW(), NOW()),
('vt-microbus', 'Microbús', 'COMMERCIAL', 'Vehículo de transporte de pasajeros', 1, NOW(), NOW()),

-- AGRICULTURAL
('vt-tractor', 'Tractor', 'AGRICULTURAL', 'Maquinaria agrícola', 1, NOW(), NOW()),
('vt-cosechadora', 'Cosechadora', 'AGRICULTURAL', 'Maquinaria para cosecha', 1, NOW(), NOW()),
('vt-pulverizadora', 'Pulverizadora', 'AGRICULTURAL', 'Maquinaria para fumigación', 1, NOW(), NOW()),

-- MARINE
('vt-lancha', 'Lancha', 'MARINE', 'Embarcación recreativa', 1, NOW(), NOW()),
('vt-yate', 'Yate', 'MARINE', 'Embarcación de lujo', 1, NOW(), NOW()),
('vt-moto-agua', 'Moto de Agua', 'MARINE', 'Vehículo acuático recreativo', 1, NOW(), NOW()),
('vt-velero', 'Velero', 'MARINE', 'Embarcación a vela', 1, NOW(), NOW()),

-- CONSTRUCTION
('vt-excavadora', 'Excavadora', 'CONSTRUCTION', 'Maquinaria de construcción', 1, NOW(), NOW()),
('vt-grua', 'Grúa', 'CONSTRUCTION', 'Maquinaria para elevación', 1, NOW(), NOW()),
('vt-retroexcavadora', 'Retroexcavadora', 'CONSTRUCTION', 'Maquinaria mixta', 1, NOW(), NOW()),

-- RECREATIONAL
('vt-caravana', 'Caravana', 'RECREATIONAL', 'Vehículo recreativo remolcable', 1, NOW(), NOW()),
('vt-motorhome', 'Motorhome', 'RECREATIONAL', 'Vehículo recreativo autopropulsado', 1, NOW(), NOW()),
('vt-trailer', 'Trailer', 'RECREATIONAL', 'Remolque recreativo', 1, NOW(), NOW()),

-- SPECIALTY
('vt-ambulancia', 'Ambulancia', 'SPECIALTY', 'Vehículo de emergencia médica', 1, NOW(), NOW()),
('vt-bombero', 'Camión Bombero', 'SPECIALTY', 'Vehículo de emergencia', 1, NOW(), NOW()),
('vt-policia', 'Patrullero', 'SPECIALTY', 'Vehículo policial', 1, NOW(), NOW());

-- ========================================
-- 2. CLIENTES
-- ========================================
INSERT INTO Client (id, name, email, phone, address, taxId, isActive, createdAt, updatedAt) VALUES
('cl-001', 'Juan Pérez', 'juan.perez@email.com', '+54 11 1234-5678', 'Av. Corrientes 1234, CABA', '20-12345678-9', 1, NOW(), NOW()),
('cl-002', 'María González', 'maria.gonzalez@email.com', '+54 11 2345-6789', 'Belgrano 567, CABA', '27-23456789-0', 1, NOW(), NOW()),
('cl-003', 'Carlos Rodríguez', 'carlos.rodriguez@email.com', '+54 11 3456-7890', 'Palermo 890, CABA', '20-34567890-1', 1, NOW(), NOW()),
('cl-004', 'Ana Martínez', 'ana.martinez@email.com', '+54 11 4567-8901', 'Recoleta 234, CABA', '27-45678901-2', 1, NOW(), NOW()),
('cl-005', 'Luis Fernández', 'luis.fernandez@email.com', '+54 11 5678-9012', 'San Telmo 456, CABA', '20-56789012-3', 1, NOW(), NOW()),
('cl-006', 'Sofía López', 'sofia.lopez@email.com', '+54 11 6789-0123', 'Villa Crespo 789, CABA', '27-67890123-4', 1, NOW(), NOW()),
('cl-007', 'Roberto Silva', 'roberto.silva@email.com', '+54 11 7890-1234', 'Caballito 123, CABA', '20-78901234-5', 1, NOW(), NOW()),
('cl-008', 'Carmen Ruiz', 'carmen.ruiz@email.com', '+54 11 8901-2345', 'Almagro 567, CABA', '27-89012345-6', 1, NOW(), NOW()),
('cl-009', 'Diego Morales', 'diego.morales@email.com', '+54 11 9012-3456', 'Villa del Parque 890, CABA', '20-90123456-7', 1, NOW(), NOW()),
('cl-010', 'Laura Torres', 'laura.torres@email.com', '+54 11 0123-4567', 'Villa Devoto 234, CABA', '27-01234567-8', 1, NOW(), NOW());

-- ========================================
-- 3. PROVEEDORES
-- ========================================
INSERT INTO Provider (id, name, email, phone, address, taxId, contactPerson, isActive, createdAt, updatedAt) VALUES
('prov-001', 'AutoParts S.A.', 'info@autoparts.com', '+54 11 1111-1111', 'Av. Industrial 1000, Pilar', '30-11111111-1', 'Roberto García', 1, NOW(), NOW()),
('prov-002', 'MotorSport Import', 'ventas@motorsport.com', '+54 11 2222-2222', 'Ruta 9 Km 50, Escobar', '30-22222222-2', 'María López', 1, NOW(), NOW()),
('prov-003', 'CarDealer Group', 'contact@cardealer.com', '+54 11 3333-3333', 'Av. Libertador 2000, San Isidro', '30-33333333-3', 'Carlos Ruiz', 1, NOW(), NOW()),
('prov-004', 'Vehicle Solutions', 'info@vehiclesolutions.com', '+54 11 4444-4444', 'Ruta 8 Km 30, Moreno', '30-44444444-4', 'Ana Martínez', 1, NOW(), NOW()),
('prov-005', 'Premium Motors', 'sales@premiummotors.com', '+54 11 5555-5555', 'Av. San Martín 1500, Vicente López', '30-55555555-5', 'Luis Fernández', 1, NOW(), NOW()),
('prov-006', 'Marine Equipment', 'info@marineequipment.com', '+54 11 6666-6666', 'Puerto Madero 500, CABA', '30-66666666-6', 'Sofía Torres', 1, NOW(), NOW()),
('prov-007', 'Agricultural Machinery', 'ventas@agmachinery.com', '+54 11 7777-7777', 'Ruta 7 Km 80, Luján', '30-77777777-7', 'Roberto Silva', 1, NOW(), NOW()),
('prov-008', 'Construction Equipment', 'contact@constequipment.com', '+54 11 8888-8888', 'Av. General Paz 3000, San Miguel', '30-88888888-8', 'Carmen Morales', 1, NOW(), NOW());

-- ========================================
-- 4. TALLERES
-- ========================================
INSERT INTO Workshop (id, name, email, phone, address, taxId, contactPerson, specialties, isActive, createdAt, updatedAt) VALUES
('ws-001', 'Taller Mecánico Central', 'info@tallercentral.com', '+54 11 1111-0001', 'Av. Corrientes 2000, CABA', '30-11111111-1', 'Miguel Ángel', 'Mecánica general, Electricidad', 1, NOW(), NOW()),
('ws-002', 'Auto Service Premium', 'contact@autoservice.com', '+54 11 2222-0002', 'Belgrano 1000, CABA', '30-22222222-2', 'Roberto Carlos', 'Diagnóstico computarizado, Suspensión', 1, NOW(), NOW()),
('ws-003', 'Taller Especializado BMW', 'bmw@tallerbmw.com', '+54 11 3333-0003', 'Palermo 1500, CABA', '30-33333333-3', 'Juan Pablo', 'BMW, Mercedes, Audi', 1, NOW(), NOW()),
('ws-004', 'Moto Taller Express', 'info@mototaller.com', '+54 11 4444-0004', 'Villa Crespo 800, CABA', '30-44444444-4', 'Carlos Moto', 'Motocicletas, Scooters', 1, NOW(), NOW()),
('ws-005', 'Taller Naval Marina', 'naval@tallernaval.com', '+54 11 5555-0005', 'Puerto Madero 300, CABA', '30-55555555-5', 'Marino López', 'Embarcaciones, Motores marinos', 1, NOW(), NOW()),
('ws-006', 'Taller Agrícola Campo', 'campo@talleragricola.com', '+54 11 6666-0006', 'Ruta 7 Km 100, Luján', '30-66666666-6', 'Campo Verde', 'Tractores, Cosechadoras', 1, NOW(), NOW()),
('ws-007', 'Taller Maquinaria Pesada', 'pesada@tallermaquinaria.com', '+54 11 7777-0007', 'Av. Industrial 2000, Pilar', '30-77777777-7', 'Peso Pesado', 'Excavadoras, Grúas, Retroexcavadoras', 1, NOW(), NOW());

-- ========================================
-- 5. VENDEDORES
-- ========================================
INSERT INTO Seller (id, name, email, phone, commissionRate, isActive, createdAt, updatedAt) VALUES
('sel-001', 'Alejandro Vendedor', 'alejandro@miconcesionaria.com', '+54 11 1111-1111', 5.0, 1, NOW(), NOW()),
('sel-002', 'Mariana Comercial', 'mariana@miconcesionaria.com', '+54 11 2222-2222', 4.5, 1, NOW(), NOW()),
('sel-003', 'Diego Ventas', 'diego@miconcesionaria.com', '+54 11 3333-3333', 5.5, 1, NOW(), NOW()),
('sel-004', 'Carolina Negocios', 'carolina@miconcesionaria.com', '+54 11 4444-4444', 4.0, 1, NOW(), NOW()),
('sel-005', 'Roberto Comercial', 'roberto@miconcesionaria.com', '+54 11 5555-5555', 6.0, 1, NOW(), NOW()),
('sel-006', 'Sofía Ventas', 'sofia@miconcesionaria.com', '+54 11 6666-6666', 4.8, 1, NOW(), NOW()),
('sel-007', 'Luis Negociador', 'luis@miconcesionaria.com', '+54 11 7777-7777', 5.2, 1, NOW(), NOW()),
('sel-008', 'Ana Comercial', 'ana@miconcesionaria.com', '+54 11 8888-8888', 4.3, 1, NOW(), NOW());

-- ========================================
-- 6. VEHÍCULOS
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
-- 7. VENTAS
-- ========================================
INSERT INTO sales (id, saleNumber, vehicleId, customerId, sellerId, saleDate, salePrice, commission, status, isActive, createdAt, updatedAt) VALUES
('sale-001', 'V-2024-001', 'vh-001', 'cl-001', 'sel-001', DATE_SUB(NOW(), INTERVAL 30 DAY), 25000.00, 1250.00, 'COMPLETED', 1, NOW(), NOW()),
('sale-002', 'V-2024-002', 'vh-006', 'cl-002', 'sel-002', DATE_SUB(NOW(), INTERVAL 25 DAY), 8500.00, 382.50, 'COMPLETED', 1, NOW(), NOW()),
('sale-003', 'V-2024-003', 'vh-013', 'cl-003', 'sel-003', DATE_SUB(NOW(), INTERVAL 20 DAY), 25000.00, 1375.00, 'COMPLETED', 1, NOW(), NOW()),
('sale-004', 'V-2024-004', 'vh-011', 'cl-004', 'sel-004', DATE_SUB(NOW(), INTERVAL 15 DAY), 45000.00, 1800.00, 'COMPLETED', 1, NOW(), NOW()),
('sale-005', 'V-2024-005', 'vh-017', 'cl-005', 'sel-005', DATE_SUB(NOW(), INTERVAL 10 DAY), 75000.00, 4500.00, 'COMPLETED', 1, NOW(), NOW()),
('sale-006', 'V-2024-006', 'vh-019', 'cl-006', 'sel-006', DATE_SUB(NOW(), INTERVAL 5 DAY), 85000.00, 4080.00, 'COMPLETED', 1, NOW(), NOW()),
('sale-007', 'V-2024-007', 'vh-003', 'cl-007', 'sel-007', DATE_SUB(NOW(), INTERVAL 2 DAY), 28000.00, 1456.00, 'COMPLETED', 1, NOW(), NOW());

-- Actualizar estado de vehículos vendidos
UPDATE Vehicle SET status = 'SOLD' WHERE id IN ('vh-001', 'vh-006', 'vh-013', 'vh-011', 'vh-017', 'vh-019', 'vh-003');

-- ========================================
-- 8. FLUJO DE CAJA
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
-- 9. IMÁGENES DE VEHÍCULOS (SIMULADAS)
-- ========================================
INSERT INTO vehicle_images (id, filename, path, isPrimary, createdAt, vehicleId) VALUES
-- Toyota Corolla
('img-001', 'toyota_corolla_1.jpg', '/uploads/toyota_corolla_1.jpg', 1, NOW(), 'vh-001'),
('img-002', 'toyota_corolla_2.jpg', '/uploads/toyota_corolla_2.jpg', 0, NOW(), 'vh-001'),
('img-003', 'toyota_corolla_3.jpg', '/uploads/toyota_corolla_3.jpg', 0, NOW(), 'vh-001'),

-- Honda CR-V
('img-004', 'honda_crv_1.jpg', '/uploads/honda_crv_1.jpg', 1, NOW(), 'vh-002'),
('img-005', 'honda_crv_2.jpg', '/uploads/honda_crv_2.jpg', 0, NOW(), 'vh-002'),
('img-006', 'honda_crv_3.jpg', '/uploads/honda_crv_3.jpg', 0, NOW(), 'vh-002'),

-- Ford Ranger
('img-007', 'ford_ranger_1.jpg', '/uploads/ford_ranger_1.jpg', 1, NOW(), 'vh-003'),
('img-008', 'ford_ranger_2.jpg', '/uploads/ford_ranger_2.jpg', 0, NOW(), 'vh-003'),

-- Honda CBR
('img-009', 'honda_cbr_1.jpg', '/uploads/honda_cbr_1.jpg', 1, NOW(), 'vh-006'),
('img-010', 'honda_cbr_2.jpg', '/uploads/honda_cbr_2.jpg', 0, NOW(), 'vh-006'),

-- Bayliner
('img-011', 'bayliner_1.jpg', '/uploads/bayliner_1.jpg', 1, NOW(), 'vh-013'),
('img-012', 'bayliner_2.jpg', '/uploads/bayliner_2.jpg', 0, NOW(), 'vh-013'),
('img-013', 'bayliner_3.jpg', '/uploads/bayliner_3.jpg', 0, NOW(), 'vh-013');

-- ========================================
-- RESUMEN DE DATOS INSERTADOS
-- ========================================
SELECT 'RESUMEN DE DATOS INSERTADOS' as info;
SELECT 'Tipos de vehículos:' as tipo, COUNT(*) as cantidad FROM vehicle_types;
SELECT 'Clientes:' as tipo, COUNT(*) as cantidad FROM Client;
SELECT 'Proveedores:' as tipo, COUNT(*) as cantidad FROM Provider;
SELECT 'Talleres:' as tipo, COUNT(*) as cantidad FROM Workshop;
SELECT 'Vendedores:' as tipo, COUNT(*) as cantidad FROM Seller;
SELECT 'Vehículos:' as tipo, COUNT(*) as cantidad FROM Vehicle;
SELECT 'Ventas:' as tipo, COUNT(*) as cantidad FROM sales;
SELECT 'Flujo de caja:' as tipo, COUNT(*) as cantidad FROM cashflow;
SELECT 'Imágenes:' as tipo, COUNT(*) as cantidad FROM vehicle_images;

SELECT 'Vehículos por categoría:' as info;
SELECT vt.category, COUNT(v.id) as cantidad 
FROM vehicle_types vt 
LEFT JOIN Vehicle v ON vt.id = v.vehicleTypeId 
GROUP BY vt.category 
ORDER BY vt.category;

SELECT 'Vehículos por estado:' as info;
SELECT status, COUNT(*) as cantidad FROM Vehicle GROUP BY status;

SELECT 'Balance de flujo de caja:' as info;
SELECT 
    SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as ingresos,
    SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as egresos,
    SUM(amount) as balance
FROM cashflow;

EOF

if [ $? -eq 0 ]; then
    echo "✅ Base de datos poblada exitosamente"
else
    echo "❌ Error poblando la base de datos"
    exit 1
fi

# Verificar que los datos se insertaron correctamente
echo "🔍 Verificando datos insertados..."
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "
SELECT 'RESUMEN FINAL:' as info;
SELECT 'Tipos de vehículos:' as tipo, COUNT(*) as cantidad FROM vehicle_types;
SELECT 'Clientes:' as tipo, COUNT(*) as cantidad FROM Client;
SELECT 'Proveedores:' as tipo, COUNT(*) as cantidad FROM Provider;
SELECT 'Talleres:' as tipo, COUNT(*) as cantidad FROM Workshop;
SELECT 'Vendedores:' as tipo, COUNT(*) as cantidad FROM Seller;
SELECT 'Vehículos:' as tipo, COUNT(*) as cantidad FROM Vehicle;
SELECT 'Ventas:' as tipo, COUNT(*) as cantidad FROM sales;
SELECT 'Flujo de caja:' as tipo, COUNT(*) as cantidad FROM cashflow;
SELECT 'Imágenes:' as tipo, COUNT(*) as cantidad FROM vehicle_images;
"

echo "✅ Base de datos poblada con datos de prueba!"
echo "🌐 Puedes acceder a: https://miconcesionaria.nodonorte.com"
echo "📊 Datos disponibles:"
echo "   - 30 tipos de vehículos (todas las categorías)"
echo "   - 10 clientes"
echo "   - 8 proveedores"
echo "   - 7 talleres"
echo "   - 8 vendedores"
echo "   - 20 vehículos (diferentes categorías)"
echo "   - 7 ventas realizadas"
echo "   - 17 movimientos de flujo de caja"
echo "   - 13 imágenes de vehículos" 