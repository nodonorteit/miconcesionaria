# 🚀 Estrategia de Despliegue - Mi Concesionaria

## 🎯 **Visión General**

El sistema utiliza **dos entornos completamente separados** con **imágenes Docker independientes**:

### 🏗️ **Imágenes Docker**

| Entorno | Branch | Imagen | URL | Subdominio |
|---------|--------|--------|-----|------------|
| 🟡 **Staging** | `staging` | `miconcesionaria:staging` | `swr.sa-argentina-1.myhuaweicloud.com/nodonorteit/miconcesionaria:staging` | `miconcesionaria.staging.nodonorte.com` |
| 🟢 **Producción** | `master`/`main` | `miconcesionaria:latest` | `swr.sa-argentina-1.myhuaweicloud.com/nodonorteit/miconcesionaria:latest` | `miconcesionaria.nodonorte.com` |

## 🔄 **Flujo de Trabajo**

```
feature/* → dev → staging → master
                ↓         ↓
            🟡 Staging  🟢 Production
            Image       Image
            :staging    :latest
```

### 📋 **Proceso Detallado**

1. **🟡 Staging**
   - Push a `staging` → Construye `miconcesionaria:staging`
   - Despliegue en `miconcesionaria.staging.nodonorte.com`
   - Testing y validación

2. **🟢 Producción**
   - Merge `staging` → `master` → Construye `miconcesionaria:latest`
   - Despliegue en `miconcesionaria.nodonorte.com`
   - Entorno de producción

## 🐳 **Configuración de Contenedores**

### **Staging** (`docker-compose.staging.yml`)
```yaml
services:
  app:
    image: swr.sa-argentina-1.myhuaweicloud.com/nodonorteit/miconcesionaria:staging
    environment:
      - NEXTAUTH_URL=https://miconcesionaria.staging.nodonorte.com
      - NODE_ENV=staging
    volumes:
      - uploads_data_staging:/app/uploads
```

### **Producción** (`docker-compose.prod.yml`)
```yaml
services:
  app:
    image: swr.sa-argentina-1.myhuaweicloud.com/nodonorteit/miconcesionaria:latest
    environment:
      - NEXTAUTH_URL=https://miconcesionaria.nodonorte.com
      - NODE_ENV=production
    volumes:
      - uploads_data:/app/uploads
```

## 🚀 **Comandos de Despliegue**

### **🟡 Staging**
```bash
# Desplegar staging
./scripts/deploy-staging.sh

# Ver logs
docker-compose -f docker-compose.staging.yml logs -f

# Verificar estado
./scripts/check-environments.sh
```

### **🟢 Producción**
```bash
# Desplegar producción
./scripts/deploy-production.sh

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Verificar estado
./scripts/check-environments.sh
```

## 📊 **Ventajas de esta Estrategia**

### ✅ **Beneficios**

1. **Testing Independiente**
   - Staging completamente aislado de producción
   - Pruebas sin riesgo de afectar usuarios reales

2. **Rollback Fácil**
   - Cada entorno tiene su propia imagen
   - Rollback instantáneo a versiones anteriores

3. **Entornos Aislados**
   - Volúmenes separados (`uploads_data` vs `uploads_data_staging`)
   - Configuraciones específicas por entorno

4. **Despliegue Automático**
   - GitHub Actions construye imágenes automáticamente
   - Sin intervención manual

5. **Monitoreo Separado**
   - Logs independientes por entorno
   - Métricas específicas de cada ambiente

## 🔧 **Configuración de Plesk**

### **Subdominio Staging**
- **Dominio**: `miconcesionaria.staging.nodonorte.com`
- **Puerto**: `3001` (contenedor Docker)
- **SSL**: Certificado Let's Encrypt
- **Proxy**: Apache/Nginx reverso

### **Subdominio Producción**
- **Dominio**: `miconcesionaria.nodonorte.com`
- **Puerto**: `3000` (contenedor Docker)
- **SSL**: Certificado Let's Encrypt
- **Proxy**: Apache/Nginx reverso

## 📋 **Checklist de Despliegue**

### **🟡 Staging**
- [ ] Push a `staging`
- [ ] Verificar que GitHub Actions construya `:staging`
- [ ] Ejecutar `./scripts/deploy-staging.sh`
- [ ] Verificar `https://miconcesionaria.staging.nodonorte.com`
- [ ] Probar funcionalidades críticas

### **🟢 Producción**
- [ ] Merge `staging` → `master`
- [ ] Verificar que GitHub Actions construya `:latest`
- [ ] Ejecutar `./scripts/deploy-production.sh`
- [ ] Verificar `https://miconcesionaria.nodonorte.com`
- [ ] Monitorear logs y métricas

## 🚨 **Solución de Problemas**

### **Imagen no se construye**
```bash
# Verificar GitHub Actions
# Ir a Actions → Build and Push Docker Images
# Revisar logs del workflow
```

### **Contenedor no inicia**
```bash
# Verificar logs
docker-compose -f docker-compose.staging.yml logs -f
docker-compose -f docker-compose.prod.yml logs -f

# Verificar estado
docker-compose -f docker-compose.staging.yml ps
docker-compose -f docker-compose.prod.yml ps
```

### **Problemas de permisos**
```bash
# Verificar volúmenes
docker volume ls | grep uploads

# Limpiar volúmenes si es necesario
docker volume rm miconcesionaria_uploads_data
docker volume rm miconcesionaria_uploads_data_staging
```

## 🎯 **Próximos Pasos**

1. **Configurar subdominios** en Plesk
2. **Probar despliegue** de staging
3. **Validar funcionalidades** en staging
4. **Desplegar a producción** cuando esté listo
5. **Monitorear** ambos entornos

---

**¡Sistema de despliegue dual implementado y listo para usar! 🚀** 