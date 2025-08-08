# 🌳 Estrategia de Branching

## 📊 Estructura de Branches

```
master (main)                    → Producción estable
├── staging                      → Testing antes de producción
├── dev                          → Desarrollo general
├── clientes/
│   ├── parana-automotores       → parana.automotores.nodonorte.com
│   ├── miconcesionaria          → miconcesionaria.nodonorte.com
│   └── [cliente-futuro]         → [dominio].nodonorte.com
└── features/
    ├── feature/nuevo-reporte
    ├── feature/mejoras-ui
    └── feature/integracion-api
```

## 🎯 Propósito de Cada Branch

### **🏭 master (main)**
- **Propósito**: Código de producción estable
- **Deploy**: Automático a producción
- **Acceso**: Solo merge desde staging
- **Protección**: Requiere PR y reviews

### **🧪 staging**
- **Propósito**: Testing antes de producción
- **Deploy**: Automático a staging environment
- **Acceso**: Merge desde dev o clientes
- **Protección**: Requiere PR

### **🛠️ dev**
- **Propósito**: Desarrollo general y features
- **Deploy**: Manual a desarrollo
- **Acceso**: Merge desde features
- **Protección**: Requiere PR

### **🏢 clientes/[nombre-cliente]**
- **Propósito**: Configuraciones específicas por cliente
- **Deploy**: Automático al dominio del cliente
- **Acceso**: Merge desde dev o features
- **Protección**: Requiere PR

### **✨ features/[nombre-feature]**
- **Propósito**: Desarrollo de features específicas
- **Deploy**: No deploy automático
- **Acceso**: Merge a dev o clientes
- **Protección**: Requiere PR

## 🔄 Flujo de Trabajo

### **🆕 Nuevo Feature**
```bash
# 1. Crear feature branch desde dev
git checkout dev
git pull origin dev
git checkout -b feature/nuevo-reporte

# 2. Desarrollar feature
# ... trabajar en el feature ...

# 3. Push y crear PR
git push origin feature/nuevo-reporte
# Crear PR a dev en GitHub
```

### **🏢 Nuevo Cliente**
```bash
# 1. Crear branch de cliente desde master
git checkout master
git checkout -b clientes/nuevo-cliente

# 2. Configurar cliente específico
# - Logo personalizado
# - Colores de marca
# - Configuraciones específicas
# - Dominio personalizado

# 3. Push y crear PR
git push origin clientes/nuevo-cliente
# Crear PR a master en GitHub
```

### **🚀 Deploy a Producción**
```bash
# 1. Merge dev a staging
git checkout staging
git merge dev
git push origin staging

# 2. Testing en staging
# ... probar en staging environment ...

# 3. Merge staging a master
git checkout master
git merge staging
git push origin master
```

## 🛠️ Comandos Útiles

### **📋 Ver Branches**
```bash
# Ver todos los branches
git branch -a

# Ver branches locales
git branch

# Ver branches remotos
git branch -r
```

### **🔄 Sincronizar Branches**
```bash
# Actualizar branch local
git checkout [branch-name]
git pull origin [branch-name]

# Crear branch desde remoto
git checkout -b [branch-name] origin/[branch-name]
```

### **🧹 Limpiar Branches**
```bash
# Eliminar branch local
git branch -d [branch-name]

# Eliminar branch remoto
git push origin --delete [branch-name]
```

## 🎨 Configuración por Cliente

### **📁 Estructura de Configuración**
```
src/
├── config/
│   ├── clients/
│   │   ├── parana-automotores/
│   │   │   ├── logo.svg
│   │   │   ├── colors.css
│   │   │   └── config.json
│   │   └── miconcesionaria/
│   │       ├── logo.svg
│   │       ├── colors.css
│   │       └── config.json
│   └── default/
│       ├── logo.svg
│       ├── colors.css
│       └── config.json
```

### **🔧 Variables de Entorno por Cliente**
```bash
# .env.parana-automotores
NEXT_PUBLIC_CLIENT_NAME="Paraná Automotores"
NEXT_PUBLIC_CLIENT_DOMAIN="parana.automotores.nodonorte.com"
NEXT_PUBLIC_CLIENT_LOGO="/config/clients/parana-automotores/logo.svg"

# .env.miconcesionaria
NEXT_PUBLIC_CLIENT_NAME="Mi Concesionaria"
NEXT_PUBLIC_CLIENT_DOMAIN="miconcesionaria.nodonorte.com"
NEXT_PUBLIC_CLIENT_LOGO="/config/clients/miconcesionaria/logo.svg"
```

## 🚨 Reglas Importantes

### **✅ Permitido**
- Crear feature branches desde dev
- Crear client branches desde master
- Merge features a dev
- Merge dev a staging
- Merge staging a master

### **❌ No Permitido**
- Merge directo a master
- Merge directo a staging
- Push directo a master
- Push directo a staging

## 📞 Soporte

Para dudas sobre la estrategia de branching:
1. Revisar esta documentación
2. Consultar con el equipo
3. Crear issue en GitHub

---

**Última actualización**: $(date)
**Versión**: 1.0 