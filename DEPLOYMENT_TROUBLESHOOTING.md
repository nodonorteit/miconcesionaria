# Guía de Solución de Problemas de Deployment

Esta guía proporciona soluciones para problemas comunes durante el deployment de miconcesionaria.

## Problemas Comunes

### 1. Error de Permisos en Directorio Uploads

**Problema**: El directorio `uploads` no tiene los permisos correctos o no existe.

**Síntomas**:
- Error 403 al acceder a imágenes
- Mensajes de error sobre permisos en logs
- Imágenes no se cargan correctamente

**Solución Automática**:
```bash
# Ejecutar el script de configuración
bash scripts/setup-uploads-external.sh
```

**Solución Manual**:
```bash
# Crear directorio si no existe
mkdir -p ./uploads

# Crear archivo .gitkeep
touch ./uploads/.gitkeep

# Configurar permisos
chmod 755 ./uploads
chmod 644 ./uploads/.gitkeep

# Cambiar propietario (ajustar según tu servidor)
sudo chown -R www-data:www-data ./uploads
# O para Nginx:
sudo chown -R nginx:nginx ./uploads
```

### 2. Error de Imagen No Válida

**Problema**: Las imágenes no se cargan y aparece el error "The requested resource isn't a valid image".

**Síntomas**:
- Error en consola: `received text/plain;charset=utf-8`
- Imágenes no se muestran en la aplicación
- Logo de empresa no aparece

**Solución**:
```bash
# Verificar que el archivo existe y es válido
ls -la ./uploads/

# Verificar tipo MIME del archivo
file ./uploads/nombre_del_archivo.jpg

# Si el archivo está corrupto, eliminarlo
rm ./uploads/archivo_corrupto.jpg

# Verificar permisos del directorio
ls -la ./uploads/
```

### 3. Error de Usuario por Defecto

**Problema**: No existe ningún usuario en la base de datos para crear ventas.

**Síntomas**:
- Error: `Foreign key constraint violated: userId`
- No se pueden crear ventas
- Error al iniciar sesión

**Solución**:
```bash
# Ejecutar script de creación de usuario
bash scripts/create-default-user.sh
```

**Usuario por defecto creado**:
- Email: `admin@miconcesionaria.com`
- Password: `admin123`
- Rol: `ADMIN`

### 4. Problemas de Docker

**Problema**: Los contenedores no se inician correctamente.

**Síntomas**:
- Error al ejecutar `docker-compose up -d`
- Contenedores se detienen inmediatamente
- Puertos ocupados

**Solución**:
```bash
# Detener contenedores existentes
docker-compose down

# Limpiar contenedores y volúmenes
docker-compose down -v
docker system prune -f

# Reconstruir imágenes
docker-compose build --no-cache

# Iniciar servicios
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

### 5. Problemas de Base de Datos

**Problema**: La base de datos no se conecta o no tiene las tablas correctas.

**Síntomas**:
- Error de conexión a base de datos
- Tablas faltantes
- Errores de Prisma

**Solución**:
```bash
# Verificar estructura de base de datos
bash scripts/check-database-structure.sh

# Ejecutar migraciones si es necesario
docker-compose exec app npx prisma migrate deploy

# Regenerar cliente Prisma
docker-compose exec app npx prisma generate
```

## Configuración del Directorio Uploads

### Configuración Externa (Recomendada)

El directorio `uploads` está configurado como un bind mount externo al contenedor para mejor persistencia y acceso directo desde el servidor.

**Ventajas**:
- Archivos persistentes entre reinicios de contenedores
- Acceso directo desde el servidor
- Fácil backup y mantenimiento
- Mejor rendimiento

**Configuración**:
```yaml
# docker-compose.yml
volumes:
  - ./uploads:/app/uploads:rw
```

**Setup inicial**:
```bash
# Ejecutar script de configuración
bash scripts/setup-uploads-external.sh
```

### Verificación de Configuración

```bash
# Verificar que el directorio existe
ls -la ./uploads/

# Verificar permisos
stat ./uploads

# Verificar que Docker puede acceder
docker-compose exec app ls -la /app/uploads/

# Probar subida de archivo
echo "test" > ./uploads/test.txt
docker-compose exec app cat /app/uploads/test.txt
```

## Scripts de Utilidad

### setup-uploads-external.sh
Configura el directorio `uploads` externo con permisos correctos.

### create-default-user.sh
Crea un usuario administrador por defecto si no existe ninguno.

### post-deploy.sh
Script completo de post-deployment que ejecuta todas las verificaciones necesarias.

### check-uploads.sh
Diagnostica problemas con el directorio `uploads` y archivos.

### repair-uploads.sh
Repara archivos corruptos en el directorio `uploads`.

## Comandos de Verificación

```bash
# Verificar estado de contenedores
docker ps

# Verificar logs de la aplicación
docker-compose logs -f app

# Verificar logs de la base de datos
docker-compose logs -f db

# Verificar salud de la aplicación
curl http://localhost:3000/api/health

# Verificar directorio uploads
ls -la ./uploads/

# Verificar permisos
namei -l ./uploads/
```

## Prevención de Problemas

1. **Siempre ejecutar post-deploy**:
   ```bash
   bash scripts/post-deploy.sh
   ```

2. **Verificar permisos antes de iniciar**:
   ```bash
   bash scripts/setup-uploads-external.sh
   ```

3. **Hacer backup del directorio uploads**:
   ```bash
   tar -czf uploads-backup-$(date +%Y%m%d).tar.gz ./uploads/
   ```

4. **Monitorear logs regularmente**:
   ```bash
   docker-compose logs --tail=100 -f
   ```

## Contacto y Soporte

Si los problemas persisten después de seguir esta guía:

1. Revisar logs completos: `docker-compose logs`
2. Verificar configuración del servidor
3. Revisar permisos del sistema de archivos
4. Verificar conectividad de red y puertos 