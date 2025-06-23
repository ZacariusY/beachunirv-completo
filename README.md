# BeachUnirv - Projetos Separados

Repositório com frontend e backend **separados** para o sistema BeachUnirv.

## 📁 Estrutura do Repositório

```
beachunirv-completo/
├── frontend/              # Projeto Next.js completo
│   ├── app/               # Páginas e rotas
│   ├── components/        # Componentes React
│   ├── lib/               # Utilitários
│   ├── hooks/             # Hooks customizados
│   ├── actions/           # Server Actions
│   ├── package.json       # Dependências frontend
│   └── ...               # Configurações Next.js
├── backend/               # Projeto Express completo
│   ├── src/               # Código TypeScript
│   │   ├── server.ts      # Servidor principal
│   │   ├── controller/    # Controllers
│   │   └── routes/        # Rotas API
│   ├── package.json       # Dependências backend
│   └── tsconfig.json      # Configuração TypeScript
└── README.md              # Este arquivo
```

## 🚀 Como Executar os Projetos

### 🎨 Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
**URL**: `http://localhost:3000`
**Página de teste**: `http://localhost:3000/teste`

### ⚙️ Backend (Express)
```bash
cd backend
npm install
npm run dev
```
**URL**: `http://localhost:3001`
**Health check**: `http://localhost:3001/api/health`

## 🔧 Configuração

### Credenciais de Teste
- **Email**: `teste@beachunirv.com`
- **Senha**: `123456`

### Endpoints da API
- `GET /api/health` - Health check
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify` - Verificar token

## ✨ Funcionalidades Implementadas

### Frontend
- ✅ Sistema de autenticação com localStorage
- ✅ Hook `useAuth` personalizado
- ✅ Actions automatizadas para tokens
- ✅ Interface moderna com Tailwind CSS
- ✅ Componentes reutilizáveis (shadcn/ui)
- ✅ Página de teste completa

### Backend
- ✅ API RESTful com Express + TypeScript
- ✅ Autenticação JWT
- ✅ CORS configurado
- ✅ Estrutura modular (controllers/routes)
- ✅ Health check endpoint

## 📱 Como Testar

1. **Inicie o backend**: `cd backend && npm run dev`
2. **Inicie o frontend**: `cd frontend && npm run dev`
3. **Acesse**: `http://localhost:3000/teste`
4. **Faça login** com as credenciais de teste
5. **Verifique** o token no localStorage

## 🏗️ Tecnologias

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Axios

### Backend
- Express.js
- TypeScript
- CORS
- ts-node

## 📝 Sistema de Autenticação

- **TokenManager**: Classe para gerenciar localStorage
- **useAuth**: Hook React para estados de autenticação
- **Actions**: Recuperação automática de tokens
- **JWT**: Autenticação segura entre frontend e backend

## 🎯 Próximos Passos

- [ ] Integração com PostgreSQL
- [ ] Sistema de cadastro
- [ ] Gerenciamento de equipamentos
- [ ] Sistema de empréstimos
- [ ] Dashboard administrativo

---

## 📋 Resumo Rápido

**Dois projetos independentes:**
- `frontend/` → Next.js na porta 3000
- `backend/` → Express na porta 3001

**Teste rápido:**
```bash
# Terminal 1
cd backend && npm install && npm run dev

# Terminal 2  
cd frontend && npm install && npm run dev

# Browser
http://localhost:3000/teste
``` 