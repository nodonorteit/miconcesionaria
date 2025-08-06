# Solución de Problemas de Despliegue

## Error: Permission denied en uploads/.gitkeep

### Problema
```
error: unable to unlink old 'uploads/.gitkeep': Permission denied
```

### Causa
El archivo `uploads/.gitkeep` tiene permisos que no permiten que se elimine durante el despliegue automático.

### Solución Automática

#### Opción 1: Script de Post-Deploy
El script `scripts/post-deploy.sh` se ejecuta automáticamente después del despliegue y soluciona este problema.

#### Opción 2: Script Manual
Si el script automático no funciona, ejecutar manualmente:

```bash
# Conectar al servidor via SSH
ssh usuario@servidor

# Navegar al directorio de la aplicación
cd /var/www/vhosts/nodonorte.com/miconcesionaria

# Ejecutar el script de solución
./scripts/fix-uploads-permissions.sh
```

### Solución Manual

Si los scripts no funcionan, ejecutar estos comandos manualmente:

```bash
# 1. Cambiar permisos del archivo .gitkeep
chmod 644 uploads/.gitkeep

# 2. Cambiar propietario del archivo .gitkeep
chown www-data:www-data uploads/.gitkeep

# 3. Cambiar permisos del directorio uploads
chmod 755 uploads/

# 4. Cambiar propietario del directorio uploads
chown www-data:www-data uploads/
```

### Verificación

Para verificar que los permisos están correctos:

```bash
# Verificar permisos del directorio
ls -la uploads/

# Verificar permisos del archivo
ls -la uploads/.gitkeep
```

Los permisos correctos deben ser:
- Directorio `uploads/`: `drwxr-xr-x` (755)
- Archivo `uploads/.gitkeep`: `-rw-r--r--` (644)
- Propietario: `www-data:www-data`

## Manejo de Uploads con Docker

### Problema
El directorio `uploads` está fuera del contenedor Docker, lo que puede causar problemas de persistencia y permisos.

### Solución Implementada

#### Volúmenes de Docker
- **Desarrollo**: `uploads_data:/app/uploads:rw` (volumen nombrado)
- **Producción**: `uploads_data:/app/uploads:rw` (volumen nombrado)

#### Migración de Archivos
Para migrar archivos existentes al volumen de Docker:

```bash
# 1. Ejecutar el contenedor
docker-compose up -d

# 2. Migrar archivos
./scripts/migrate-uploads-to-docker.sh
```

#### Verificación de Volúmenes
```bash
# Verificar volúmenes existentes
docker volume ls | grep uploads

# Verificar archivos en el contenedor
docker exec miconcesionaria-app-1 ls -la /app/uploads
```

### Configuración de Docker

#### Docker Compose (Desarrollo)
```yaml
services:
  app:
    volumes:
      - uploads_data:/app/uploads:rw
    user: "1001:1001"

volumes:
  uploads_data:
```

#### Docker Compose (Producción)
```yaml
services:
  app:
    volumes:
      - uploads_data:/app/uploads:rw

volumes:
  uploads_data:
```

### Scripts Disponibles

- `scripts/migrate-uploads-to-docker.sh`: Migra archivos al volumen de Docker
- `scripts/check-uploads.sh`: Verifica estado del directorio uploads
- `scripts/repair-uploads.sh`: Repara archivos corruptos

### Prevención

Para evitar este problema en futuros despliegues:

1. **Usar volúmenes de Docker**: Siempre usar volúmenes nombrados para uploads
2. **Migrar archivos**: Usar el script de migración cuando sea necesario
3. **Verificar permisos**: Ejecutar scripts de verificación regularmente
4. **Backup automático**: Crear backups antes de migraciones

### Scripts Disponibles

- `scripts/fix-uploads-permissions.sh`: Soluciona problemas de permisos específicos
- `scripts/post-deploy.sh`: Script completo de post-deploy
- `scripts/create-uploads-dir.sh`: Crea el directorio uploads con permisos correctos
- `scripts/migrate-uploads-to-docker.sh`: Migra archivos al volumen de Docker

### Contacto

Si el problema persiste, revisar:
1. Logs del servidor web (nginx/apache)
2. Permisos del usuario de despliegue
3. Configuración del servidor
4. Estado de los volúmenes de Docker 