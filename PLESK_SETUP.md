# Configuración para Plesk con Docker

Esta guía explica cómo configurar el sistema en Plesk usando el plugin Docker.

## Requisitos Previos

1. Plesk con el plugin Docker instalado
2. Acceso para crear subdominios
3. Acceso para crear bases de datos MySQL

## Proceso de Despliegue

### 1. Crear Subdominio en Plesk

1. Ve a **Dominios** → **Subdominios**
2. Crea un nuevo subdominio (ej: `cliente1.autovista.ar`)
3. Anota el directorio donde se crea (ej: `/var/www/vhosts/autovista.ar/cliente1.autovista.ar`)

### 2. Crear Base de Datos MySQL

1. Ve a **Bases de Datos** → **Agregar Base de Datos**
2. Crea una nueva base de datos MySQL
3. Crea un usuario para la base de datos
4. Anota:
   - **Host**: Generalmente `localhost` o la IP del servidor
   - **Puerto**: `3306`
   - **Nombre de la DB**: (ej: `cliente1_db`)
   - **Usuario**: (ej: `cliente1_user`)
   - **Contraseña**: (la que configuraste)

### 3. Configurar Docker en Plesk

1. Ve al subdominio creado
2. Abre el **plugin Docker**
3. Configura el contenedor con:

**Imagen Docker:**
```
gmsastre/miconcesionaria:latest
```

**Puerto del contenedor:**
```
3021
```

**Puerto del host:**
- Deja que Plesk lo asigne automáticamente, o
- Especifica uno manualmente (ej: `3021`, `3022`, etc.) para evitar conflictos

**Variables de entorno:**
```
PORT=3021
DATABASE_URL=mysql://usuario:contraseña@host:3306/nombre_db
NEXTAUTH_URL=https://cliente1.autovista.ar
NEXTAUTH_SECRET=genera-una-clave-secreta-aqui
SMTP_HOST=smtp1.s.ipzmarketing.com
SMTP_PORT=587
SMTP_USER=tu_usuario_smtp
SMTP_PASS=tu_contraseña_smtp
NODE_ENV=production
```

**Nota sobre DATABASE_URL:**
- Si la DB está en el mismo servidor: usa `localhost` o la IP interna
- Si la DB está en otro servidor: usa la IP o hostname del servidor de DB
- Codifica caracteres especiales en la contraseña (ej: `!` → `%21`, `?` → `%3F`)

**Volúmenes:**
- Crea un volumen para uploads: `/app/uploads` → mapea a un directorio local

### 4. Iniciar el Contenedor

1. Inicia el contenedor desde el plugin Docker de Plesk
2. Espera a que el contenedor esté corriendo
3. Verifica los logs para asegurarte de que no hay errores

### 5. Configurar el Sistema (Primera Vez)

1. Accede a `https://cliente1.autovista.ar` en tu navegador
2. Deberías ver la pantalla de **Configuración Inicial**
3. Completa el formulario con:

**Datos de Base de Datos:**
- Host: El host de tu DB (ej: `localhost`)
- Puerto: `3306`
- Nombre de la DB: El nombre que creaste
- Usuario: El usuario que creaste
- Contraseña: La contraseña del usuario

**Usuario Administrador:**
- Nombre: (ej: "Administrador")
- Email: (ej: "admin@cliente1.com")
- Contraseña: (mínimo 6 caracteres)

4. Haz clic en **Iniciar Configuración**
5. El sistema:
   - Creará todas las tablas en la base de datos
   - Creará el usuario administrador
   - Creará los datos iniciales (tipos de vehículos, etc.)

6. Una vez completado, serás redirigido al login
7. Inicia sesión con las credenciales del administrador que configuraste
8. Se te pedirá cambiar la contraseña en el primer login

## Configuración de Nginx (si es necesario)

Si Plesk no configura automáticamente el proxy, puedes hacerlo manualmente:

1. Edita la configuración de nginx del subdominio
2. Agrega:

```nginx
location / {
    proxy_pass http://127.0.0.1:PUERTO_ASIGNADO;
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

Reemplaza `PUERTO_ASIGNADO` con el puerto que Plesk asignó al contenedor.

## Evitar Conflictos de Puertos

Para cada nuevo cliente:
1. Usa un puerto diferente en el host (3021, 3022, 3023, etc.)
2. O deja que Plesk asigne puertos automáticamente
3. El contenedor siempre usa el puerto `3021` internamente

## Troubleshooting

### El contenedor no inicia

- Verifica los logs en el plugin Docker de Plesk
- Asegúrate de que el puerto no esté en uso
- Verifica que las variables de entorno estén correctas

### Error de conexión a la base de datos

- Verifica que la DB esté creada y el usuario tenga permisos
- Verifica que el `DATABASE_URL` esté correctamente codificado
- Prueba conectarte a la DB desde fuera del contenedor

### No aparece la pantalla de setup

- Verifica que el contenedor esté corriendo
- Verifica que puedas acceder a la URL
- Revisa los logs del contenedor

### Error al crear tablas

- Verifica que el usuario de la DB tenga permisos de CREATE, ALTER, etc.
- Verifica que la DB esté vacía (sin tablas existentes)
- Revisa los logs del contenedor para más detalles

## Actualizar el Sistema

Para actualizar a una nueva versión:

1. En el plugin Docker de Plesk, detén el contenedor
2. Cambia la imagen a la nueva versión (ej: `gmsastre/miconcesionaria:v1.1.0`)
3. O simplemente haz pull de `latest`:
   ```bash
   docker pull gmsastre/miconcesionaria:latest
   ```
4. Reinicia el contenedor

## Backup

Para hacer backup de un cliente:

1. **Base de datos**: Usa las herramientas de backup de Plesk para MySQL
2. **Uploads**: Copia el volumen `/app/uploads` del contenedor

```bash
docker cp nombre_contenedor:/app/uploads /ruta/backup/uploads
```

