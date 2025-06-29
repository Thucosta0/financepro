# 🚀 Configuração de Produção - FinancePRO

## 🌐 Site em Produção
- **URL Principal**: https://financepro.dev.br
- **Plataforma**: Vercel
- **Status**: ✅ Online

## ⚙️ Configurações Necessárias no Supabase

### 1. **Authentication Settings**
No Dashboard do Supabase (https://supabase.com/dashboard):

1. Vá em **Authentication > Settings**
2. Configure:
   - **Site URL**: `https://financepro.dev.br`
   - **Redirect URLs**: 
     - `https://financepro.dev.br/confirm-email`
     - `https://financepro.dev.br/reset-password`
     - `http://localhost:3000/confirm-email` (para desenvolvimento)
     - `http://localhost:3000/reset-password` (para desenvolvimento)

### 2. **Variáveis de Ambiente no Vercel**
No painel do Vercel (https://vercel.com/dashboard):

1. Acesse o projeto FinancePRO
2. Vá em **Settings > Environment Variables**
3. Adicione:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://sua-url-do-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
   NEXTAUTH_SECRET=seu_secret_super_seguro_para_producao
   NEXTAUTH_URL=https://financepro.dev.br
   ```

### 3. **Email Templates (Opcional)**
No Supabase Dashboard:
1. Vá em **Authentication > Email Templates**
2. Personalize os templates para usar a marca FinancePRO
3. Configure as URLs de redirecionamento para `https://financepro.dev.br`

## 🔧 Problemas Comuns em Produção

### ❌ **Erro de Confirmação de Email**
- **Causa**: URLs de redirecionamento incorretas
- **Solução**: Verificar se `https://financepro.dev.br/confirm-email` está nas Redirect URLs

### ❌ **ERR_CONNECTION_REFUSED**
- **Causa**: Site tentando conectar com localhost
- **Solução**: Verificar variáveis de ambiente no Vercel

### ❌ **CORS Errors**
- **Causa**: Domínio não autorizado no Supabase
- **Solução**: Adicionar `financepro.dev.br` nas configurações de CORS

## 🛠️ Comandos para Deploy

### Deploy Manual:
```bash
# 1. Build local (opcional)
npm run build

# 2. Deploy via Vercel CLI
vercel --prod

# 3. Ou push para o branch main (auto-deploy)
git add .
git commit -m "fix: configurações de produção"
git push origin main
```

### Verificar Build:
```bash
# Testar build localmente
npm run build
npm run start
```

## 📋 Checklist de Produção

- [ ] ✅ Site acessível em https://financepro.dev.br
- [ ] ⚙️ Variáveis de ambiente configuradas no Vercel
- [ ] 🔗 URLs de redirecionamento atualizadas no Supabase
- [ ] 📧 Confirmação de email funcionando
- [ ] 🔐 Reset de senha funcionando
- [ ] 📱 Site responsivo em dispositivos móveis
- [ ] ⚡ Performance otimizada
- [ ] 🔍 SEO configurado

## 🆘 Suporte Rápido

### Se a confirmação de email não funcionar:
1. Verifique as Redirect URLs no Supabase
2. Teste com um email novo
3. Verifique os logs no Vercel

### Se houver erros de conexão:
1. Verifique as variáveis de ambiente
2. Confirme a URL do Supabase
3. Teste a API do Supabase

### Para debug em produção:
1. Acesse Vercel Dashboard > Functions > Logs
2. Monitore erros em tempo real
3. Use console.log temporários se necessário

## 🔄 Atualizações Futuras

Para fazer alterações:
1. Desenvolva localmente
2. Teste com `npm run dev`
3. Faça commit e push para deploy automático
4. Monitore logs no Vercel 