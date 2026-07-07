#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="${ROOT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
BACKEND_DIR="${BACKEND_DIR:-$ROOT_DIR/equipment-control-api}"
FRONTEND_DIR="${FRONTEND_DIR:-$ROOT_DIR/frontend}"
PM2_APP_NAME="${PM2_APP_NAME:-axis-api}"
FRONTEND_PM2_NAME="${FRONTEND_PM2_NAME:-axis-front}"
FRONTEND_PORT="${FRONTEND_PORT:-3001}"
PORT="${PORT:-3000}"

SKIP_INSTALL=0
SKIP_MIGRATE=0
SKIP_FRONTEND=0

log() {
  printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1"
}

fail() {
  printf '\n[ERRO] %s\n' "$1" >&2
  exit 1
}

usage() {
  cat <<'EOF'
Uso: ./deploy.sh [opcoes]

Opcoes:
  --skip-install    Pula a instalacao de dependencias
  --skip-migrate    Pula o prisma migrate deploy
  --skip-frontend   Pula install/build/restart do frontend
  -h, --help        Exibe esta ajuda

Variaveis de ambiente:
  ROOT_DIR          Diretorio raiz do projeto
  BACKEND_DIR       Diretorio do backend
  FRONTEND_DIR      Diretorio do frontend
  PM2_APP_NAME      Nome do processo do backend no PM2
  FRONTEND_PM2_NAME Nome do processo do frontend no PM2
  FRONTEND_PORT     Porta do frontend servido pelo PM2
  PORT              Porta da API
EOF
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Comando obrigatorio nao encontrado: $1"
}

install_dependencies() {
  local dir="$1"

  [[ -d "$dir" ]] || fail "Diretorio nao encontrado: $dir"

  if [[ -f "$dir/package-lock.json" ]]; then
    (cd "$dir" && npm ci)
  else
    (cd "$dir" && npm install)
  fi
}

restart_backend_pm2() {
  if pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
    pm2 restart "$PM2_APP_NAME" --update-env
  else
    (
      cd "$BACKEND_DIR"
      pm2 start npm --name "$PM2_APP_NAME" -- run start:prod
    )
  fi
}

restart_frontend_pm2() {
  pm2 delete "$FRONTEND_PM2_NAME" >/dev/null 2>&1 || true
  pm2 serve "$FRONTEND_DIR/build" "$FRONTEND_PORT" --spa --name "$FRONTEND_PM2_NAME"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-install)
      SKIP_INSTALL=1
      ;;
    --skip-migrate)
      SKIP_MIGRATE=1
      ;;
    --skip-frontend)
      SKIP_FRONTEND=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      fail "Opcao invalida: $1"
      ;;
  esac
  shift
done

require_command npm
require_command npx
require_command pm2

[[ -f "$BACKEND_DIR/package.json" ]] || fail "package.json do backend nao encontrado em $BACKEND_DIR"
[[ -f "$FRONTEND_DIR/package.json" ]] || fail "package.json do frontend nao encontrado em $FRONTEND_DIR"

log "Iniciando deploy do CONTROLE_EQUIPAMENTOS"
log "ROOT_DIR=$ROOT_DIR"
log "BACKEND_DIR=$BACKEND_DIR"
log "FRONTEND_DIR=$FRONTEND_DIR"
log "PM2_APP_NAME=$PM2_APP_NAME"
log "FRONTEND_PM2_NAME=$FRONTEND_PM2_NAME"

if [[ "$SKIP_FRONTEND" -eq 0 ]]; then
  log "Frontend: instalando dependencias"
  if [[ "$SKIP_INSTALL" -eq 0 ]]; then
    install_dependencies "$FRONTEND_DIR"
  else
    log "Frontend: instalacao pulada"
  fi

  log "Frontend: gerando build"
  (cd "$FRONTEND_DIR" && npm run build)

  log "Frontend: reiniciando processo no PM2"
  restart_frontend_pm2
else
  log "Frontend: etapa ignorada"
fi

log "Backend: instalando dependencias"
if [[ "$SKIP_INSTALL" -eq 0 ]]; then
  install_dependencies "$BACKEND_DIR"
else
  log "Backend: instalacao pulada"
fi

log "Backend: gerando Prisma Client"
(cd "$BACKEND_DIR" && npx prisma generate)

if [[ "$SKIP_MIGRATE" -eq 0 ]]; then
  log "Backend: aplicando migrations"
  (cd "$BACKEND_DIR" && npx prisma migrate deploy)
else
  log "Backend: migrations puladas"
fi

log "Backend: gerando build"
(cd "$BACKEND_DIR" && npm run build)

log "Backend: reiniciando processo no PM2"
restart_backend_pm2

log "PM2: salvando estado"
pm2 save

log "PM2: status atual"
pm2 status

log "Deploy finalizado com sucesso na porta $PORT"
