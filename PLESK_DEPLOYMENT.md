# 🚀 Despliegue en Plesk - Mi Concesionaria

Guía paso a paso para desplegar la aplicación Mi Concesionaria en un servidor con Plesk.

## 📋 Requisitos Previos

- Servidor Ubuntu con Plesk instalado
- Docker y Docker Compose instalados en el servidor
- Acceso SSH al servidor
- Dominio configurado en Plesk

## 🔧 Preparación del Servidor

### 1. Instalar Docker en Ubuntu (si no está instalado)

```bash
# Actualizar paquetes
sudo apt update

# Instalar dependencias
sudo apt install apt-transport-https ca-certificates curl software-properties-common

# Agregar clave GPG de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Agregar repositorio de Docker
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Instalar Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
```

### 2. Configurar Plesk

1. **Crear dominio/subdominio**:
   - Acceder a Plesk
   - Crear un nuevo dominio o subdominio
   - Configurar DNS si es necesario

2. **Configurar base de datos PostgreSQL**:
   - En Plesk, ir a "Bases de datos"
   - Crear una nueva base de datos PostgreSQL
   - Anotar: nombre de BD, usuario, contraseña y host

## 📦 Despliegue de la Aplicación

### 1. Subir código al servidor

```bash
# Conectar por SSH al servidor
ssh usuario@tu-servidor.com

# Navegar al directorio del dominio
cd /var/www/vhosts/tu-dominio.com

# Clonar el repositorio
git clone https://github.com/tu-usuario/miconcesionaria.git .
```

### 2. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar variables de entorno
nano .env
```

Configurar las siguientes variables:

```env
# Base de datos (usar los datos de Plesk)
DATABASE_URL="postgresql://usuario:contraseña@host:5432/nombre_bd"

# URL de la aplicación
NEXTAUTH_URL="https://tu-dominio.com"
NEXTAUTH_SECRET="generar-un-secret-aleatorio-aqui"

# Configuración de email (usar SMTP real)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-app-password"

# Entorno de producción
NODE_ENV="production"
```

### 3. Construir y ejecutar la aplicación

```bash
# Construir y ejecutar en producción
docker-compose -f docker-compose.prod.yml up --build -d

# Verificar que los contenedores estén ejecutándose
docker-compose ps
```

### 4. Configurar la base de datos

```bash
# Ejecutar migraciones
docker-compose exec app npx prisma migrate deploy

# Generar cliente Prisma
docker-compose exec app npx prisma generate

# Poblar con datos iniciales
docker-compose exec app npx prisma db seed
```

## 🌐 Configuración de Plesk

### 1. Configurar Docker Container

**IMPORTANTE**: La aplicación corre internamente en el puerto **3021**, no en 3000.

1. En Plesk, ir al plugin "Docker"
2. Crear o editar el contenedor
3. Configurar las siguientes variables de entorno:
   - `PORT=3021` (obligatorio)
   - `DATABASE_URL=mysql://usuario:contraseña@host:3306/nombre_bd`
   - `NEXTAUTH_URL=https://tu-dominio.com`
   - `NEXTAUTH_SECRET=tu-secret-key`
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=tu-email@gmail.com`
   - `SMTP_PASS=tu-password`
   - `NODE_ENV=production`

4. Configurar mapeo de puertos:
   - **Puerto del host**: El que Plesk asigne (ej: 32770) o uno específico (ej: 3021)
   - **Puerto del contenedor**: `3021` (siempre 3021)

### 2. Configurar Proxy Reverso (Nginx)

1. En Plesk, ir al dominio
2. Ir a "Apache & nginx Settings"
3. Habilitar "Proxy mode"
4. Configurar proxy reverso en la sección "Additional nginx directives":

```nginx
location / {
    proxy_pass http://127.0.0.1:PUERTO_DEL_HOST;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

**Reemplazar `PUERTO_DEL_HOST`** con el puerto que Plesk asignó al contenedor (puedes verlo con `docker ps`).

**Ejemplo**: Si el contenedor está mapeado a `0.0.0.0:32770->3021/tcp`, usar:
```nginx
proxy_pass http://127.0.0.1:32770;
```

### 3. Configurar SSL/HTTPS (Puerto 443)

1. En Plesk, ir a "SSL/TLS Certificates"
2. Instalar certificado Let's Encrypt gratuito
3. Forzar redirección HTTPS
4. El puerto 443 ya está configurado por Plesk, solo necesitas asegurarte de que:
   - El certificado SSL esté instalado
   - La redirección HTTP → HTTPS esté habilitada
   - El proxy reverso apunte al puerto correcto del contenedor

### 3. Configurar backups

1. En Plesk, ir a "Backup Manager"
2. Configurar backup automático del directorio
3. Configurar backup de la base de datos

## 🔍 Verificación

### 1. Verificar que la aplicación funcione

```bash
# Verificar logs
docker-compose logs -f app

# Verificar health check (usar el puerto del contenedor, ej: 3021 o el puerto asignado por Plesk)
curl http://localhost:3021/api/health
# O si está mapeado a otro puerto del host:
curl http://localhost:PUERTO_ASIGNADO/api/health
```

### 2. Acceder a la aplicación

- URL: https://tu-dominio.com
- Usuario: admin@miconcesionaria.com
- Contraseña: admin123

## 🔧 Mantenimiento

### Actualizar la aplicación

```bash
# Detener contenedores
docker-compose down

# Actualizar código
git pull origin main

# Reconstruir y ejecutar
docker-compose -f docker-compose.prod.yml up --build -d

# Ejecutar migraciones si es necesario
docker-compose exec app npx prisma migrate deploy
```

### Ver logs

```bash
# Ver logs de la aplicación
docker-compose logs -f app

# Ver logs de todos los servicios
docker-compose logs -f
```

### Backup de la base de datos

```bash
# Crear backup
docker-compose exec app npx prisma db pull

# O usar pg_dump directamente
pg_dump -h host -U usuario -d nombre_bd > backup.sql
```

## 🚨 Solución de Problemas

### La aplicación no responde

```bash
# Verificar estado de contenedores
docker-compose ps

# Verificar logs
docker-compose logs app

# Reiniciar contenedores
docker-compose restart
```

### Error de base de datos

```bash
# Verificar conexión
docker-compose exec app npx prisma db push

# Verificar variables de entorno
docker-compose exec app env | grep DATABASE
```

### Error de permisos

```bash
# Ajustar permisos del directorio uploads
sudo chown -R www-data:www-data uploads/
sudo chmod -R 755 uploads/
```

## 📞 Soporte

Si tienes problemas:

1. Verificar logs: `docker-compose logs -f`
2. Verificar estado: `docker-compose ps`
3. Verificar configuración: `docker-compose config`
4. Revisar variables de entorno
5. Contactar soporte técnico

## 🔒 Seguridad

### Recomendaciones de seguridad

1. **Cambiar contraseñas por defecto**:
   - Usuario administrador
   - Base de datos
   - NEXTAUTH_SECRET

2. **Configurar firewall**:
   - Solo puertos necesarios abiertos
   - Restringir acceso SSH

3. **Backups regulares**:
   - Base de datos
   - Archivos de la aplicación
   - Configuraciones

4. **Monitoreo**:
   - Logs de la aplicación
   - Uso de recursos
   - Accesos al sistema

---

**¡Tu aplicación Mi Concesionaria está lista para usar en producción! 🎉** 