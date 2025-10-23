-- Script para crear la tabla system_logs
-- Este script debe ejecutarse en la base de datos de producción

CREATE TABLE IF NOT EXISTS `system_logs` (
  `id` varchar(191) NOT NULL,
  `action` varchar(191) NOT NULL COMMENT 'CREATE, UPDATE, DELETE, COMPLETE, CANCEL, etc.',
  `entity` varchar(191) NOT NULL COMMENT 'VEHICLE, SALE, CUSTOMER, EXPENSE, etc.',
  `entityId` varchar(191) NOT NULL COMMENT 'ID del registro afectado',
  `description` varchar(191) NOT NULL COMMENT 'Descripción detallada de la acción',
  `oldData` json DEFAULT NULL COMMENT 'Datos anteriores (para UPDATE)',
  `newData` json DEFAULT NULL COMMENT 'Datos nuevos (para CREATE/UPDATE)',
  `userId` varchar(191) DEFAULT NULL COMMENT 'Usuario que realizó la acción',
  `userEmail` varchar(191) DEFAULT NULL COMMENT 'Email del usuario (backup)',
  `ipAddress` varchar(191) DEFAULT NULL COMMENT 'IP desde donde se realizó la acción',
  `userAgent` varchar(191) DEFAULT NULL COMMENT 'Navegador/dispositivo',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `system_logs_entity_idx` (`entity`),
  KEY `system_logs_action_idx` (`action`),
  KEY `system_logs_entityId_idx` (`entityId`),
  KEY `system_logs_userId_idx` (`userId`),
  KEY `system_logs_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar algunos logs de prueba para verificar que funciona
INSERT INTO `system_logs` (
  `id`, 
  `action`, 
  `entity`, 
  `entityId`, 
  `description`, 
  `oldData`, 
  `newData`, 
  `userId`, 
  `userEmail`, 
  `ipAddress`, 
  `userAgent`, 
  `createdAt`
) VALUES (
  'test-log-1',
  'CREATE',
  'SYSTEM',
  'migration-test',
  'Tabla system_logs creada exitosamente',
  NULL,
  '{"table": "system_logs", "status": "created"}',
  'system',
  'system@miconcesionaria.com',
  '127.0.0.1',
  'migration-script',
  NOW()
);

-- Verificar que la tabla se creó correctamente
SELECT COUNT(*) as total_logs FROM system_logs;
SELECT * FROM system_logs ORDER BY createdAt DESC LIMIT 5;
