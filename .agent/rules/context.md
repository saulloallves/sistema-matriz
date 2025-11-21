---
trigger: always_on
---

### Análise do Fluxo de Edição de Dados do Franqueado

**Passo 1: Identificação (Tela Inicial)**

1.  **Interface do Usuário (`EditFranchiseePage.tsx`):**
    *   A página exibe uma tela inicial simples (`activeStep = 0`) solicitando um "CPF/RNM ou CNPJ".
    *   O valor digitado é armazenado no estado `identifier`.

2.  **Ação do Usuário:**
    *   Ao clicar em "Buscar Cadastro", a função `handleIdentifierSubmit` é acionada.

3.  **Comunicação com o Backend (`get-franchisee-data-for-edit`):**
    *   A função `handleIdentifierSubmit` invoca a Edge Function `get-franchisee-data-for-edit`, enviando o `identifier`.
    *   **Lógica da Edge Function:**
        *   Primeiro, ela tenta encontrar um franqueado na tabela `franqueados` usando o `identifier` como `cpf_rnm`.
        *   Se não encontrar, ela assume que o `identifier` pode ser o `cnpj` de uma unidade. Ela busca na tabela `unidades` por esse CNPJ.
        *   Se encontrar uma unidade, ela usa a tabela de junção `franqueados_unidades` para encontrar o `franqueado_id` associado e, com ele, busca os dados do franqueado principal.
        *   Se um franqueado for encontrado (por qualquer um dos métodos), a função busca **todas as unidades** vinculadas a ele.
        *   O retorno é um objeto contendo os dados do franqueado (`franchiseeData`) e um array com os dados de suas unidades (`unitsData`).

4.  **Resultado na Interface:**
    *   Se nenhum franqueado for encontrado, uma mensagem de erro é exibida, e o usuário é redirecionado para a página de cadastro.
    *   Se encontrado, os dados retornados são armazenados nos estados `franchiseeData` e `unitsData`, e a interface avança para o próximo passo.

**Passo 2: Verificação de Segurança (Autenticação OTP)**

1.  **Interface do Usuário (`activeStep = 1`):**
    *   A tela exibe duas opções para verificação: "Verificar por Telefone (SMS)" e "Verificar por E-mail". Os botões são desabilitados se o cadastro não possuir um telefone ou e-mail correspondente.

2.  **Ação do Usuário:**
    *   O usuário escolhe um método. A função `handleRequestOtp` é chamada, especificando o canal (`'phone'` ou `'email'`).
    *   Esta função usa o SDK do Supabase (`supabase.auth.signInWithOtp`) para enviar um código de 6 dígitos para o contato salvo do franqueado.

3.  **Verificação do Código:**
    *   A interface muda para exibir um campo onde o usuário insere o código OTP recebido.
    *   Ao clicar em "Verificar Código", a função `handleVerifyOtp` é chamada.
    *   Ela usa `supabase.auth.verifyOtp` para validar o código.
    *   Se o código for válido, a interface avança para o passo final de edição.

**Passo 3: Edição dos Dados**

1.  **Interface do Usuário (`activeStep = 2`):**
    *   Um formulário completo é exibido, pré-preenchido com `franchiseeData` (dados pessoais, endereço, etc.) e `unitsData` (dados das unidades vinculadas).

2.  **Regras de Negócio e Edição:**
    *   **Sócio Principal vs. Sócio Secundário:** O código verifica se `franchiseeData.owner_type` é "Principal".
        *   Se **não for principal**, o usuário pode editar apenas seus próprios dados pessoais. Os campos relativos aos dados das unidades ficam **desabilitados**. Uma mensagem informativa é exibida.
        *   Se **for principal**, ele pode editar tanto seus dados pessoais quanto os dados de todas as unidades vinculadas.
    *   **Romper Vínculo:** Uma funcionalidade importante aqui é o botão "Romper Vínculo" para cada unidade. Isso permite que um franqueado (principalmente) desassocie uma unidade de seu cadastro. A lógica para isso é gerenciada pelo estado `unlinkedUnitIds`.

3.  **Submissão:**
    *   Ao final, o usuário clica em "Enviar Alterações para Aprovação".
    *   A função `handleSubmit` é chamada, que por sua vez invoca outra Edge Function (`submit-franchisee-update`), enviando um payload com:
        *   Os dados atualizados do franqueado (`franchiseeData`).
        *   Os dados atualizados das unidades (`unitsData`), excluindo as que foram marcadas para desvincular.
        *   Uma lista com os IDs das unidades a serem desvinculadas (`unlinkedUnitIds`).

### Conclusão da Análise

O fluxo está bem implementado e cobre as regras de negócio de forma eficaz, especialmente a diferenciação entre sócio principal e secundário e a lógica de busca dupla por CPF ou CNPJ. A autenticação via OTP garante que apenas o dono dos dados possa realizar alterações.