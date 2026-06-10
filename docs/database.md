# Banco de dados VetTooth

O schema principal esta em:

`supabase/migrations/20260610092700_initial_vettooth_schema.sql`

## Como aplicar

1. Abra o SQL Editor do Supabase.
2. Cole e execute a migration inteira.
3. Ative email/password em Authentication.
4. No cadastro pelo Supabase Auth, envie os metadados:

```ts
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      name,
      full_name: name,
      role: 'admin', // admin | vet | secretary
      clinic_name: 'Nome da clinica'
    }
  }
})
```

Para cadastrar um usuario dentro de uma clinica existente, envie tambem:

```ts
clinic_id: 'uuid-da-clinica'
```

## Vinculo dos dados

Todas as entidades operacionais recebem `clinic_id`. As criacoes tambem tem `created_by` e `updated_by`, apontando para `user_profiles.id`, que e o mesmo id do usuario em `auth.users`.

Isso resolve o caso principal: quando um admin cadastra paciente, tutor, atendimento, agenda, estoque ou financeiro, o registro fica dentro da clinica desse admin e pode ser rastreado por `created_by`.

## Roles

O banco usa:

- `admin`: acesso total e permissao para remover dados da clinica.
- `vet`: perfil clinico.
- `secretary`: secretaria/recepcao.

No app atual o tipo ja existe como `admin | vet | secretary`; a palavra "secretaria" na interface deve mapear para `secretary` no banco.

## Tabelas cobertas

O schema cobre as colecoes hoje salvas no `localStorage`/`mockDatabase`:

- Usuarios, perfis de acesso e equipe: `user_profiles`, `access_profiles`, `team_members`
- Configuracoes, auditoria e backups: `general_settings`, `audit_logs`, `backup_snapshots`
- Cadastros: `owners`, `properties`, `patients`
- Agenda e atendimentos: `appointments`, `attendances`, `return_visits`
- Prontuario: `prescriptions`, `prescription_items`, `exam_requests`, `exam_request_items`, `vaccine_applications`, `applied_procedures`
- Estoque e procedimentos: `inventory_items`, `procedure_templates`, `procedure_template_items`, `attendance_consumed_items`
- Financeiro: `receivables`, `cash_sessions`, `cash_flow_entries`, `financial_records`

## Seguranca

RLS esta habilitado. Usuarios autenticados so acessam registros com o mesmo `clinic_id`. Remocoes ficam limitadas a `admin`.

