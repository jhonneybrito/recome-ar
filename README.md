# Recomeçar

Aplicação SaaS de organização financeira pessoal e para casais, construída com Next.js, TypeScript e Tailwind CSS. O projeto começa sem dados financeiros fictícios e está preparado para integrações com Supabase, Stripe e inteligência artificial.

## Tecnologias

- Next.js 15 com App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- Stripe
- Recharts

As fontes usam uma pilha tipográfica local do sistema. Isso evita downloads externos durante `next build` e torna o deploy mais previsível.

## Motor financeiro personalizado

Enquanto o Supabase não está conectado, o onboarding persiste os dados no `localStorage`. Dashboard, dívidas, metas e relatório usam a mesma fonte e recalculam:

- receita, despesas, parcelas e saldo mensal;
- comprometimento da renda e saúde financeira;
- prazo estimado para quitar dívidas;
- prazo e data para atingir metas;
- projeção anual atual versus Plano de Recomeço;
- crescimento potencial da economia em 1, 3 e 5 anos.

As funções ficam em `lib/financial-calculations.ts` e a persistência em `lib/financial-storage.ts`.

## Movimentações e patrimônio

O botão **Nova movimentação** abre um formulário para cadastrar receitas ou despesas, com descrição, valor, data e categoria. As movimentações são persistidas no `localStorage`, aparecem no histórico e alimentam os totais e a distribuição das despesas por categoria.

O onboarding também registra patrimônio acumulado e meta patrimonial. Esses dados aparecem na Visão Geral e na página de Metas.

## Auditoria funcional

O MVP passou por uma auditoria para remover dados fictícios e ações sem funcionamento. Movimentações, dívidas e metas possuem criação, edição e exclusão; dashboard e relatório usam esses registros; configurações e Plano a Dois persistem alterações. Consulte `AUDITORIA_FUNCIONAL.md` para o relatório completo.

## Jornada semanal e gamificação

A rota `/journey` oferece quatro missões financeiras semanais. Ao concluir ações, o usuário acumula pontos, avança de nível, desbloqueia conquistas e constrói uma sequência de semanas completas. O progresso é persistido no `localStorage` por `lib/gamification-storage.ts`.

A experiência evita rankings e comparação social. As mensagens celebram constância, aceitam recomeços e tratam dinheiro como um tema também emocional. Dívidas, saldo negativo e mudanças de meta recebem linguagem acolhedora e recomendações em passos pequenos.

## Jurídico e LGPD

O MVP inclui:

- `/privacy` - Política de Privacidade e direitos do titular;
- `/terms` - Termos de Uso, limites educacionais, cancelamento e reembolso;
- `/cookies` - Política de Cookies e preparação para integrações analíticas;
- `/contact` - canal de suporte e solicitações de privacidade;
- banner de preferências de cookies;
- aceite obrigatório de Termos e Privacidade no cadastro;
- consentimento opcional e desmarcado para comunicações;
- garantia comercial de 30 dias e regras de cancelamento;
- aviso educativo nos relatórios financeiros.

Antes da operação comercial, substitua os dados empresariais de placeholder e obtenha revisão jurídica especializada sobre os documentos, contratos com operadores, processo de atendimento a titulares, segurança da informação e regras de consumo aplicáveis.

## Requisitos

- Node.js 20 ou superior
- npm

## Executar localmente

```bash
npm install
```

Crie o arquivo local de variáveis:

```bash
cp .env.example .env.local
```

No Windows:

```powershell
Copy-Item .env.example .env.local
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

As páginas demonstrativas funcionam sem serviços externos configurados. O endpoint de IA retorna um plano simulado quando não há chave, e o checkout Stripe retorna uma resposta de demonstração.

## Validar a produção

```bash
npm ci
npm run typecheck
npm run build
npm run start
```

O projeto fixa `browserslist@4.24.4` para manter o pipeline de CSS/Next.js determinístico. Não remova o `package-lock.json` antes do deploy.

## Deploy na Vercel

### Pasta raiz obrigatória

A raiz do projeto na Vercel deve ser exatamente a pasta que contém estes arquivos:

```text
recomecar/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dashboard/page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── onboarding/page.tsx
├── components/
├── lib/
├── package.json
├── package-lock.json
├── next.config.mjs
└── vercel.json
```

Neste workspace, essa pasta é:

```text
outputs/recomecar
```

Não selecione a pasta superior `files-mentioned-by-the-user-recomecar`, pois ela contém somente as pastas auxiliares `outputs` e `work`. Se o repositório Git tiver essa estrutura completa, configure **Root Directory** como:

```text
outputs/recomecar
```

Se enviar apenas o conteúdo da pasta `recomecar` para o repositório, deixe **Root Directory** vazio.

### Passos

1. Envie a pasta correta para um repositório Git.
2. Na Vercel, clique em **Add New > Project** e importe o repositório.
3. Em **Root Directory**, escolha `outputs/recomecar` somente se essa subpasta existir no repositório.
4. Confirme que o framework detectado é **Next.js**.
4. Use os padrões:
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: padrão do Next.js
5. Não configure `public`, `out` ou `.next` como Output Directory.
6. Cadastre as variáveis necessárias em **Settings > Environment Variables**.
7. Faça um novo deploy com **Redeploy > Clear build cache and redeploy**.

Se um deployment anterior falhou durante `next build`, confirme que o commit mais recente contém o `package-lock.json` atualizado e limpe o cache da Vercel. A instalação recomendada em CI é `npm ci`; a configuração atual também aceita `npm install`.

A Vercel detecta automaticamente a URL pública pelo valor de `VERCEL_URL`. `NEXT_PUBLIC_APP_URL` é opcional, mas pode ser definido com o domínio canônico de produção, por exemplo `https://recomecar.com`.

## Variáveis de ambiente

| Variável | Uso | Necessária para a demonstração |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | Não |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública do Supabase | Não |
| `SUPABASE_SERVICE_ROLE_KEY` | Operações administrativas no servidor | Não |
| `STRIPE_SECRET_KEY` | Criação de sessões de checkout | Não |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe no navegador | Não |
| `STRIPE_WEBHOOK_SECRET` | Validação de webhooks Stripe | Não |
| `OPENAI_API_KEY` | Geração do plano financeiro por IA | Não |
| `NEXT_PUBLIC_APP_URL` | Domínio canônico da aplicação | Não |
| `NEXT_PUBLIC_META_PIXEL_ID` | ID opcional do Meta Pixel | Não |
| `NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID` | Price ID do Premium Mensal (R$ 27) | Para checkout |
| `NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID` | Price ID do Premium Anual (R$ 147) | Para checkout |

Nunca exponha `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` ou `OPENAI_API_KEY` em código executado no navegador.

## Supabase

1. Crie um projeto no Supabase.
2. Execute [`supabase/schema.sql`](supabase/schema.sql) no SQL Editor.
3. Configure a URL e as chaves nas variáveis de ambiente.
4. Em **Authentication > Providers**, mantenha Email habilitado.
5. Em **Authentication > URL Configuration**, configure:
   - Site URL: domínio publicado na Vercel;
   - Redirect URLs: `http://localhost:3000/**` e `https://seu-dominio.vercel.app/**`.
6. O SQL cria o bucket público `avatars`, as políticas para cada usuário gerenciar somente sua pasta e o gatilho que cria o perfil após o cadastro.

O schema inclui perfis, movimentações, dívidas, metas, competências mensais, recorrências, reuniões do casal e políticas de Row Level Security. Ele também possui compatibilidade com a estrutura inicial já distribuída.

### Autenticação e persistência

Quando `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão configuradas:

- cadastro, login, logout, sessão e recuperação de senha usam Supabase Auth;
- as rotas privadas são protegidas pelo middleware;
- perfil, movimentações, dívidas, metas, avatar e pautas do casal usam Supabase;
- o `localStorage` funciona somente como cache de interface.

Sem essas variáveis, o projeto continua navegável localmente em modo de demonstração. Esse fallback não deve ser usado como autenticação de produção.

### Testar Auth

1. Cadastre uma conta em `/register`.
2. Se a confirmação de e-mail estiver habilitada, confirme o endereço recebido.
3. Entre em `/login`.
4. Confirme que `/dashboard` abre e que o botão **Sair** retorna para `/login`.
5. Abra uma janela anônima e confirme que `/dashboard` redireciona para `/login`.
6. Entre com a mesma conta na janela anônima para validar o acesso entre navegadores.

Nunca use `SUPABASE_SERVICE_ROLE_KEY` no navegador. O projeto cliente utiliza somente a chave anônima, protegida por RLS.

## Stripe

1. Crie os produtos Premium Mensal por R$ 27 e Premium Anual por R$ 147.
2. Salve os Price IDs nas variáveis correspondentes.
3. Configure `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET`.
4. Crie um webhook apontando exatamente para:

   ```text
   https://recomecar-chi.vercel.app/api/stripe/webhook
   ```

   Assine o evento `checkout.session.completed`. Acessar essa URL pelo navegador usa GET e retorna `405 Method Not Allowed`; isso confirma que a rota existe, pois o Stripe envia eventos por POST.
5. O webhook atualiza `profiles.plan` e registra a assinatura.

O checkout é criado por `POST /api/stripe/checkout`. O navegador envia apenas `premium_monthly` ou `premium_annual`; os Price IDs são escolhidos no servidor pelas variáveis da Vercel.

## Planos e limites

- Gratuito: 20 lançamentos por competência mensal, 3 metas, 3 dívidas e 1 Plano a Dois.
- Premium Mensal: R$ 27/mês.
- Premium Anual: R$ 147/ano, destacado como **Mais escolhido**.

Os limites são verificados na interface e também por triggers no Supabase. O usuário não possui permissão para alterar diretamente o campo `profiles.plan`.

## Meta Pixel e leads

Defina `NEXT_PUBLIC_META_PIXEL_ID` para ativar os eventos `PageView`, `Lead`, `CompleteRegistration`, `InitiateCheckout` e `Purchase`. A landing e o cadastro gravam e-mails na tabela `leads`; a política permite inserção, mas não leitura pública.

## Inteligência artificial

O endpoint `POST /api/ai-plan` mantém a chave no servidor. Sem `OPENAI_API_KEY`, ele usa um fallback demonstrativo para que a aplicação continue navegável.

## Rotas

- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/plans`
- `/onboarding`
- `/dashboard`
- `/transactions`
- `/debts`
- `/goals`
- `/couple`
- `/ai-plan`
- `/settings`
- `/privacy`
- `/terms`
- `/cookies`
- `/contact`
- `/journey`

## Aviso

O plano inteligente oferece conteúdo educacional e não substitui orientação financeira profissional.
