# 💰 FinancePRO

<div align="center">
  <img src="public/favicon.svg" alt="FinancePRO Logo" width="100" height="100">
  <h3>Gestão Financeira Completa e Inteligente</h3>
  <p>Controle suas finanças de forma profissional com o FinancePRO</p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Latest-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
</div>

---

## 🚀 **Sobre o Projeto**

O **FinancePRO** é uma aplicação web moderna e completa para gestão financeira pessoal, desenvolvida com foco em **segurança**, **usabilidade** e **performance**. Oferece controle total sobre receitas, despesas, cartões, orçamentos e muito mais.

### ✨ **Principais Características**

- 🔐 **Segurança Avançada** - Row Level Security (RLS) em todas as operações
- 📊 **Dashboard Inteligente** - Gráficos e estatísticas em tempo real
- 💳 **Gestão de Cartões** - Controle completo de cartões e contas
- 🎯 **Orçamentos Inteligentes** - Monitoramento e alertas automáticos
- 🤖 **Assistente IA** - Dicas e consultoria financeira personalizada
- 📱 **Responsivo** - Funciona perfeitamente em todos os dispositivos
- 🔄 **Transações Recorrentes** - Automatização de lançamentos fixos
- 📈 **Relatórios Avançados** - Exportação em CSV e PDF

---

## 🛠️ **Stack Tecnológica**

### **Frontend**
- **Next.js 15.3.4** - Framework React com App Router
- **React 19** - Biblioteca para interfaces de usuário
- **TypeScript 5** - Tipagem estática para JavaScript
- **Tailwind CSS 3.4** - Framework de CSS utilitário
- **Lucide React** - Ícones modernos e otimizados
- **Recharts** - Gráficos e visualizações

### **Backend**
- **Supabase** - Backend-as-a-Service completo
- **PostgreSQL** - Banco de dados relacional robusto
- **Row Level Security (RLS)** - Segurança em nível de linha
- **Supabase Auth** - Autenticação segura e escalável
- **Supabase Storage** - Armazenamento de arquivos

### **Integrações**
- **OpenAI API** - Assistente IA para consultoria financeira
- **PWA** - Progressive Web App

---

## 🎯 **Funcionalidades Principais**

### 🔐 **Autenticação & Segurança**
- ✅ Login com email ou username
- ✅ Cadastro com verificação de email
- ✅ Redefinição de senha segura
- ✅ Sessões persistentes e auto-refresh
- ✅ Políticas RLS para isolamento de dados
- ✅ Proteção contra ataques comuns

### 📊 **Dashboard**
- ✅ Visão geral das finanças
- ✅ Gráficos interativos de receitas/despesas
- ✅ Estatísticas mensais e anuais
- ✅ Cartões de resumo financeiro
- ✅ Indicadores de performance

### 💳 **Gestão de Cartões**
- ✅ Cadastro de cartões de crédito/débito
- ✅ Controle de limites e bandeiras
- ✅ Histórico de transações por cartão
- ✅ Status ativo/inativo
- ✅ Últimos dígitos mascarados

### 💰 **Transações**
- ✅ Lançamento de receitas e despesas
- ✅ Categorização automática
- ✅ Transações recorrentes
- ✅ Filtros avançados (data, categoria, valor, cartão)
- ✅ Busca por descrição
- ✅ Exportação de relatórios (CSV/PDF)

### 🎯 **Orçamentos**
- ✅ Definição de limites por categoria
- ✅ Acompanhamento em tempo real
- ✅ Alertas de gastos excessivos
- ✅ Progressão visual com barras
- ✅ Dicas financeiras diárias (31 dicas diferentes)

### 🏷️ **Categorias**
- ✅ Categorias personalizáveis
- ✅ Ícones e cores customizados
- ✅ Separação receitas/despesas
- ✅ Categorias padrão automáticas

### 🤖 **Assistente IA**
- ✅ Consultoria financeira personalizada
- ✅ Análise de gastos e padrões
- ✅ Sugestões de economia
- ✅ Planejamento financeiro
- ✅ Integração com OpenAI

---

## 📦 **Instalação**

### **Pré-requisitos**
- Node.js 18+ 
- NPM ou Yarn
- Conta no Supabase
- Conta no OpenAI (opcional)

### **1. Clone o repositório**
```bash
git clone https://github.com/Thucosta0/financepro.git
cd financepro
```

### **2. Instale as dependências**
```bash
npm install
# ou
yarn install
```

### **3. Configure as variáveis de ambiente**
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_supabase

# OpenAI (opcional)
OPENAI_API_KEY=sua_chave_openai
```

### **4. Configure o banco de dados**
Execute os scripts SQL na ordem:
```sql
-- No SQL Editor do Supabase:
1. database/schema.sql      -- Estrutura das tabelas
2. database/seed.sql        -- Dados iniciais
3. database/setup-storage.sql -- Configuração de storage
```

### **5. Execute o projeto**
```bash
npm run dev
# ou
yarn dev
```

Acesse `http://localhost:3000` no seu navegador.

---

## 🎨 **Interface e UX**

### **Design System**
- 🎨 **Design moderno** com Tailwind CSS
- 🌈 **Paleta de cores** profissional
- 📱 **Mobile-first** e totalmente responsivo
- ♿ **Acessibilidade** seguindo padrões WCAG
- 🚫 **Zoom desabilitado** para experiência consistente

### **Componentes**
- 🔹 Botões e formulários padronizados
- 🔹 Modais e overlays elegantes
- 🔹 Tabelas responsivas
- 🔹 Gráficos interativos
- 🔹 Loading states e feedback visual

---

## 🔒 **Segurança**

### **Implementações de Segurança**
- 🛡️ **Row Level Security (RLS)** em todas as tabelas
- 🔐 **Autenticação JWT** com Supabase Auth
- 🚫 **Políticas granulares** de acesso aos dados
- 🔒 **Validação** no frontend e backend
- 📝 **Auditoria** de todas as operações
- 🚨 **Rate limiting** para prevenir ataques
- 🔄 **Refresh tokens** automáticos

### **Privacidade**
- 📊 **Dados isolados** por usuário
- 🔒 **Criptografia** em trânsito e repouso
- 🚫 **Zero compartilhamento** de dados pessoais
- 📱 **LGPD compliance** por design

---

## 📊 **Performance**

### **Otimizações**
- ⚡ **Next.js App Router** para navegação rápida
- 🗄️ **React Context** para gerenciamento de estado
- 📦 **Code splitting** automático
- 🖼️ **Lazy loading** de componentes
- 💾 **Cache** inteligente de dados
- 📱 **PWA** para experiência nativa

### **Métricas**
- 🚀 **Lighthouse Score** 90+
- ⚡ **First Contentful Paint** < 1.5s
- 📱 **Mobile-friendly** 100%
- ♿ **Accessibility** AA compliant

---

## 🔄 **API e Integrações**

### **Supabase APIs**
```javascript
// Exemplo de uso da API
import { supabase } from '@/lib/supabase-client'

// Buscar transações do usuário
const { data: transactions } = await supabase
  .from('transactions')
  .select('*, category:categories(*), card:cards(*)')
  .order('transaction_date', { ascending: false })
```

### **OpenAI Integration**
```javascript
// Assistente IA
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: 'Você é um consultor financeiro...' },
    { role: 'user', content: userQuestion }
  ]
})
```

---

## 📈 **Roadmap**

### **Próximas Funcionalidades**
- [ ] 📱 App mobile nativo (React Native)
- [ ] 🏦 Integração com Open Banking
- [ ] 📊 Relatórios avançados com BI
- [ ] 🔔 Notificações push
- [ ] 💹 Módulo de investimentos
- [ ] 🎯 Metas financeiras gamificadas
- [ ] 📄 Importação de extratos bancários
- [ ] 🌐 Múltiplas moedas
- [ ] 👥 Gestão familiar (múltiplos usuários)

### **Melhorias Técnicas**
- [ ] 🔄 Migração para Next.js 15
- [ ] 📊 Testes automatizados (Jest/Cypress)
- [ ] 🐳 Docker containerization
- [ ] 🚀 CI/CD pipeline
- [ ] 📈 Monitoring e analytics
- [ ] 🔍 SEO otimizado

---

## 🤝 **Contribuição**

Contribuições são sempre bem-vindas! Para contribuir:

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### **Padrões de Código**
- 📝 **TypeScript** obrigatório
- 🎨 **ESLint** + **Prettier** para formatação
- 📋 **Conventional Commits** para mensagens
- 🧪 **Testes** para novas funcionalidades
- 📚 **Documentação** atualizada

---

## 📄 **Licença**

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 **Desenvolvedor**

<div align="center">
  <img src="https://github.com/Thucosta0.png" alt="Thiago Costa" width="100" height="100" style="border-radius: 50%;">
  
  **Thiago Costa**  
  *Desenvolvedor Full Stack*
  
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/thucosta)
  [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Thucosta0)
</div>

---

## 🙏 **Agradecimentos**

- 🚀 **Next.js Team** - Framework incrível
- 💚 **Supabase** - Backend simplificado e poderoso
- 🎨 **Tailwind CSS** - CSS utilitário fantástico
- 🤖 **OpenAI** - IA que revoluciona a experiência
- 🌟 **Open Source Community** - Por todas as bibliotecas utilizadas

---

<div align="center">
  <h3>🚀 Desenvolvido com ❤️ e ☕</h3>
  <p>Se este projeto te ajudou, considere dar uma ⭐!</p>
</div> 