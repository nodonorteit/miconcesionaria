# Configuración de Uploads - Directorio Externo

## Resumen

La aplicación miconcesionaria está configurada para usar un directorio `uploads` externo al contenedor Docker. Esto proporciona mejor persistencia, acceso directo desde el servidor y facilita el mantenimiento y backup de archivos.

## Configuración Actual

### Docker Compose (Desarrollo)
```yaml
# docker-compose.yml
services:
  app:
    volumes:
      - uploads:/app/uploads:rw  # Volumen nombrado para desarrollo

volumes:
  uploads:  # Volumen Docker nombrado
```

### Docker Compose (Producción)
```yaml
# docker-compose.prod.yml
services:
  app:
    volumes:
      - ./uploads:/app/uploads:rw  # Bind mount externo para producción
```

## Ventajas de la Configuración Externa

1. **Persistencia**: Los archivos permanecen en el servidor incluso si se eliminan los contenedores
2. **Acceso Directo**: Puedes acceder a los archivos directamente desde el servidor
3. **Backup Fácil**: Los archivos están en una ubicación conocida y accesible
4. **Mejor Rendimiento**: No hay overhead de volúmenes Docker
5. **Mantenimiento**: Fácil de limpiar, mover o respaldar archivos

## Setup Inicial

### En el Servidor

1. **Ejecutar script de configuración**:
   ```bash
   bash scripts/setup-uploads-external.sh
   ```

2. **Verificar configuración**:
   ```bash
   ls -la ./uploads/
   ```

3. **Iniciar contenedores**:
   ```bash
   docker-compose up -d
   ```

### Script de Configuración

El script `scripts/setup-uploads-external.sh` realiza las siguientes acciones:

- Crea el directorio `uploads` si no existe
- Crea el archivo `.gitkeep` para mantener el directorio en Git
- Detecta automáticamente el usuario del servidor web (nginx/www-data)
- Configura permisos correctos (755 para directorio, 644 para archivos)
- Cambia el propietario al usuario del servidor web
- Verifica la configuración final

## Estructura de Directorios

```
miconcesionaria/
├── uploads/                    # Directorio externo al contenedor
│   ├── .gitkeep               # Mantiene el directorio en Git
│   ├── company_logo_*.jpg     # Logos de empresa
│   ├── vehicle_*.jpg          # Fotos de vehículos
│   └── ...                    # Otros archivos subidos
├── docker-compose.yml         # Configuración desarrollo
├── docker-compose.prod.yml    # Configuración producción
└── scripts/
    └── setup-uploads-external.sh  # Script de configuración
```

## Permisos Requeridos

- **Directorio uploads**: `755` (drwxr-xr-x)
- **Archivo .gitkeep**: `644` (-rw-r--r--)
- **Propietario**: Usuario del servidor web (nginx/www-data)

## Verificación

### Verificar Configuración Local
```bash
# Verificar que el directorio existe
ls -la ./uploads/

# Verificar permisos
stat ./uploads

# Verificar que Docker puede acceder
docker-compose exec app ls -la /app/uploads/
```

### Verificar Funcionamiento
```bash
# Probar subida de archivo
echo "test" > ./uploads/test.txt
docker-compose exec app cat /app/uploads/test.txt

# Verificar que la aplicación puede leer archivos
curl http://localhost:3000/api/uploads/test.txt
```

## Mantenimiento

### Backup
```bash
# Crear backup del directorio uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz ./uploads/

# Restaurar backup
tar -xzf uploads-backup-YYYYMMDD.tar.gz
```

### Limpieza
```bash
# Verificar archivos grandes
du -sh ./uploads/*

# Eliminar archivos temporales
find ./uploads -name "*.tmp" -delete

# Limpiar archivos corruptos
bash scripts/repair-uploads.sh
```

### Monitoreo
```bash
# Verificar uso de espacio
df -h ./uploads/

# Verificar permisos
find ./uploads -type f -exec ls -la {} \;

# Verificar archivos recientes
find ./uploads -type f -mtime -7 -exec ls -la {} \;
```

## Troubleshooting

### Problemas Comunes

1. **Error de permisos**:
   ```bash
   bash scripts/setup-uploads-external.sh
   ```

2. **Archivos no se cargan**:
   ```bash
   # Verificar que el directorio existe
   ls -la ./uploads/
   
   # Verificar permisos
   chmod 755 ./uploads
   chown www-data:www-data ./uploads  # o nginx:nginx
   ```

3. **Error de imagen no válida**:
   ```bash
   # Verificar tipo de archivo
   file ./uploads/nombre_archivo.jpg
   
   # Reparar archivos corruptos
   bash scripts/repair-uploads.sh
   ```

### Scripts de Utilidad

- `scripts/setup-uploads-external.sh`: Configuración inicial
- `scripts/check-uploads.sh`: Diagnóstico de problemas
- `scripts/repair-uploads.sh`: Reparación de archivos corruptos
- `scripts/post-deploy.sh`: Configuración post-deployment

## Migración desde Volúmenes Docker

Si tienes archivos en un volumen Docker y quieres migrarlos al directorio externo:

1. **Detener contenedores**:
   ```bash
   docker-compose down
   ```

2. **Copiar archivos del volumen**:
   ```bash
   docker run --rm -v miconcesionaria_uploads_data:/source -v $(pwd):/dest alpine cp -r /source/* /dest/uploads/
   ```

3. **Configurar directorio externo**:
   ```bash
   bash scripts/setup-uploads-external.sh
   ```

4. **Actualizar docker-compose**:
   Cambiar de volumen nombrado a bind mount

5. **Iniciar contenedores**:
   ```bash
   docker-compose up -d
   ```

## Seguridad

- Los archivos en `uploads` son accesibles públicamente
- Considerar implementar autenticación para archivos sensibles
- Mantener backups regulares
- Monitorear uso de espacio en disco
- Implementar limpieza automática de archivos temporales

## Próximos Pasos

1. Implementar autenticación para archivos sensibles
2. Configurar backup automático
3. Implementar limpieza automática
4. Monitoreo de uso de espacio
5. Compresión automática de imágenes 