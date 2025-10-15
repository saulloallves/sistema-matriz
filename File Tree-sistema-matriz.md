# File Tree: sistema-matriz

Generated on: 15/10/2025, 11:15:14
Root path: `c:\Users\Cresci e Perdi\dyad-apps\sistema-matriz`

```
├── 📁 .git/ 🚫 (auto-hidden)
├── 📁 nginx/
│   └── ⚙️ nginx.conf
├── 📁 node_modules/ 🚫 (auto-hidden)
├── 📁 public/
│   ├── 🖼️ favicon.ico
│   ├── 🖼️ placeholder.svg
│   └── 📄 robots.txt
├── 📁 src/
│   ├── 📁 assets/
│   │   ├── 🖼️ logo-header.png
│   │   └── 🖼️ logo-principal.png
│   ├── 📁 components/
│   │   ├── 📁 auth/
│   │   │   └── 📄 ProtectedRoute.tsx
│   │   ├── 📁 crud/
│   │   │   └── 📄 DataTable.tsx
│   │   ├── 📁 dashboard/
│   │   │   ├── 📄 ActivityFeed.tsx
│   │   │   ├── 📄 FinancialMetrics.tsx
│   │   │   ├── 📄 KPICard.tsx
│   │   │   ├── 📄 PerformanceChart.tsx
│   │   │   └── 📄 TopUnitsPerformance.tsx
│   │   ├── 📁 layout/
│   │   │   ├── 📄 AppLayout.tsx
│   │   │   ├── 📄 AppSidebar.tsx
│   │   │   └── 📄 Header.tsx
│   │   ├── 📁 modals/
│   │   │   ├── 📄 CargoAddModal.tsx
│   │   │   ├── 📄 CargoEditModal.tsx
│   │   │   ├── 📄 CargoViewModal.tsx
│   │   │   ├── 📄 ColaboradorInternoAddModal.tsx
│   │   │   ├── 📄 ColaboradorInternoEditModal.tsx
│   │   │   ├── 📄 ColaboradorInternoViewModal.tsx
│   │   │   ├── 📄 ColaboradorLojaAddModal.tsx
│   │   │   ├── 📄 ColaboradorLojaEditModal.tsx
│   │   │   ├── 📄 ColaboradorLojaFilterDrawer.tsx
│   │   │   ├── 📄 ColaboradorLojaViewModal.tsx
│   │   │   ├── 📄 FranqueadoAddModal.tsx
│   │   │   ├── 📄 FranqueadoEditModal.tsx
│   │   │   ├── 📄 FranqueadoFilterDrawer.tsx
│   │   │   ├── 📄 FranqueadoViewModal.tsx
│   │   │   ├── 📄 NormalizacaoContatosModal.tsx
│   │   │   ├── 📄 NormalizacaoNomesModal.tsx
│   │   │   ├── 📄 NormalizacaoPessoasModal.tsx
│   │   │   ├── 📄 RolePermissionsModal.tsx
│   │   │   ├── 📄 UnidadeAddModal.tsx
│   │   │   ├── 📄 UnidadeEditModal.tsx
│   │   │   ├── 📄 UnidadeFilterDrawer.tsx
│   │   │   ├── 📄 UnidadeViewModal.tsx
│   │   │   ├── 📄 UnidadesPorModeloModal.tsx
│   │   │   ├── 📄 UserEditModal.tsx
│   │   │   ├── 📄 UserPermissionsModal.tsx
│   │   │   ├── 📄 VinculoAddModal.tsx
│   │   │   ├── 📄 VinculoEditModal.tsx
│   │   │   ├── 📄 VinculoFilterDrawer.tsx
│   │   │   ├── 📄 VinculoViewModal.tsx
│   │   │   ├── 📄 WebhookAddModal.tsx
│   │   │   ├── 📄 WebhookEditModal.tsx
│   │   │   ├── 📄 WhatsAppGroupAddModal.tsx
│   │   │   ├── 📄 WhatsAppGroupEditModal.tsx
│   │   │   └── 📄 WhatsAppGroupViewModal.tsx
│   │   └── 📁 ui/
│   ├── 📁 hooks/
│   │   ├── 📄 use-mobile.tsx
│   │   ├── 📄 useAuth.tsx
│   │   ├── 📄 useCargosInterno.tsx
│   │   ├── 📄 useCargosLoja.tsx
│   │   ├── 📄 useClientes.tsx
│   │   ├── 📄 useClientesFilhos.tsx
│   │   ├── 📄 useColaboradoresInterno.tsx
│   │   ├── 📄 useColaboradoresLoja.tsx
│   │   ├── 📄 useDashboardStats.tsx
│   │   ├── 📄 useFinancialMetrics.tsx
│   │   ├── 📄 useFranqueados.tsx
│   │   ├── 📄 useFranqueadosFilhos.tsx
│   │   ├── 📄 useFranqueadosUnidades.tsx
│   │   ├── 📄 useNormalizacaoContatos.tsx
│   │   ├── 📄 useNormalizacaoPessoas.tsx
│   │   ├── 📄 useNormalizacaoUnidades.tsx
│   │   ├── 📄 usePermissionCheck.tsx
│   │   ├── 📄 usePermissoes.tsx
│   │   ├── 📄 useRealtimeSubscription.tsx
│   │   ├── 📄 useSenhas.tsx
│   │   ├── 📄 useTablePermissions.tsx
│   │   ├── 📄 useUnidades.tsx
│   │   ├── 📄 useUserManagement.tsx
│   │   ├── 📄 useUserPermissions.tsx
│   │   ├── 📄 useUserProfile.tsx
│   │   ├── 📄 useUserRoles.tsx
│   │   ├── 📄 useUsers.tsx
│   │   ├── 📄 useWebhookDeliveryLogs.tsx
│   │   ├── 📄 useWebhookSubscriptions.tsx
│   │   └── 📄 useWhatsAppGroups.tsx
│   ├── 📁 integrations/
│   │   └── 📁 supabase/
│   │       ├── 📄 client.ts
│   │       └── 📄 types.ts
│   ├── 📁 lib/
│   ├── 📁 pages/
│   │   ├── 📄 AuthPage.tsx
│   │   ├── 📄 CargosLojaPage.tsx
│   │   ├── 📄 ClientesFilhosPage.tsx
│   │   ├── 📄 ClientesPage.tsx
│   │   ├── 📄 ColaboradoresLojaPage.tsx
│   │   ├── 📄 ConfiguracoesPage.tsx
│   │   ├── 📄 DashboardPage.tsx
│   │   ├── 📄 FranqueadosFilhosPage.tsx
│   │   ├── 📄 FranqueadosPage.tsx
│   │   ├── 📄 FranqueadosUnidadesPage.tsx
│   │   ├── 📄 GruposWhatsAppPage.tsx
│   │   ├── 📄 Index.tsx
│   │   ├── 📄 NotFound.tsx
│   │   ├── 📄 PermissoesPage.tsx
│   │   ├── 📄 SenhasPage.tsx
│   │   └── 📄 UnidadesPage.tsx
│   ├── 📁 scripts/
│   ├── 📁 theme/
│   │   └── 📄 muiTheme.ts
│   ├── 📁 types/
│   │   ├── 📄 user.ts
│   │   └── 📄 whatsapp.ts
│   ├── 📁 utils/
│   │   ├── 📄 cnpjUtils.ts
│   │   ├── 📄 formatters.ts
│   │   └── 📄 passwordGenerator.ts
│   ├── 🎨 App.css
│   ├── 📄 App.tsx
│   ├── 🎨 index.css
│   ├── 📄 main.tsx
│   └── 📄 vite-env.d.ts
├── 📁 supabase/
│   ├── 📁 functions/
│   │   ├── 📁 create-user-with-notifications/
│   │   │   └── 📄 index.ts
│   │   ├── 📁 reset-user-password/
│   │   │   └── 📄 index.ts
│   │   └── 📁 webhook-dispatcher/
│   │       └── 📄 index.ts
│   ├── 📁 migrations/
│   │   ├── 🗄️ 0000_recria_a_fun_o_get_franqueados_secure_para_incluir_o_campo_cpf_rnm_com_m_scara_de_seguran_a_para_usu_rios_n_o_administradores_.sql
│   │   ├── 🗄️ 0001_habilita_a_replica_o_completa_para_as_tabelas_principais_permitindo_que_o_supabase_transmita_altera_es_detalhadas_em_tempo_real_.sql
│   │   ├── 🗄️ 20250911185525_8003c043-64ed-4f46-b14c-a6955302bc73.sql
│   │   ├── 🗄️ 20250911192719_6bccd5e4-364a-4cd7-9716-2abd87807cae.sql
│   │   ├── 🗄️ 20250912141651_91eb4f2a-579e-4b79-9c18-c9f8dbc5191b.sql
│   │   ├── 🗄️ 20250912141726_0b7db2f4-c6d8-4b3e-b6e5-ba4efb0e1520.sql
│   │   ├── 🗄️ 20250912171600_b1c098df-99ff-4bb8-955b-53cfd2413797.sql
│   │   ├── 🗄️ 20250912175328_6d9711f9-ce43-4a88-9571-c3f8061725c9.sql
│   │   ├── 🗄️ 20250912175349_c47d72fd-799e-436e-bdbc-698b06d9eec8.sql
│   │   ├── 🗄️ 20250912184714_b56d5dbe-92d1-4f92-9f0a-1de7e5738ce7.sql
│   │   ├── 🗄️ 20250912185157_a1489712-22e6-4f22-926c-de17dbb97ceb.sql
│   │   ├── 🗄️ 20250922145305_2c8dde10-515c-4056-95d7-483ebfb4d6b6.sql
│   │   ├── 🗄️ 20250922145428_42265d2f-c7ec-4d7a-9acc-929b21b05260.sql
│   │   ├── 🗄️ 20250922170425_2ad53af5-34d6-4159-9714-e58e5bb23ea6.sql
│   │   ├── 🗄️ 20250922171422_df43a564-1663-4991-aebb-e390d1fb81ac.sql
│   │   ├── 🗄️ 20250922173802_698bb03c-c2c9-4458-9f81-f4f0deab3a41.sql
│   │   ├── 🗄️ 20250929211555_d77f01bf-9ef3-4246-bb9c-5992147c1465.sql
│   │   ├── 🗄️ 20250929212858_7244350f-7d77-47ff-ad12-00c2d520e7fa.sql
│   │   ├── 🗄️ 20250930125350_faab594b-9c2a-41e4-aff4-623048d5aa11.sql
│   │   ├── 🗄️ 20250930134540_031e2caf-71bf-4bce-ab81-b932d694a2e0.sql
│   │   ├── 🗄️ 20250930140032_92915348-8890-411c-b0b3-10e558b30b60.sql
│   │   ├── 🗄️ 20250930141247_b119bc0d-1a63-4f15-9070-c0790bfcdb34.sql
│   │   ├── 🗄️ 20250930210504_d091b5fe-946d-462c-a00d-daec7ddd6b64.sql
│   │   ├── 🗄️ 20251001120026_c42e0851-0bbd-4f5c-aff2-432ffca0f09c.sql
│   │   ├── 🗄️ 20251001124435_1cc93c58-e8f0-406f-9133-9928a51f6528.sql
│   │   ├── 🗄️ 20251001130234_0f411f77-a4f9-4bc0-9760-cbc8681b46c7.sql
│   │   ├── 🗄️ 20251001130311_6624d30d-7f9b-42c0-b942-d03ac1ca2d43.sql
│   │   ├── 🗄️ 20251001130340_0ebdb819-b499-4fb1-a675-565cdbc40517.sql
│   │   ├── 🗄️ 20251001180658_741ca6ef-184c-4ffa-b162-42e54e661b3e.sql
│   │   ├── 🗄️ 20251001180936_e8a51513-7543-4472-8e2e-26bfb9190a47.sql
│   │   ├── 🗄️ 20251001191252_f2b2cbad-68ba-499d-be72-ecd1d6eebe4e.sql
│   │   ├── 🗄️ 20251002123204_20b889e7-83d2-44ec-94a9-7e54a298c753.sql
│   │   ├── 🗄️ 20251002131136_65ef5606-b655-439f-8fdb-8c10f72b1625.sql
│   │   └── 🗄️ 20251002202607_b09483ba-3266-48f0-8dbb-f19dd0074cd8.sql
│   └── ⚙️ config.toml
├── 📄 .dockerignore
├── 🔒 .env 🚫 (auto-hidden)
├── 🚫 .gitignore
├── 🐳 Dockerfile
├── 📖 README.md
├── 📄 bun.lockb
├── 📄 components.json
├── ⚙️ docker-compose.yml
├── 📄 eslint.config.js
├── 🌐 index.html
├── 📄 package-lock.json
├── 📄 package.json
├── ⚙️ pnpm-lock.yaml
├── 📄 tsconfig.app.json
├── 📄 tsconfig.json
├── 📄 tsconfig.node.json
├── 📄 vercel.json
└── 📄 vite.config.ts
```

---
