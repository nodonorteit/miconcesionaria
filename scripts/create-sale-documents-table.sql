-- Crear tabla sale_documents
CREATE TABLE IF NOT EXISTS `sale_documents` (
  `id` VARCHAR(191) NOT NULL,
  `saleId` VARCHAR(191) NOT NULL,
  `vehicleBrand` VARCHAR(191) NOT NULL,
  `vehicleModel` VARCHAR(191) NOT NULL,
  `vehicleYear` INT NOT NULL,
  `vehicleColor` VARCHAR(191) NOT NULL,
  `vehicleMileage` INT NOT NULL,
  `vehicleVin` VARCHAR(191) NULL,
  `vehicleLicensePlate` VARCHAR(191) NULL,
  `vehicleType` VARCHAR(191) NOT NULL,
  `customerFirstName` VARCHAR(191) NOT NULL,
  `customerLastName` VARCHAR(191) NOT NULL,
  `customerEmail` VARCHAR(191) NOT NULL,
  `customerPhone` VARCHAR(191) NULL,
  `customerDocument` VARCHAR(191) NULL,
  `customerCity` VARCHAR(191) NULL,
  `customerState` VARCHAR(191) NULL,
  `sellerFirstName` VARCHAR(191) NOT NULL,
  `sellerLastName` VARCHAR(191) NOT NULL,
  `sellerEmail` VARCHAR(191) NOT NULL,
  `sellerPhone` VARCHAR(191) NULL,
  `sellerCommissionRate` DOUBLE NOT NULL,
  `saleDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `totalAmount` DECIMAL(10,2) NOT NULL,
  `commissionAmount` DECIMAL(10,2) NOT NULL,
  `notes` TEXT NULL,
  `documentNumber` VARCHAR(191) NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `sale_documents_saleId_key` (`saleId`),
  UNIQUE INDEX `sale_documents_documentNumber_key` (`documentNumber`),
  INDEX `sale_documents_saleId_idx` (`saleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Agregar foreign key constraint
ALTER TABLE `sale_documents` 
ADD CONSTRAINT `sale_documents_saleId_fkey` 
FOREIGN KEY (`saleId`) REFERENCES `sales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE; 