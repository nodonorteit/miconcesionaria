# 🔒 Configuración Nginx para Puerto 443 (SSL)

Guía para configurar Nginx en Plesk para que el puerto 443 (HTTPS) apunte al contenedor Docker que corre en el puerto 3021.

## 📋 Resumen de Configuración

- **Puerto interno del contenedor**: `3021` (configurado en Dockerfile)
- **Puerto externo (HTTPS)**: `443` (manejado por Nginx/Plesk)
- **Puerto del host**: Asignado por Plesk o Docker (ej: `32770`)

## 🔧 Configuración en Plesk

### Paso 1: Verificar el puerto del contenedor

```bash
# En el servidor, ejecutar:
docker ps | grep miconcesionaria
```

Deberías ver algo como:
```
0.0.0.0:32770->3021/tcp
```

El puerto `32770` es el puerto del host que apunta al puerto `3021` del contenedor.

### Paso 2: Configurar Nginx en Plesk

1. **Acceder a Plesk** → Tu dominio → **"Apache & nginx Settings"**

2. **Habilitar "Proxy mode"** (si no está habilitado)

3. **En "Additional nginx directives"**, agregar:

```nginx
location / {
    proxy_pass http://127.0.0.1:32770;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # Timeouts para evitar errores
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

**⚠️ IMPORTANTE**: Reemplazar `32770` con el puerto que veas en `docker ps`.

### Paso 3: Configurar SSL/HTTPS

1. **En Plesk** → Tu dominio → **"SSL/TLS Certificates"**

2. **Instalar certificado Let's Encrypt**:
   - Clic en "Get a free certificate from Let's Encrypt"
   - Seleccionar el dominio
   - Ingresar email
   - Clic en "Install"

3. **Forzar redirección HTTPS**:
   - En "SSL/TLS Settings"
   - Activar "Redirect from HTTP to HTTPS"

### Paso 4: Verificar configuración

```bash
# Verificar que Nginx no tenga errores
nginx -t

# Recargar Nginx (si es necesario)
systemctl reload nginx
```

## 🔍 Verificación

### 1. Verificar que el contenedor esté corriendo

```bash
docker ps | grep miconcesionaria
```

Debería mostrar:
```
CONTAINER ID   IMAGE                              PORTS
xxxxx          gmsastre/miconcesionaria:latest    0.0.0.0:32770->3021/tcp
```

### 2. Verificar que la aplicación responda

```bash
# Desde el servidor
curl http://localhost:32770/api/health
```

### 3. Verificar acceso HTTPS

```bash
# Desde el servidor
curl -k https://localhost/api/health

# O desde tu máquina local
curl https://tu-dominio.com/api/health
```

### 4. Acceder desde el navegador

- Abrir: `https://tu-dominio.com`
- Deberías ver la aplicación funcionando con SSL

## 🚨 Solución de Problemas

### Error: "502 Bad Gateway"

**Causa**: Nginx no puede conectarse al contenedor.

**Solución**:
1. Verificar que el contenedor esté corriendo: `docker ps`
2. Verificar el puerto correcto en la configuración de Nginx
3. Verificar que el puerto no esté bloqueado por firewall

### Error: "Connection refused"

**Causa**: El contenedor no está escuchando en el puerto correcto.

**Solución**:
1. Verificar logs del contenedor: `docker logs miconcesionaria`
2. Verificar que la variable `PORT=3021` esté configurada en Plesk
3. Reiniciar el contenedor desde Plesk

### El contenedor usa puerto 3000 en lugar de 3021

**Causa**: La imagen antigua o falta la variable de entorno.

**Solución**:
1. En Plesk, agregar variable de entorno: `PORT=3021`
2. O actualizar la imagen: `docker pull gmsastre/miconcesionaria:latest`
3. Reiniciar el contenedor

### SSL no funciona

**Causa**: Certificado no instalado o configuración incorrecta.

**Solución**:
1. Verificar que el certificado esté instalado en Plesk
2. Verificar que la redirección HTTPS esté habilitada
3. Verificar DNS apunta al servidor correcto

## 📝 Configuración Completa de Ejemplo

Si tu contenedor está mapeado a `0.0.0.0:32770->3021/tcp`, la configuración completa sería:

**En Plesk → Apache & nginx Settings → Additional nginx directives:**

```nginx
# Proxy reverso al contenedor
location / {
    proxy_pass http://127.0.0.1:32770;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # Buffer settings
    proxy_buffering off;
    proxy_request_buffering off;
}
```

## ✅ Checklist Final

- [ ] Contenedor corriendo en puerto 3021
- [ ] Variable `PORT=3021` configurada en Plesk
- [ ] Nginx configurado con `proxy_pass` al puerto correcto del host
- [ ] Certificado SSL instalado
- [ ] Redirección HTTP → HTTPS habilitada
- [ ] Aplicación accesible en `https://tu-dominio.com`

---

**¡Listo! Tu aplicación ahora es accesible por HTTPS en el puerto 443! 🔒**

