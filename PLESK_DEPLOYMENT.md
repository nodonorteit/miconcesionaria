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

### 1. Configurar Proxy Reverso

1. En Plesk, ir al dominio
2. Ir a "Apache & nginx Settings"
3. Habilitar "Proxy mode"
4. Configurar proxy reverso:

```nginx
# En la configuración de Apache
ProxyPass / http://localhost:3000/
ProxyPassReverse / http://localhost:3000/
```

### 2. Configurar SSL/HTTPS

1. En Plesk, ir a "SSL/TLS Certificates"
2. Instalar certificado Let's Encrypt gratuito
3. Forzar redirección HTTPS

### 3. Configurar backups

1. En Plesk, ir a "Backup Manager"
2. Configurar backup automático del directorio
3. Configurar backup de la base de datos

## 🔍 Verificación

### 1. Verificar que la aplicación funcione

```bash
# Verificar logs
docker-compose logs -f app

# Verificar health check
curl http://localhost:3000/api/health
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