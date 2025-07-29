# 🚀 Configuración de Huawei Cloud + GitHub Actions

Esta guía te ayudará a configurar el build automático de imágenes Docker en GitHub Actions y su despliegue desde Huawei Cloud SWR.

## 📋 Prerrequisitos

1. **Cuenta en Huawei Cloud** con acceso a SWR (Software Repository for Container)
2. **Repositorio en GitHub** con el código de Mi Concesionaria
3. **Acceso SSH** a tu servidor Ubuntu con Plesk

## 🔧 Paso 1: Configurar Huawei Cloud SWR

### 1.1 Crear Namespace en SWR

1. Ve a la consola de Huawei Cloud
2. Navega a **SWR** (Software Repository for Container)
3. Crea un nuevo **Namespace** (ej: `miconcesionaria`)
4. Anota el **Region** y **Namespace** para usarlo después

### 1.2 Obtener Credenciales de Acceso

1. En la consola de Huawei Cloud, ve a **IAM** > **Users**
2. Crea un nuevo usuario o usa uno existente
3. Asigna permisos de **SWR FullAccess**
4. Crea un **Access Key** y **Secret Access Key**
5. Guarda estas credenciales de forma segura

## 🔑 Paso 2: Configurar GitHub Secrets

En tu repositorio de GitHub:

1. Ve a **Settings** > **Secrets and variables** > **Actions**
2. Agrega los siguientes secrets:

```
HUAWEI_ACCESS_KEY_ID=tu-access-key-id
HUAWEI_SECRET_ACCESS_KEY=tu-secret-access-key
HUAWEI_NAMESPACE=nodonorteit
```

## 🏗️ Paso 3: Configurar el Workflow

El archivo `.github/workflows/build-and-push.yml` ya está configurado para:

- Construir imágenes Docker automáticamente
- Subir a Huawei Cloud SWR
- Actualizar el docker-compose.prod.yml

### 3.1 Personalizar el Workflow

Edita el archivo `.github/workflows/build-and-push.yml` y cambia:

```yaml
env:
  REGISTRY: swr.sa-argentina-1.myhuaweicloud.com  # Tu región
  IMAGE_NAME: miconcesionaria
```

Y en los secrets:
```yaml
${{ secrets.HUAWEI_NAMESPACE }}  # Tu namespace
```

## 🚀 Paso 4: Configurar el Servidor

### 4.1 Variables de Entorno

En tu servidor, configura las variables de entorno:

```bash
export HUAWEI_ACCESS_KEY_ID=tu-access-key-id
export HUAWEI_SECRET_ACCESS_KEY=tu-secret-access-key
```

### 4.2 Actualizar Script de Despliegue

Edita `scripts/deploy-huawei.sh` y cambia:

```bash
ORGANIZATION="nodonorteit"  # Tu organización real
```

## 🔄 Paso 5: Flujo de Trabajo

### 5.1 Desarrollo

1. Haz cambios en tu código
2. Haz commit y push a GitHub
3. GitHub Actions construye y sube las imágenes automáticamente

### 5.2 Despliegue

1. En tu servidor, ejecuta:
```bash
cd /var/www/vhosts/nodonorte.com/miconcesionaria
./scripts/deploy-huawei.sh
```

2. El script:
   - Hace login a Huawei Cloud
   - Descarga las imágenes más recientes
   - Reinicia los servicios

## 📊 Monitoreo

### 5.3 Verificar Estado

```bash
# Ver estado de los contenedores
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Verificar health check
curl http://localhost:3000/api/health
```

## 🔧 Configuración Avanzada

### 6.1 Múltiples Entornos

Puedes configurar diferentes namespaces para diferentes entornos:

- `miconcesionaria-dev` para desarrollo
- `miconcesionaria-staging` para staging
- `miconcesionaria-prod` para producción

### 6.2 Tags de Versiones

El workflow automáticamente crea tags basados en:
- Branches: `master`, `develop`
- Tags: `v1.0.0`, `v1.1.0`
- Commits: `master-sha-abc123`

### 6.3 Optimización de Imágenes

Las imágenes se construyen con:
- Multi-stage builds para reducir tamaño
- Cache de capas para builds más rápidos
- Soporte para múltiples arquitecturas (AMD64, ARM64)

## 🛠️ Solución de Problemas

### Problema: Error de autenticación
```bash
# Verificar credenciales
docker login -u $HUAWEI_ACCESS_KEY_ID -p $HUAWEI_SECRET_ACCESS_KEY swr.sa-argentina-1.myhuaweicloud.com
```

### Problema: Imagen no encontrada
```bash
# Verificar que la imagen existe
docker pull swr.sa-argentina-1.myhuaweicloud.com/nodonorteit/miconcesionaria:latest
```

### Problema: Permisos insuficientes
- Verificar que el usuario tiene permisos de SWR
- Verificar que el namespace existe y es accesible

## 📈 Ventajas de esta Configuración

1. **Builds Automatizados**: No necesitas construir en el servidor
2. **Despliegues Rápidos**: Solo descargas las imágenes
3. **Escalabilidad**: Fácil de replicar en múltiples servidores
4. **Versionado**: Control de versiones de las imágenes
5. **Seguridad**: Credenciales seguras en GitHub Secrets

## 🔄 Actualización Automática

Para actualizaciones automáticas, puedes configurar un webhook o usar GitHub Actions para desplegar automáticamente cuando se hace push a master.

---

**¡Con esta configuración tendrás un pipeline completo de CI/CD para tu aplicación!** 🎉 