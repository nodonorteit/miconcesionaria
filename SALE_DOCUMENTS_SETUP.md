# Configuración de Tabla Sale Documents

## 🚨 Problema Actual
La aplicación está fallando porque la tabla `sale_documents` no existe en la base de datos:
```
The table `sale_documents` does not exist in the current database.
```

## 🔧 Solución

### Opción 1: Scripts Automatizados (Recomendado)

#### Para STAGING:
```bash
# Desde el directorio del proyecto
./scripts/setup-sale-documents-staging.sh
```

#### Para PRODUCCIÓN:
```bash
# Desde el directorio del proyecto
./scripts/setup-sale-documents-production.sh
```

### Opción 2: Script SQL Manual
Si no tienes acceso a los scripts, ejecuta directamente en MySQL:

```sql
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
```

## 📋 Credenciales de Base de Datos

### STAGING:
- **Host**: 127.0.0.1
- **Puerto**: 3306
- **Base de datos**: miconcesionaria
- **Usuario**: miconcesionaria
- **Contraseña**: !FVsxr?pmm34xm2N

### PRODUCCIÓN:
- **Host**: 127.0.0.1
- **Puerto**: 3306
- **Base de datos**: miconcesionaria
- **Usuario**: miconcesionaria
- **Contraseña**: !FVsxr?pmm34xm2N

## 🚀 Pasos de Configuración

### 1. Conectar al Servidor
```bash
# Conectar al servidor donde está corriendo la aplicación
ssh usuario@servidor
cd /ruta/al/proyecto
```

### 2. Ejecutar Script de Configuración
```bash
# Para STAGING
./scripts/setup-sale-documents-staging.sh

# Para PRODUCCIÓN
./scripts/setup-sale-documents-production.sh
```

### 3. Verificar Creación
```sql
DESCRIBE sale_documents;
SHOW TABLES LIKE 'sale_documents';
```

## ✅ Verificación
Después de crear la tabla, la aplicación debería:
- ✅ Crear ventas sin errores
- ✅ Generar documentos automáticamente
- ✅ Mostrar el botón "Boleto" en vehículos vendidos
- ✅ Permitir generar boletos de compra-venta

## 🆘 Troubleshooting

### Error: "Access denied"
- Verificar credenciales de la base de datos
- Verificar permisos del usuario MySQL
- Verificar que el usuario tenga acceso desde 127.0.0.1

### Error: "Table already exists"
- La tabla ya fue creada, continuar con la verificación

### Error: "Foreign key constraint fails"
- Verificar que la tabla `sales` existe
- Verificar que las referencias son correctas

### Error: "mysql command not found"
- Instalar cliente MySQL: `sudo apt-get install mysql-client`

## 📞 Soporte
Si persisten los problemas, verificar:
1. Logs de la aplicación
2. Estado de la base de datos
3. Permisos de usuario
4. Configuración de Prisma
5. Conectividad de red al puerto 3306 