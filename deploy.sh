#!/bin/bash

set -e

echo "===================================="
echo " Iniciando deploy geral do Axis"
echo "===================================="

ROOT_DIR="/var/www/html/controle_equipamentos"

BACKEND_DIR="$ROOT_DIR/equipment-control-api"
FRONTEND_DIR="$ROOT_DIR/frontend"

BACKEND_PM2_NAME="axis-api"
FRONTEND_PM2_NAME="axis-front"

echo ""
echo "===================================="
echo " Deploy Backend - Axis API"
echo "===================================="

cd "$BACKEND_DIR"

echo ""
echo "1. Instalando dependências do backend..."
npm install

echo ""
echo "2. Gerando Prisma Client..."
npx prisma generate

echo ""
echo "3. Aplicando migrations..."
npx prisma migrate deploy

echo ""
echo "4. Gerando build do backend..."
npm run build

echo ""
echo "5. Reiniciando backend no PM2..."
pm2 restart "$BACKEND_PM2_NAME" || pm2 start dist/main.js --name "$BACKEND_PM2_NAME"

echo ""
echo "===================================="
echo " Deploy Frontend - Axis Web"
echo "===================================="

cd "$FRONTEND_DIR"

echo ""
echo "6. Instalando dependências do frontend..."
npm install

echo ""
echo "7. Gerando build do frontend..."
npm run build

echo ""
echo "8. Reiniciando frontend no PM2..."
pm2 restart "$FRONTEND_PM2_NAME" || pm2 start npm --name "$FRONTEND_PM2_NAME" -- run preview -- --host 0.0.0.0

echo ""
echo "9. Salvando estado do PM2..."
pm2 save

echo ""
echo "10. Status atual:"
pm2 status

echo ""
echo "===================================="
echo " Deploy geral finalizado com sucesso"
echo "===================================="
