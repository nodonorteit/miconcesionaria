# 🚗 Mi Concesionaria - Sistema de Gestión

Sistema completo de gestión para concesionaria de vehículos desarrollado con Next.js, TypeScript, Prisma y Docker.

## ✨ Características

### 🚙 Gestión de Vehículos
- **ABM completo** de vehículos
- Carga de múltiples fotos por vehículo
- Gestión de tipos de vehículos
- Estado de inventario

### 👥 Gestión de Personas
- **ABM de clientes**
- **ABM de vendedores**
- **ABM de usuarios del sistema**
- **ABM de proveedores**
- **ABM de talleres**

### 💰 Gestión Comercial
- **ABM de boletos de compraventa**
- Generación de recibos por venta
- Envío de boletos por email
- Gestión de comisiones a vendedores
- Flujo de caja y pagos

### 📊 Dashboard y Reportes
- Estadísticas de ventas
- Estado del inventario
- Reportes financieros

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: Tailwind CSS, Radix UI, Lucide Icons
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js
- **Email**: Nodemailer
- **Contenedores**: Docker & Docker Compose
- **Deployment**: Ubuntu Server con Plesk

## 🚀 Instalación Local

### Prerrequisitos
- Node.js 18+
- Docker y Docker Compose
- Git

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/miconcesionaria.git
cd miconcesionaria
```

2. **Configurar variables de entorno**
```bash
cp env.example .env
# Editar .env con tus configuraciones
```

3. **Ejecutar con Docker**
```bash
docker-compose up --build -d
```

4. **Inicializar la base de datos**
```bash
# Ejecutar migraciones
docker-compose exec app npx prisma migrate dev

# Poblar con datos iniciales
docker-compose exec app npx prisma db seed
```

5. **Acceder a la aplicación**
```
http://localhost:3000
```

### Credenciales por defecto
- **Email**: admin@miconcesionaria.com
- **Contraseña**: admin123

## 🌐 Despliegue en Producción

### Con Plesk

1. **Subir el código al servidor**
```bash
git clone https://github.com/tu-usuario/miconcesionaria.git
cd miconcesionaria
```

2. **Configurar variables de producción**
```bash
cp env.production.example .env.production
# Editar .env.production con las configuraciones reales
```

3. **Ejecutar el script de despliegue**
```bash
./scripts/deploy.sh
```

### Configuración de Plesk

1. **Crear un dominio/subdominio**
2. **Configurar proxy reverso**:
   - Puerto origen: 3000
   - Protocolo: HTTP
3. **Configurar SSL** (recomendado)
4. **Configurar backups** automáticos

## 📁 Estructura del Proyecto

```
miconcesionaria/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API Routes
│   │   ├── auth/           # Páginas de autenticación
│   │   └── globals.css     # Estilos globales
│   ├── components/         # Componentes React
│   │   ├── auth/          # Componentes de autenticación
│   │   └── ui/            # Componentes de UI
│   ├── lib/               # Utilidades y configuración
│   └── types/             # Tipos TypeScript
├── prisma/                # Esquema y migraciones de BD
├── uploads/               # Archivos subidos
├── scripts/               # Scripts de utilidad
├── docker-compose.yml     # Configuración de desarrollo
├── docker-compose.prod.yml # Configuración de producción
└── Dockerfile             # Imagen Docker
```

## 🔧 Comandos Útiles

### Desarrollo
```bash
# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar tests
npm run test

# Verificar tipos
npm run type-check
```

### Base de Datos
```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Ver datos en la BD
npx prisma studio

# Poblar con datos de prueba
npx prisma db seed
```

### Docker
```bash
# Construir imagen
docker-compose build

# Ejecutar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## 📧 Configuración de Email

Para el envío de boletos por email, configura las variables SMTP en tu archivo `.env`:

```env
SMTP_HOST=smtp.tu-proveedor.com
SMTP_PORT=587
SMTP_USER=tu-email@tu-dominio.com
SMTP_PASS=tu-password-email
```

## 🔒 Seguridad

- **Autenticación**: NextAuth.js con JWT
- **Contraseñas**: Hasheadas con bcrypt
- **Variables de entorno**: Configuradas para producción
- **CORS**: Configurado para el dominio de producción
- **SSL**: Recomendado para producción

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

## 🎯 Roadmap

- [ ] Dashboard con gráficos avanzados
- [ ] App móvil
- [ ] Integración con APIs de vehículos
- [ ] Sistema de notificaciones push
- [ ] Reportes PDF automáticos
- [ ] Integración con sistemas contables

---

**Desarrollado con ❤️ para concesionarias** 