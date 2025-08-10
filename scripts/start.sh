#!/bin/bash

# Script de inicio para Mi Concesionaria
# Usa PORT del entorno o default 3000

# Obtener puerto del entorno o usar default
PORT=${PORT:-3000}

echo "🚀 Iniciando Mi Concesionaria en puerto $PORT"
echo "🌍 Entorno: $NODE_ENV"
echo "🔗 URL: $NEXTAUTH_URL"

# Iniciar la aplicación
exec node server.js 