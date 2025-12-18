# Despliegue Multitenant Automático

Este sistema permite desplegar múltiples instancias del sistema, una por cliente, cada una con su propio subdominio, contenedor Docker y base de datos.

## Requisitos Previos

1. Docker y Docker Compose instalados
2. Nginx configurado
3. Certificados SSL (Let's Encrypt recomendado)
4. Acceso root o sudo en el servidor

## Estructura

Cada cliente se despliega en:
```
/var/www/vhosts/autovista.ar/<subdominio>/
```

Cada cliente tiene:
- Su propio `docker-compose.yml`
- Su propia base de datos MariaDB
- Su propio volumen para uploads
- Su propia red Docker
- Su propia configuración de nginx

## Uso

### Desplegar un nuevo cliente

```bash
cd /var/www/vhosts/autovista.ar/sistema.autovista.ar
./scripts/deploy-client.sh "Nombre del Cliente" subdominio
```

**Ejemplo:**
```bash
./scripts/deploy-client.sh "Cliente Ejemplo S.A." cliente1
```

Esto creará:
- Subdominio: `cliente1.autovista.ar`
- Puerto: Generado automáticamente (3021-3999)
- Base de datos: `cliente1_db`
- Usuario DB: `cliente1_user`

### Especificar puerto manualmente

```bash
./scripts/deploy-client.sh "Nombre del Cliente" subdominio 3050
```

## Proceso Automático

El script realiza automáticamente:

1. ✅ Crea el directorio del cliente
2. ✅ Genera contraseñas seguras
3. ✅ Crea `docker-compose.yml` desde el template
4. ✅ Crea configuración de nginx
5. ✅ Recarga nginx
6. ✅ Descarga imágenes Docker
7. ✅ Levanta contenedores (app + db)
8. ✅ Crea tablas en la base de datos
9. ✅ Crea usuario admin inicial

## Credenciales por Defecto

Después del despliegue, cada cliente tiene:

**Usuario Admin:**
- Email: `admin@miconcesionaria.com`
- Contraseña: `admin123`
- ⚠️ Se pedirá cambiar la contraseña en el primer login

## Gestión de Clientes

### Ver clientes desplegados

```bash
ls -la /var/www/vhosts/autovista.ar/
```

### Ver logs de un cliente

```bash
cd /var/www/vhosts/autovista.ar/<subdominio>
docker-compose logs -f app
```

### Reiniciar un cliente

```bash
cd /var/www/vhosts/autovista.ar/<subdominio>
docker-compose restart
```

### Detener un cliente

```bash
cd /var/www/vhosts/autovista.ar/<subdominio>
docker-compose down
```

### Eliminar un cliente

```bash
cd /var/www/vhosts/autovista.ar/<subdominio>
docker-compose down -v  # Elimina también los volúmenes
rm -rf /var/www/vhosts/autovista.ar/<subdominio>
rm /etc/nginx/conf.d/<subdominio>.conf
systemctl reload nginx
```

## Configuración

### Variables de Entorno

Cada cliente tiene su archivo `.env` en su directorio con todas las configuraciones.

### SMTP

Por defecto usa la configuración SMTP del sistema principal. Puedes personalizarla editando el script o el `.env` del cliente.

### Puertos

Los puertos se generan automáticamente basándose en un hash del subdominio para evitar conflictos. Rango: 3021-3999.

## Troubleshooting

### El puerto está en uso

Especifica un puerto manualmente:
```bash
./scripts/deploy-client.sh "Cliente" subdominio 3050
```

### Error al recargar nginx

Verifica la configuración:
```bash
nginx -t
```

Luego recarga manualmente:
```bash
systemctl reload nginx
```

### La base de datos no se crea

Verifica los logs:
```bash
cd /var/www/vhosts/autovista.ar/<subdominio>
docker-compose logs db
```

### Re-ejecutar setup

Si el setup falló, puedes ejecutarlo manualmente:
```bash
cd /var/www/vhosts/autovista.ar/<subdominio>
docker-compose exec app npx prisma db push
docker-compose exec app node -e "..." # (usar el código del seed)
```

## Notas

- Cada cliente es completamente independiente
- Las bases de datos están aisladas
- Los volúmenes están aislados
- Las redes Docker están aisladas
- Todos comparten la misma imagen Docker (`gmsastre/miconcesionaria:latest`)

