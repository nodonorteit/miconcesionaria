# 🔧 Migración: Crear Tabla system_logs

## 📋 Problema
La tabla `system_logs` no existe en la base de datos, causando que el sistema de auditoría no funcione.

## 🚀 Solución
Ejecutar la migración para crear la tabla `system_logs` con todos los campos necesarios.

## 📁 Archivos Creados
- `scripts/create-system-logs-table.sql` - Script SQL para crear la tabla
- `scripts/create-system-logs.sh` - Script para ejecutar desde servidor
- `scripts/create-system-logs-docker.sh` - Script para ejecutar desde contenedor

## 🛠️ Opciones de Ejecución

### Opción 1: Desde el Servidor de Producción
```bash
# Conectar al servidor y ejecutar:
./scripts/create-system-logs.sh
```

### Opción 2: Desde el Contenedor Docker
```bash
# Ejecutar dentro del contenedor:
./scripts/create-system-logs-docker.sh
```

### Opción 3: Manualmente en la Base de Datos
```sql
-- Ejecutar el contenido de scripts/create-system-logs-table.sql
-- directamente en la base de datos MySQL
```

## ✅ Verificación
Después de ejecutar la migración, verificar que:
1. La tabla `system_logs` existe
2. Se creó el log de prueba
3. El endpoint `/api/audit-logs` funciona
4. El endpoint `/api/debug-logs` muestra datos

## 🔍 Testing
Una vez creada la tabla, probar:
- Eliminar una venta y verificar que aparece en logs de auditoría
- Acceder a `/audit-logs` en la interfaz web
- Verificar que los logs se muestran correctamente

## 📊 Estructura de la Tabla
```sql
CREATE TABLE system_logs (
  id          VARCHAR(191) PRIMARY KEY,
  action      VARCHAR(191) NOT NULL,    -- CREATE, UPDATE, DELETE, etc.
  entity      VARCHAR(191) NOT NULL,    -- VEHICLE, SALE, CUSTOMER, etc.
  entityId    VARCHAR(191) NOT NULL,    -- ID del registro afectado
  description VARCHAR(191) NOT NULL,    -- Descripción detallada
  oldData     JSON,                     -- Datos anteriores
  newData     JSON,                     -- Datos nuevos
  userId      VARCHAR(191),             -- Usuario que realizó la acción
  userEmail   VARCHAR(191),             -- Email del usuario
  ipAddress   VARCHAR(191),             -- IP desde donde se realizó
  userAgent   VARCHAR(191),             -- Navegador/dispositivo
  createdAt   DATETIME(3) DEFAULT NOW() -- Timestamp de creación
);
```

## 🎯 Próximos Pasos
1. Ejecutar la migración
2. Verificar que funciona
3. Eliminar los endpoints de debug temporales
4. Probar el sistema completo de auditoría
