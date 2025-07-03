# 🔑 CHAVES STRIPE PARA VERCEL

## 📋 **Copie e Cole Estas Variáveis no Vercel:**

### **1. Chave Pública (Frontend)**
```
Name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_live_51RfF9JBuYZD4v2rukDzLae60bXA4a9jPPunOzvpTfDSybLNOnDrTKlwPpgfBo7IOGeS9LFPNDBVCVSHZ9BMOan5H00pw7euCrM
Environment: Production, Preview, Development
```

### **2. Chave Secreta (Backend)**
```
Name: STRIPE_SECRET_KEY
Value: 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
Environment: Production, Preview, Development
```

### **3. Webhook Secret** ⚠️ **IMPORTANTE: Configurar**
```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_[PRECISA_CONFIGURAR_NO_STRIPE]
Environment: Production, Preview, Development
```

### **4. Price ID do Plano PRO**
```
Name: STRIPE_PRO_PRICE_ID
Value: price_1RfG9UBuYZD4v2rulRIZWc8B
Environment: Production, Preview, Development
```

---

## ⚠️ **ATENÇÃO: Webhook Secret**

O `STRIPE_WEBHOOK_SECRET` está incompleto. Você precisa:

1. **Ir no Stripe Dashboard:** https://dashboard.stripe.com/webhooks
2. **Encontrar seu endpoint:** https://financepro.vercel.app/api/stripe/webhook
3. **Copiar o "Signing secret"** que começa com `whsec_...`
4. **Substituir** na variável acima

---

## 🚀 **COMO APLICAR NO VERCEL:**

### **Passo 1: Acesse**
- https://vercel.com/dashboard
- Projeto: financepro
- Settings → Environment Variables

### **Passo 2: Adicione (uma por vez)**
- Clique "Add New"
- Cole Name e Value exatos acima
- Selecione todos os ambientes
- Save

### **Passo 3: Redeploy**
- Deployments → Redeploy último

---

## ✅ **VARIÁVEIS SUPABASE (Já configuradas):**

Se precisar reconfigurar o Supabase também:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://ejawwxkksovclhkpjcxx.supabase.co
Environment: Production, Preview, Development
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqYXd3eGtrc292Y2xoa3BqY3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5OTU0ODksImV4cCI6MjA2NjU3MTQ4OX0.yuKI6aHLcEaIvZw1Bdpkbl1zmGfGhPEl22xSlHLyagA
Environment: Production, Preview, Development
```

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqYXd3eGtrc292Y2xoa3BqY3h4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk5NTQ4OSwiZXhwIjoyMDY2NTcxNDg5fQ.rkuK1-9HUp1I93CYTPsmfa4Z2pUeiJXTvjeJK_By4yE
Environment: Production, Preview, Development
```

---

## 🧪 **TESTAR APÓS CONFIGURAR:**

1. **Redeploy no Vercel**
2. **Teste:** https://financepro.vercel.app/api/test-stripe
3. **Resultado esperado:** `"status": "success"`

---

## ⚡ **RESUMO: 4 Variáveis Stripe**
1. ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Pronta
2. ✅ `STRIPE_SECRET_KEY` - Pronta  
3. ⚠️ `STRIPE_WEBHOOK_SECRET` - **Precisa configurar webhook**
4. ✅ `STRIPE_PRO_PRICE_ID` - Pronta

**3 de 4 prontas! Só falta o webhook secret.** 🎯 