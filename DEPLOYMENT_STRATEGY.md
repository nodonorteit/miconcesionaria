# 🚀 Estrategia de Deployment - Mi Concesionaria

## 📋 **Resumen de la Estrategia**

Implementamos un sistema de **deployment dual** con entornos separados para **staging** y **producción**, cada uno con su propia imagen Docker y subdominio.

## 🏗️ **Arquitectura de Entornos**

### 🟡 **Staging Environment**
- **Branch**: `staging`
- **Imagen Docker**: `miconcesionaria:staging`
- **Subdominio**: `miconcesionaria.staging.nodonorte.com`
- **Puerto**: `3001` (variable de entorno `PORT=3001`)
- **Base de datos**: Acceso directo al host (`127.0.0.1:3306`)
- **Volumen**: `uploads_data_staging`

### 🟢 **Production Environment**
- **Branch**: `master` / `main`
- **Imagen Docker**: `miconcesionaria:latest`
- **Subdominio**: `miconcesionaria.nodonorte.com`
- **Puerto**: `3000` (default)
- **Base de datos**: Acceso directo al host (`127.0.0.1:3306`)
- **Volumen**: `uploads_data`

## 🔄 **Flujo de Deployment**

```
feature/* → dev → staging → master/main
   ↓         ↓      ↓         ↓
   dev    dev    staging   production
```

### 📝 **Proceso Automatizado**
1. **Push a `staging`** → Build imagen `:staging` → Actualiza `docker-compose.staging.yml`
2. **Push a `master`/`main`** → Build imagen `:latest` → Actualiza `docker-compose.prod.yml`
3. **GitHub Actions** maneja automáticamente la construcción y actualización de archivos

## 🐳 **Configuración Docker**

### **Staging** (`docker-compose.staging.yml`)
```yaml
services:
  app:
    image: gmsastre/miconcesionaria:staging
    network_mode: host
    environment:
      - PORT=3001
      - NODE_ENV=staging
    volumes:
      - uploads_data_staging:/app/uploads
```

### **Producción** (`docker-compose.prod.yml`)
```yaml
services:
  app:
    image: gmsastre/miconcesionaria:latest
    network_mode: host
    environment:
      - NODE_ENV=production
    volumes:
      - uploads_data:/app/uploads
```

## 📁 **Gestión de Volúmenes y Uploads**

### 🔍 **Problema Identificado**
- **Staging** y **Producción** usan volúmenes Docker separados
- Las imágenes subidas en producción no están disponibles en staging
- Esto causa errores como "File not found" para logos de empresa

### ✅ **Soluciones Disponibles**

#### **1. Sincronización Manual (Recomendado para desarrollo)**
```bash
# Copiar logo específico de empresa
./scripts/copy-company-logo-to-staging.sh

# Sincronizar todos los uploads
./scripts/sync-uploads-between-environments.sh
```

#### **2. Sincronización Automática (Para producción)**
- Configurar cron job para sincronizar volúmenes periódicamente
- Usar rsync o similar para mantener archivos sincronizados

#### **3. Volumen Compartido (Alternativa)**
- Modificar `docker-compose.staging.yml` para usar el mismo volumen
- **⚠️ Riesgo**: Los cambios en staging afectarían producción

## 🚀 **Scripts de Deployment**

### **Staging**
```bash
./scripts/deploy-staging.sh
```

### **Producción**
```bash
./scripts/deploy-production.sh
```

### **Verificación de Entornos**
```bash
./scripts/check-environments.sh
```

## 🔧 **Configuración de Plesk**

### **Proxy Rules**
- **Staging**: `miconcesionaria.staging.nodonorte.com` → `127.0.0.1:3001`
- **Producción**: `miconcesionaria.nodonorte.com` → `127.0.0.1:3000`

### **Puertos**
- **Staging**: `3001` (contenedor usa `PORT=3001`)
- **Producción**: `3000` (contenedor usa puerto default)

## 📊 **Monitoreo y Logs**

### **Ver Logs de Staging**
```bash
docker-compose -f docker-compose.staging.yml logs -f
```

### **Ver Logs de Producción**
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### **Estado de Contenedores**
```bash
docker ps
```

## 🚨 **Troubleshooting Común**

### **Error: "File not found" para imágenes**
- **Causa**: Volúmenes Docker separados
- **Solución**: Ejecutar script de sincronización
- **Comando**: `./scripts/sync-uploads-between-environments.sh`

### **Error: "EADDRINUSE"**
- **Causa**: Conflicto de puertos
- **Solución**: Usar puertos diferentes (3001 para staging, 3000 para producción)

### **Error: "Database connection failed"**
- **Causa**: Contenedor aislado sin acceso a host
- **Solución**: Usar `network_mode: host` (ya implementado)

## 🔮 **Mejoras Futuras**

1. **Sincronización automática** de volúmenes entre entornos
2. **Backup automático** de volúmenes de uploads
3. **Health checks** para ambos entornos
4. **Rollback automático** en caso de fallos
5. **Monitoreo de métricas** por entorno 