# Sistema Matriz - Cresci e Perdi

## 📋 Visão Geral

O **Sistema Matriz** é uma aplicação web completa para gestão de franquias da rede Cresci e Perdi, desenvolvida como uma Single Page Application (SPA) moderna. O sistema centraliza o gerenciamento de unidades, franqueados, colaboradores, clientes e operações administrativas, oferecendo controle granular de permissões e sincronização em tempo real.

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

**Frontend:**

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite com code splitting otimizado
- **UI Components:** Material-UI (MUI) v7
- **Estado do Servidor:** TanStack Query (React Query)
- **Roteamento:** React Router v6
- **Formulários:** React Hook Form + Zod
- **Gráficos:** Recharts
- **Ícones:** Lucide React
- **Notificações:** React Hot Toast

**Backend & Infraestrutura:**

- **Plataforma:** Supabase (PostgreSQL + Auth + Edge Functions)
- **Banco de Dados:** PostgreSQL com Row Level Security (RLS)
- **Autenticação:** Supabase Auth
- **Real-time:** Supabase Realtime subscriptions
- **Serverless:** Edge Functions (Deno/TypeScript)

**DevOps:**

- **Containerização:** Docker + Docker Compose
- **Proxy:** Nginx
- **Deploy:** Vercel

### Estrutura do Projeto

```markdown
📦 sistema-matriz/
├── 📁 src/
│   ├── 📁 pages/          # 13 páginas principais
│   ├── 📁 components/     # Componentes reutilizáveis
│   │   ├── auth/          # Proteção de rotas
│   │   ├── crud/          # DataTable genérica
│   │   ├── dashboard/     # Widgets do dashboard
│   │   ├── layout/        # Layout da aplicação
│   │   ├── modals/        # 35+ modais para CRUD
│   │   └── ui/            # Componentes base
│   ├── 📁 hooks/          # 25+ custom hooks
│   ├── 📁 integrations/   # Cliente Supabase
│   ├── 📁 theme/          # Tema MUI customizado
│   ├── 📁 types/          # Tipos TypeScript
│   └── 📁 utils/          # Utilitários
├── 📁 supabase/
│   ├── functions/         # 3 Edge Functions
│   └── migrations/        # 35+ migrações SQL
└── 📁 nginx/              # Configuração do proxy
```

## 🚀 Funcionalidades Principais

### 📊 Dashboard Executivo

- **KPIs em Tempo Real:** Total de unidades, franqueados ativos, colaboradores
- **Métricas Financeiras:** Performance e análises comparativas
- **Feed de Atividades:** Histórico de ações recentes no sistema
- **Gráficos de Performance:** Visualização das unidades de melhor desempenho

### 🏢 Gestão de Unidades

- CRUD completo com informações detalhadas
- Dados de contato, endereço e horários de funcionamento
- Configurações de integração (WhatsApp, sistemas externos)
- Filtros avançados e exportação de dados

### 👥 Gestão de Franqueados

- Cadastro completo com dados pessoais, profissionais e financeiros
- Sistema de vínculos franqueado-unidade (N:N)
- Gerenciamento de filhos/dependentes
- Mascaramento de dados sensíveis para perfis não-administrativos

### 👨‍💼 Recursos Humanos

- **Colaboradores Internos:** Funcionários da matriz
- **Colaboradores de Loja:** Funcionários das unidades
- **Gestão de Cargos:** Definição de funções e hierarquias

### 👤 Gestão de Clientes

- Cadastro de clientes e dependentes
- Histórico de relacionamento
- Segmentação e análises

### 🔐 Sistema de Segurança

#### Níveis de Permissão

- **Admin:** Acesso total e irrestrito
- **Operador:** Visualização de módulos específicos
- **Franqueado:** Acesso aos próprios dados
- **Usuário:** Perfil base expansível

#### Cofre de Senhas

- Armazenamento seguro de credenciais corporativas
- Categorização por sistema/serviço
- Geração automática de senhas seguras

### 🛠️ Ferramentas de Manutenção

#### Normalização de Dados

- **Nomes de Unidades:** Correção de grafias e padronização
- **Contatos de Franqueados:** Validação e normalização
- **Nomes de Pessoas:** Padronização de nomenclaturas
- **Estados (UF → Estado) de Unidades e Franqueados:** Correção do campo "state" a partir da UF

Localização: Configurações > aba "Sistema" > seção "Normalização de Estados (UF → Estado)".
Observação: a rota temporária "/admin/correcao-estados" foi descontinuada e agora redireciona para a tela de Configurações.

#### Sistema de Webhooks

- Configuração de endpoints para notificações
- Dispatcher central via Edge Function
- Logs de entrega e monitoramento

## 🔧 Instalação e Desenvolvimento

### Pré-requisitos

- Node.js 18+ ([instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm ou yarn
- Supabase CLI (opcional)

### Setup Local

```bash
# 1. Clone o repositório
git clone https://github.com/saulloallves/sistema-matriz.git

# 2. Navegue para o diretório
cd sistema-matriz

# 3. Instale as dependências
npm install

# 4. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite o arquivo .env.local com suas configurações do Supabase

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento

# Build
npm run build           # Build para produção
npm run build:dev       # Build para desenvolvimento

# Qualidade de código
npm run lint            # ESLint
npm run preview         # Preview do build
```

### Configuração do Supabase

```bash
# Instalar Supabase CLI
npm install -g supabase

# Conectar ao projeto
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Executar migrações
supabase db push

# Configurar Edge Functions
supabase functions deploy
```

## 🐳 Docker

### Desenvolvimento com Docker

```bash
# Build e execução
docker-compose up --build

# Apenas execução
docker-compose up

# Execução em background
docker-compose up -d
```

### Produção

```bash
# Build da imagem
docker build -t sistema-matriz .

# Execução
docker run -p 80:80 sistema-matriz
```

## 🏗️ Edge Functions

### 1. create-user-with-notifications

```typescript
// Orquestra criação completa de usuários
- Criação no Supabase Auth
- Registro na tabela profiles
- Atribuição de role
- Envio de credenciais via WhatsApp/email
```

### 2. reset-user-password

```typescript
// Reset seguro de senhas
- Geração de senha aleatória segura
- Atualização no sistema
- Notificação ao usuário
```

### 3. webhook-dispatcher

```typescript
// Hub central de eventos
- Recebe triggers do banco
- Distribui para webhooks cadastrados
- Log de entregas e retry automático
```

## 📚 Padrões de Desenvolvimento

### Estrutura de Componentes

```tsx
// Exemplo de página seguindo os padrões
import { Box, Typography } from '@mui/material';
import { Store } from 'lucide-react';
import KPICard from '../components/dashboard/KPICard';
import { useDashboardStats } from '../hooks/useDashboardStats';

const DashboardPage = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <KPICard
        title="Total de Unidades"
        value={stats?.totalUnidades || 0}
        icon={Store}
        loading={statsLoading}
      />
    </Box>
  );
};

export default DashboardPage;
```

### Custom Hooks Pattern

```tsx
// hooks/useDashboardStats.tsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_dashboard_stats');
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
```

## 🔒 Segurança

### Row Level Security (RLS)

- Implementado em todas as tabelas críticas
- Políticas específicas por perfil de usuário
- Funções seguras para mascaramento de dados

### Auditoria

- Logs automáticos de INSERT/UPDATE/DELETE
- Rastreamento de alterações por usuário
- Triggers em tabelas críticas

## 📈 Performance

### Otimizações Frontend

- Code splitting automático via Vite
- Lazy loading de componentes
- Cache inteligente com React Query
- Virtualização de listas grandes

### Otimizações Backend

- Funções RPC otimizadas
- Índices estratégicos no banco
- Paginação server-side

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Deploy automático via Git
git push origin main

# Deploy manual
vercel --prod
```

### Outras Plataformas

O projeto é compatível com:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📊 Monitoramento

### Métricas Disponíveis

- Performance das queries
- Logs de Edge Functions
- Auditoria de operações
- Status de webhooks

## 🤝 Contribuição

### Fluxo de Trabalho

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'feat: adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

### Padrões de Commit

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas de manutenção

## 📝 Licença

Este projeto é propriedade da **Cresci e Perdi** e é protegido por direitos autorais.

## 📞 Suporte

Para dúvidas ou suporte técnico:

- **Desenvolvedor:** Saullo Alves
- **GitHub:** [@saulloallves](https://github.com/saulloallves)
- **Email:** [contato através do GitHub]

---

**Desenvolvido com ❤️ usando React + TypeScript + Supabase + Material-UI**  
**Status:** Em produção ativa  
**Última atualização:** Outubro 2025
