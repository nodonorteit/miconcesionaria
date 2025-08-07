#!/bin/bash
set -e

echo "🔧 Corrigiendo URL del logo de la empresa en la base de datos..."

# Ejecutar el script dentro del contenedor Docker
docker-compose exec app node scripts/fix-company-logo-db.js

echo "✅ Corrección completada!"
echo ""
echo "📋 Para verificar que la corrección funcionó:"
echo "   - Revisa los logs del contenedor"
echo "   - Verifica que el logo se muestre correctamente en la aplicación"
echo ""
echo "🔄 Si necesitas reiniciar la aplicación:"
echo "   docker-compose restart app" 