@echo off
echo.
echo ================================================
echo    FINANCEPRO - INICIADOR AUTOMATICO
echo ================================================
echo.

echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado!
    echo Instale em: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo OK - Node.js encontrado
)

echo.
echo [2/4] Instalando dependencias...
call npm install
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias
    pause
    exit /b 1
) else (
    echo OK - Dependencias instaladas
)

echo.
echo [3/4] Verificando configuracao...
if not exist ".env.local" (
    echo Criando arquivo .env.local...
    echo # Configuracoes do Supabase > .env.local
    echo NEXT_PUBLIC_SUPABASE_URL=https://sua-url-do-projeto.supabase.co >> .env.local
    echo NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui >> .env.local
    echo. >> .env.local
    echo # Configuracoes da aplicacao >> .env.local
    echo NEXTAUTH_SECRET=desenvolvimento_secret_%RANDOM% >> .env.local
    echo NEXTAUTH_URL=http://localhost:3000 >> .env.local
    echo.
    echo IMPORTANTE: Configure as variaveis do Supabase no arquivo .env.local
    echo 1. Acesse https://supabase.com/dashboard
    echo 2. Va em Settings ^> API
    echo 3. Copie Project URL e anon public key
    echo.
    pause
) else (
    echo OK - Arquivo .env.local encontrado
)

echo.
echo [4/4] Iniciando servidor...
echo.
echo Servidor iniciando em: http://localhost:3000
echo Pressione Ctrl+C para parar o servidor
echo.
call npm run dev 