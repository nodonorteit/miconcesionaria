# 🎫 Sistema de Boletos de Compra-Venta

## 📋 Descripción

Sistema automatizado para generar boletos de compra-venta cuando se completa una venta en la concesionaria. El boleto incluye toda la información relevante del vehículo, cliente, vendedor y transacción.

## 🚀 Características

- **🔄 Generación automática** al completar una venta
- **📄 Template completo** con toda la información necesaria
- **🖨️ Funcionalidad de impresión** directa desde el navegador
- **⬇️ Descarga en PDF** (próximamente)
- **💾 Almacenamiento persistente** en base de datos
- **🔍 Historial completo** de todos los boletos generados

## 🏗️ Arquitectura

### Base de Datos
- **Tabla**: `sale_documents`
- **Relación**: Uno a uno con la tabla `sales`
- **Campos**: Información completa del vehículo, cliente, vendedor y venta

### API Endpoints
- **`POST /api/sales/documents`**: Generar nuevo boleto
- **`GET /api/sales/documents`**: Obtener todos los boletos

### Componentes Frontend
- **`SaleDocument`**: Modal para mostrar y generar boletos
- **Integración**: Botón "Boleto" en la lista de ventas

## 📱 Flujo de Usuario

1. **👤 Dar de alta el cliente** (ya implementado)
2. **🚗 Ir a lista de vehículos** (ya implementado)
3. **🛒 Click en "Comprar"** (ya implementado)
4. **👥 Seleccionar cliente y vendedor** (ya implementado)
5. **📄 Generar boleto automáticamente** (nuevo)

## 🔧 Instalación y Configuración

### 1. Ejecutar Migración
```bash
# Desde el directorio raíz del proyecto
./scripts/setup-sale-documents.sh
```

### 2. Verificar Configuración
- El script creará la tabla `sale_documents`
- Generará el cliente de Prisma actualizado
- Verificará la estructura de la base de datos

### 3. Reiniciar Servidor
```bash
npm run dev
# o
npm run build && npm start
```

## 🎯 Uso

### Generar Boleto
1. Ve a **Ventas** en el menú principal
2. Encuentra la venta deseada en la lista
3. Haz clic en el botón **"Boleto"** (azul)
4. Se abrirá el modal del boleto
5. Haz clic en **"Generar Boleto"**
6. El sistema creará el documento automáticamente

### Ver Boleto Generado
- Una vez generado, el boleto muestra:
  - ✅ Información completa del vehículo
  - 👤 Datos del cliente
  - 🏪 Información del vendedor
  - 💰 Detalles de la transacción
  - 📅 Fecha y número de documento

### Acciones Disponibles
- **🖨️ Imprimir**: Imprime directamente desde el navegador
- **⬇️ Descargar PDF**: Descarga el boleto en formato PDF (próximamente)

## 📊 Estructura del Boleto

### Información del Vehículo
- Marca, modelo y año
- Color y kilometraje
- VIN y patente (si están disponibles)
- Tipo de vehículo

### Información del Cliente
- Nombre completo
- Email y teléfono
- Documento de identidad
- Ciudad y provincia

### Información del Vendedor
- Nombre completo
- Email y teléfono
- Porcentaje de comisión

### Información de la Venta
- Fecha de venta
- Monto total
- Comisión
- Notas adicionales

## 🔒 Seguridad y Validaciones

- **Verificación única**: Solo un boleto por venta
- **Validación de datos**: Todos los campos requeridos están validados
- **Relaciones seguras**: Foreign keys con cascade delete
- **Números únicos**: Document numbers únicos para cada boleto

## 🚧 Próximas Mejoras

- [ ] **Generación de PDF** con librería como jsPDF o Puppeteer
- [ ] **Templates personalizables** por concesionaria
- [ ] **Firma digital** del cliente y vendedor
- [ **Envío por email** automático al cliente
- [ ] **Historial de versiones** del boleto
- [ ] **Exportación a Excel** para contabilidad

## 🐛 Troubleshooting

### Error: "Property 'saleDocument' does not exist"
```bash
# Solución: Regenerar el cliente de Prisma
npx prisma generate
```

### Error: "Table 'sale_documents' doesn't exist"
```bash
# Solución: Ejecutar la migración
./scripts/setup-sale-documents.sh
```

### Error: "Ya existe un boleto para esta venta"
- **Causa**: La venta ya tiene un boleto generado
- **Solución**: Ver el boleto existente o eliminar la venta y recrearla

## 📞 Soporte

Si encuentras algún problema:
1. Verifica que la migración se ejecutó correctamente
2. Revisa los logs del servidor
3. Confirma que la base de datos tiene la tabla `sale_documents`
4. Verifica que el cliente de Prisma está actualizado

## 🎉 Estado del Proyecto

**✅ COMPLETADO:**
- Modelo de datos en Prisma
- API para generar boletos
- Componente frontend del boleto
- Integración en la página de ventas
- Scripts de migración

**🚧 EN DESARROLLO:**
- Generación de PDF
- Descarga de documentos

**📋 PENDIENTE:**
- Templates personalizables
- Firma digital
- Envío por email 