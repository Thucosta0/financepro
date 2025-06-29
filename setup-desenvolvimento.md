# 🛠️ Guia de Solução - FinancePRO

## 📋 Problemas Identificados

1. **ERR_CONNECTION_REFUSED**: Servidor não está rodando
2. **Erro na confirmação de email**: Possíveis problemas de configuração

## ✅ Soluções Implementadas

### 1. Configuração das Variáveis de Ambiente

Primeiro, crie o arquivo `.env.local` na raiz do projeto:

```bash
# Configurações do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://sua-url-do-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui

# Configurações da aplicação
NEXTAUTH_SECRET=seu_secret_super_seguro_aqui
NEXTAUTH_URL=http://localhost:3000
```

### 2. Comandos para Iniciar o Projeto

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

### 3. Verificação do Supabase

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em Settings > API
4. Copie:
   - Project URL
   - anon public key

### 4. Configuração de Email no Supabase

1. No Supabase Dashboard, vá em Authentication > Settings
2. Configure o Site URL para: `http://localhost:3000`
3. Em Redirect URLs, adicione: `http://localhost:3000/confirm-email`

## 🚀 Scripts de Inicialização

Execute os comandos na seguinte ordem:

```bash
# 1. Verificar se o Node.js está instalado
node --version

# 2. Instalar dependências
npm install

# 3. Verificar configuração
npm run lint

# 4. Iniciar o servidor
npm run dev
```

## 🔧 Resolução de Problemas Comuns

### Se o servidor não iniciar:
```bash
# Limpar cache do npm
npm cache clean --force

# Deletar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Se o erro de confirmação persistir:
1. Verifique se as URLs de redirecionamento estão corretas no Supabase
2. Confirme se o email está sendo enviado
3. Teste com um email diferente

## 📱 URLs de Acesso

- **Aplicação**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Cadastro**: http://localhost:3000/cadastro
- **Dashboard**: http://localhost:3000/dashboard

## 🆘 Suporte

Se os problemas persistirem:
1. Verifique os logs do console do navegador
2. Confirme se todas as variáveis de ambiente estão configuradas
3. Teste a conexão com o Supabase usando o arquivo de teste 