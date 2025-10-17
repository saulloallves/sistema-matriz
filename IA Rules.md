# Relatório do Sistema e Regras de IA

Este documento serve como um guia de contexto para o desenvolvimento do Sistema de Gestão da Cresci e Perdi. Ele detalha as tecnologias, funcionalidades, estrutura e regras de negócio implementadas.

## 1. Tecnologias Utilizadas

O sistema é construído com uma stack moderna e robusta, focada em performance e escalabilidade.

- **Frontend:**
  - **Framework:** React com Vite.
  - **Linguagem:** TypeScript.
  - **UI Kit:** Material-UI (MUI) com um tema customizado (`src/theme/muiTheme.ts`).
  - **Gerenciamento de Estado de Servidor:** TanStack Query (React Query) para data fetching, caching e mutações.
  - **Roteamento:** React Router.
  - **Gráficos:** Recharts.
  - **Validação de Formulários:** Zod e React Hook Form.
  - **Notificações:** React Hot Toast.

- **Backend & Banco de Dados:**
  - **Plataforma:** Supabase.
  - **Banco de Dados:** PostgreSQL com Row Level Security (RLS) ativado em todas as tabelas.
  - **Autenticação:** Supabase Auth.
  - **Funções Serverless:** Supabase Edge Functions (escritas em Deno/TypeScript).
  - **Real-time:** Supabase Realtime para sincronização de dados ao vivo.

- **Estilo e Ícones:**
  - **Estilização:** MUI (Styled Components) e CSS global (`src/index.css`).
  - **Ícones:** Lucide React.

## 2. Estrutura de Pastas Essenciais

A organização do projeto segue um padrão modular para facilitar a manutenção.

- `src/pages`: Contém os componentes de nível superior que representam cada tela da aplicação (ex: `DashboardPage.tsx`, `FranqueadosPage.tsx`).
- `src/components`: Armazena componentes reutilizáveis.
  - `src/components/modals`: Modais para operações de CRUD (Adicionar, Editar, Visualizar).
  - `src/components/crud`: Componentes genéricos para gerenciamento de dados, como a `DataTable`.
  - `src/components/layout`: Componentes estruturais como `AppLayout.tsx` e `AppSidebar.tsx`.
- `src/hooks`: Centraliza a lógica de negócio e o acesso a dados através de custom hooks (ex: `useFranqueados`, `useAuth`, `usePermissionCheck`).
- `src/integrations/supabase`: Contém o cliente Supabase (`client.ts`) e os tipos gerados do banco de dados (`types.ts`).
- `src/utils`: Funções utilitárias para formatação (`formatters.ts`), validação (`cnpjUtils.ts`), etc.
- `supabase/functions`: Código-fonte das Edge Functions (ex: `create-user-with-notifications`).
- `supabase/migrations`: Arquivos SQL que definem o schema do banco de dados.

## 3. Funcionalidades Principais

O sistema oferece um conjunto completo de ferramentas para gerenciamento de franquias.

- **Autenticação Segura:** Login/logout com gerenciamento de sessão e rotas protegidas.
- **Dashboard Centralizado:** Visão geral com KPIs (Key Performance Indicators), gráficos de distribuição de unidades, feed de atividades recentes e performance financeira.
- **Gerenciamento de Módulos (CRUD):**
  - **Unidades:** Cadastro e edição de unidades, com informações detalhadas de contato, endereço, horários e integrações.
  - **Franqueados:** Gerenciamento completo de franqueados, incluindo dados pessoais, profissionais, financeiros e contratuais.
  - **Vínculos Franqueado-Unidade:** Ferramenta para associar franqueados a uma ou mais unidades.
  - **Clientes & Filhos:** Cadastro de clientes e seus dependentes.
  - **Recursos Humanos (RH):**
    - **Colaboradores (Loja & Interno):** Gerenciamento de funcionários, com dados pessoais, profissionais e benefícios.
    - **Cargos:** Definição dos cargos disponíveis para colaboradores de loja.
  - **Segurança:**
    - **Senhas:** Cofre de senhas para sistemas corporativos.
    - **Permissões:** Sistema de controle de acesso baseado em perfis e permissões individuais.
- **Configurações Avançadas:**
  - **Gerenciamento de Usuários:** Criação, edição e ativação/inativação de usuários do sistema.
  - **Ferramentas de Normalização:** Utilitários para corrigir inconsistências em nomes de unidades, contatos de franqueados e nomes de pessoas.
  - **Webhooks:** Configuração de endpoints para receber notificações de alterações no banco de dados em tempo real.
  - **Logs de Auditoria:** Rastreamento detalhado de todas as operações de `INSERT`, `UPDATE` e `DELETE` realizadas no sistema.
- **Sincronização em Tempo Real:** A interface do usuário é atualizada automaticamente quando ocorrem alterações no banco de dados, graças ao Supabase Realtime e ao hook `useRealtimeSubscription`.

## 4. Telas (Páginas)

- `/auth`: Tela de Login.
- `/`: Dashboard.
- `/unidades`: Gerenciamento de Unidades.
- `/franqueados`: Gerenciamento de Franqueados.
- `/franqueados-unidades`: Gerenciamento de Vínculos.
- `/franqueados-filhos`: Gerenciamento de Filhos de Franqueados.
- `/clientes`: Gerenciamento de Clientes.
- `/clientes-filhos`: Gerenciamento de Filhos de Clientes.
- `/colaboradores-loja`: Gerenciamento de Colaboradores de Loja.
- `/cargos-loja`: Gerenciamento de Cargos de Loja.
- `/senhas`: Gerenciador de Senhas.
- `/permissoes`: Gerenciamento de Níveis de Permissão.
- `/grupos-whatsapp`: Gerenciamento de Grupos de WhatsApp por Unidade.
- `/configuracoes`: Painel de Configurações do Sistema.
- `*`: Página de Erro 404.

## 5. Regras do Sistema e Lógica de Negócio

- **Segurança e Permissões:**
  - **RLS é Mandatório:** Todas as tabelas no Supabase utilizam Row Level Security para garantir que os usuários acessem apenas os dados permitidos.
  - **Funções Seguras:** Funções RPC como `get_franqueados_secure` são usadas para mascarar dados sensíveis (ex: CPF, contato) para perfis não-administrativos.
  - **Hierarquia de Perfis:**
    - **Admin:** Acesso total e irrestrito.
    - **Operador:** Acesso de visualização a módulos específicos, definido nas configurações.
    - **Franqueado:** Acesso limitado aos seus próprios dados e informações públicas de outras unidades.
    - **Usuário:** Perfil base com acesso mínimo, expansível através de permissões individuais.
  - **Controle de Acesso na UI:** O hook `usePermissionCheck` centraliza a lógica de verificação de permissões para renderizar ou ocultar elementos da interface.

- **Automação e Triggers do Banco de Dados:**
  - **Criação de Perfil:** Um trigger (`handle_new_user`) na tabela `auth.users` cria automaticamente um registro correspondente na tabela `public.profiles`.
  - **Notificação de Alterações:** Triggers (`notify_table_changes`) em tabelas críticas (`franqueados`, `unidades`, etc.) enviam um payload para a Edge Function `webhook-dispatcher` sempre que um dado é criado, atualizado ou deletado.

- **Edge Functions (Lógica Server-side):**
  - `create-user-with-notifications`: Orquestra a criação de um novo usuário, seu perfil, sua role e o envio de credenciais por WhatsApp e email.
  - `reset-user-password`: Gera uma nova senha segura e a envia para o usuário.
  - `webhook-dispatcher`: Atua como um hub central que recebe eventos do banco de dados e os retransmite para todos os webhooks cadastrados que assinam o tópico do evento.

- **Formatação de Dados:**
  - Utilize sempre as funções de `src/utils/formatters.ts` para exibir dados como CPF, telefone, CEP e valores monetários na UI, garantindo consistência visual.

- **UI/UX:**
  - **Padrão de CRUD:** A interação para criar, visualizar e editar registros deve ser feita através de modais para manter o contexto do usuário na tela principal.
  - **Componente `DataTable`:** É o componente padrão para exibir dados tabulares. Ele inclui funcionalidades de pesquisa, paginação e exportação.
  