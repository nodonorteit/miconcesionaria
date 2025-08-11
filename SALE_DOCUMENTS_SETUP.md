# Configuración de Tabla Sale Documents

## 🚨 Problema Actual
La aplicación está fallando porque la tabla `sale_documents` no existe en la base de datos:
```
The table `sale_documents` does not exist in the current database.
```

## 🔧 Solución

### Opción 1: Script SQL (Recomendado para Producción/Staging)
1. **Conectar al servidor** donde está corriendo la aplicación
2. **Ejecutar el script SQL**:
   ```bash
   # Desde el directorio del proyecto
   ./scripts/setup-sale-documents.sh
   ```

### Opción 2: Ejecutar SQL Manualmente
Si no tienes acceso al script, ejecuta directamente en MySQL:
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

## 📋 Requisitos Previos
- Acceso a la base de datos MySQL
- Variable `DATABASE_URL` configurada
- Cliente MySQL instalado en el servidor

## 🚀 Pasos de Configuración

### 1. Verificar Variables de Entorno
```bash
echo $DATABASE_URL
# Debe mostrar algo como: mysql://usuario:password@host:puerto/database
```

### 2. Ejecutar Script de Configuración
```bash
cd /ruta/al/proyecto
./scripts/setup-sale-documents.sh
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

### Error: "Table already exists"
- La tabla ya fue creada, continuar con la verificación

### Error: "Foreign key constraint fails"
- Verificar que la tabla `sales` existe
- Verificar que las referencias son correctas

## 📞 Soporte
Si persisten los problemas, verificar:
1. Logs de la aplicación
2. Estado de la base de datos
3. Permisos de usuario
4. Configuración de Prisma 