#!/bin/bash

# Script de diagnóstico para Prisma en producción
echo "🔍 Diagnóstico de Prisma en Producción"
echo "======================================"

# 1. Verificar variables de entorno
echo "📋 Variables de entorno:"
echo "NODE_ENV: ${NODE_ENV:-'No definida'}"
echo "DATABASE_URL: ${DATABASE_URL:-'No definida'}"

# 2. Verificar si Prisma puede conectarse
echo ""
echo "🗄️ Verificando conexión a base de datos..."
if command -v npx &> /dev/null; then
    echo "✅ npx disponible"
    
    # Verificar estado de la base de datos
    echo "🔍 Verificando estado de la base de datos..."
    npx prisma db pull --print 2>&1 | head -20
    
    # Verificar tablas existentes
    echo ""
    echo "📊 Verificando tablas existentes..."
    npx prisma db execute --stdin <<< "SHOW TABLES;" 2>/dev/null || echo "❌ No se pudo ejecutar SHOW TABLES"
    
else
    echo "❌ npx no disponible"
fi

# 3. Verificar archivo prisma.ts
echo ""
echo "📁 Verificando archivo prisma.ts:"
if [ -f "src/lib/prisma.ts" ]; then
    echo "✅ Archivo encontrado"
    echo "📝 Contenido actual:"
    cat src/lib/prisma.ts
else
    echo "❌ Archivo no encontrado"
fi

# 4. Verificar versión de Prisma
echo ""
echo "📦 Versión de Prisma:"
npx prisma --version 2>/dev/null || echo "❌ No se pudo obtener versión"

echo ""
echo "✅ Diagnóstico completado"
