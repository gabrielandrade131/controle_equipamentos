Write-Host "Iniciando deploy do CONTROLE_EQUIPAMENTOS no Windows..." -ForegroundColor Cyan

$ROOT_DIR = $PSScriptRoot
if ([string]::IsNullOrEmpty($ROOT_DIR)) {
    $ROOT_DIR = Get-Location
}

# Frontend
Write-Host "`n--- Frontend ---" -ForegroundColor Yellow
Write-Host "Acessando diretório frontend..."
Set-Location -Path "$ROOT_DIR\frontend"

Write-Host "Instalando dependências..."
npm install

Write-Host "Gerando build de produção..."
npm run build

Write-Host "Reiniciando processo frontend no PM2..."
& pm2 delete axis-front 2>$null
try {
    $conn = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
    if ($conn) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }
} catch {}
& pm2 serve "$ROOT_DIR\frontend\build" 3001 --spa --name axis-front

# Backend
Write-Host "`n--- Backend ---" -ForegroundColor Yellow
Write-Host "Acessando diretório equipment-control-api..."
Set-Location -Path "$ROOT_DIR\equipment-control-api"

Write-Host "Instalando dependências..."
npm install

Write-Host "Gerando Prisma Client..."
npx prisma generate

Write-Host "Aplicando migrations no banco de dados..."
npx prisma migrate deploy

Write-Host "Gerando build de produção..."
npm run build

Write-Host "Reiniciando processo backend no PM2..."
try {
    $conn3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($conn3000) {
        Stop-Process -Id $conn3000.OwningProcess -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }
} catch {}

$pm2Desc = & pm2 describe axis-api 2>$null
if ($LASTEXITCODE -eq 0 -and $pm2Desc) {
    & pm2 restart axis-api --update-env
} else {
    & pm2 start dist/src/main.js --name axis-api
}

# Finalizando
Write-Host "`n--- PM2 ---" -ForegroundColor Yellow
Write-Host "Salvando estado do PM2..."
& pm2 save

Write-Host "Status atual dos processos:"
& pm2 status

Write-Host "`nDeploy finalizado com sucesso!" -ForegroundColor Green
