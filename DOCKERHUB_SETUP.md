# 🐳 Configuración de Docker Hub - Mi Concesionaria

## 📋 Información del Repositorio

- **Usuario Docker Hub**: `gmsastre`
- **Repositorio**: `gmsastre/miconcesionaria`
- **Token de acceso**: Configurado en `scripts/dockerhub-login.sh`

## 🚀 Comandos Rápidos

### Login a Docker Hub
```bash
./scripts/dockerhub-login.sh
```

### Build y Push de Imágenes

#### Producción (latest)
```bash
./scripts/dockerhub-build-push.sh latest
```

#### Staging
```bash
./scripts/dockerhub-build-push.sh staging
```

#### Versión Específica
```bash
./scripts/dockerhub-build-push.sh v1.0.0
```

### Verificar Imágenes
```bash
./scripts/check-dockerhub-images.sh
```

### Pull de Imágenes en el Servidor

#### Producción
```bash
docker pull gmsastre/miconcesionaria:latest
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

#### Staging
```bash
docker pull gmsastre/miconcesionaria:staging
docker-compose -f docker-compose.staging.yml pull
docker-compose -f docker-compose.staging.yml up -d
```

## 📦 Estructura de Tags

- `gmsastre/miconcesionaria:latest` - Imagen de producción (desde `master`/`main`)
- `gmsastre/miconcesionaria:staging` - Imagen de staging (desde `staging`)
- `gmsastre/miconcesionaria:v1.0.0` - Versiones específicas
- `gmsastre/miconcesionaria:v1.0.0-staging` - Versiones de staging

## 🔐 Autenticación

El token de acceso está configurado en el script `dockerhub-login.sh`. Si necesitas actualizarlo:

1. Obtén un nuevo token desde: https://hub.docker.com/settings/security
2. Actualiza la variable `DOCKERHUB_TOKEN` en `scripts/dockerhub-login.sh`

## 🔄 Flujo de Deployment

1. **Desarrollo Local**
   ```bash
   docker build -t gmsastre/miconcesionaria:latest .
   ```

2. **Push a Docker Hub**
   ```bash
   ./scripts/dockerhub-build-push.sh latest
   ```

3. **En el Servidor**
   ```bash
   docker-compose -f docker-compose.prod.yml pull
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 🧹 Limpieza de Imágenes

### Política de Retención
```bash
./scripts/retention-policy.sh --keep=10
```

### Limpieza Manual
```bash
docker image prune -f
```

## 📊 Verificación

### Ver imágenes locales
```bash
docker images | grep gmsastre/miconcesionaria
```

### Ver imágenes remotas
```bash
docker pull gmsastre/miconcesionaria:latest
docker images gmsastre/miconcesionaria
```

## ⚠️ Notas Importantes

1. **Siempre hacer login antes de push**: `./scripts/dockerhub-login.sh`
2. **Versionar las imágenes**: Usar tags semánticos (v1.0.0, v1.1.0, etc.)
3. **No hacer push de imágenes de desarrollo**: Solo `latest`, `staging` y versiones
4. **Mantener el repositorio limpio**: Usar política de retención regularmente

## 🔗 Enlaces Útiles

- Docker Hub: https://hub.docker.com/r/gmsastre/miconcesionaria
- Documentación Docker Hub: https://docs.docker.com/docker-hub/

