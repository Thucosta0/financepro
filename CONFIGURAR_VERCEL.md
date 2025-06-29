# 🚀 Configurar Credenciais no Vercel

## ❌ **Problema Atual:**
- Build falha no Vercel porque não tem as variáveis do Stripe
- Página de planos não funciona em produção

## ✅ **Solução: Configurar Environment Variables**

---

## 📋 **Variáveis Necessárias:**

### **1. Stripe (Pagamentos)**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
```

### **2. Supabase (Já configurado)**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔧 **PASSO A PASSO:**

### **1. Acesse Vercel Dashboard**
```
🌐 https://vercel.com/dashboard
📁 Clique no projeto "financepro"
⚙️ Vá em "Settings" (na aba superior)
```

### **2. Abra Environment Variables**
```
📝 Settings → Environment Variables
➕ Clique em "Add New"
```

### **3. Adicione uma por vez:**

**Variável 1: Chave Pública do Stripe**
```
Name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_test_51... (sua chave pública)
Environment: Production, Preview, Development
```

**Variável 2: Chave Secreta do Stripe**
```
Name: STRIPE_SECRET_KEY
Value: sk_test_51... (sua chave secreta)
Environment: Production, Preview, Development
```

**Variável 3: Webhook Secret**
```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_... (secret do webhook)
Environment: Production, Preview, Development
```

**Variável 4: Price ID do Plano PRO**
```
Name: STRIPE_PRO_PRICE_ID
Value: price_... (ID do produto no Stripe)
Environment: Production, Preview, Development
```

---

## 🔍 **Onde Encontrar as Chaves:**

### **No Stripe Dashboard** ([dashboard.stripe.com](https://dashboard.stripe.com)):

1. **API Keys:** 
   - Menu lateral → "API keys"
   - `pk_test_...` = Publishable key
   - `sk_test_...` = Secret key

2. **Webhook Secret:**
   - Menu lateral → "Webhooks"
   - Clique no seu endpoint
   - "Signing secret" → `whsec_...`

3. **Price ID:**
   - Menu lateral → "Products"
   - Clique no seu produto FinancePRO
   - Copie o Price ID → `price_...`

---

## 🧪 **Testar Configuração:**

### **1. Redeploy no Vercel**
Após adicionar as variáveis:
```
⚙️ Vercel → Deployments
🔄 Clique "Redeploy" no último deployment
```

### **2. Testar Endpoint**
Acesse no navegador:
```
https://financepro.vercel.app/api/test-stripe
```

**Resultado esperado:**
```json
{
  "status": "success",
  "message": "Stripe configurado corretamente!",
  "account": {
    "id": "acct_...",
    "business_profile": "..."
  }
}
```

---

## ⚡ **Checklist Rápido:**

- [ ] Acessar Vercel Dashboard
- [ ] Ir em Settings → Environment Variables
- [ ] Adicionar `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Adicionar `STRIPE_SECRET_KEY`
- [ ] Adicionar `STRIPE_WEBHOOK_SECRET`
- [ ] Adicionar `STRIPE_PRO_PRICE_ID`
- [ ] Redeploy o projeto
- [ ] Testar `/api/test-stripe`
- [ ] Testar página de planos

---

## 🎯 **Resultado Final:**
- ✅ Build passa no Vercel
- ✅ Página de planos funciona
- ✅ Upgrade/checkout funciona
- ✅ Sistema de pagamentos ativo 