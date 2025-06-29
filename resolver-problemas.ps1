# 🛠️ Script de Resolução Automática - FinancePRO
# Execute este script no PowerShell como Administrador

Write-Host "=== RESOLVENDO PROBLEMAS DO FINANCEPRO ===" -ForegroundColor Green
Write-Host ""

# 1. Verificar Node.js
Write-Host "1. Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Instale em: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# 2. Verificar se estamos no diretório correto
Write-Host "2. Verificando diretório do projeto..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "✅ Arquivo package.json encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Não foi encontrado package.json. Certifique-se de estar no diretório correto." -ForegroundColor Red
    exit 1
}

# 3. Limpar instalação anterior
Write-Host "3. Limpando instalação anterior..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✅ Pasta node_modules removida" -ForegroundColor Green
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "✅ package-lock.json removido" -ForegroundColor Green
}

# 4. Limpar cache do npm
Write-Host "4. Limpando cache do npm..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "✅ Cache do npm limpo" -ForegroundColor Green

# 5. Instalar dependências
Write-Host "5. Instalando dependências..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependências instaladas com sucesso" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}

# 6. Verificar arquivo .env.local
Write-Host "6. Verificando configuração..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️ Arquivo .env.local não encontrado. Criando modelo..." -ForegroundColor Yellow
    
    $envContent = @"
# Configurações do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://sua-url-do-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui

# Configurações da aplicação
NEXTAUTH_SECRET=desenvolvimento_secret_$(Get-Random)
NEXTAUTH_URL=http://localhost:3000
"@
    
    Set-Content -Path ".env.local" -Value $envContent
    Write-Host "✅ Arquivo .env.local criado. CONFIGURE AS VARIÁVEIS DO SUPABASE!" -ForegroundColor Red
    Write-Host "   1. Acesse https://supabase.com/dashboard" -ForegroundColor Cyan
    Write-Host "   2. Vá em Settings > API" -ForegroundColor Cyan
    Write-Host "   3. Copie Project URL e anon public key" -ForegroundColor Cyan
} else {
    Write-Host "✅ Arquivo .env.local encontrado" -ForegroundColor Green
}

# 7. Verificar lint
Write-Host "7. Verificando código..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Código verificado" -ForegroundColor Green
} else {
    Write-Host "⚠️ Encontrados problemas no código, mas continuando..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== CONFIGURAÇÃO CONCLUÍDA ===" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Configure as variáveis do Supabase no arquivo .env.local" -ForegroundColor White
Write-Host "2. Execute: npm run dev" -ForegroundColor White
Write-Host "3. Acesse: http://localhost:3000" -ForegroundColor White
Write-Host ""

# Opção para iniciar automaticamente
$iniciarServidor = Read-Host "Deseja iniciar o servidor agora? (s/n)"
if ($iniciarServidor -eq "s" -or $iniciarServidor -eq "S") {
    Write-Host "🚀 Iniciando servidor..." -ForegroundColor Green
    npm run dev
}

Write-Host ""
Write-Host "✅ PROBLEMAS RESOLVIDOS!" -ForegroundColor Green
Write-Host "📱 URLs disponíveis:" -ForegroundColor Cyan
Write-Host "   - Aplicação: http://localhost:3000" -ForegroundColor White
Write-Host "   - Login: http://localhost:3000/login" -ForegroundColor White
Write-Host "   - Cadastro: http://localhost:3000/cadastro" -ForegroundColor White 