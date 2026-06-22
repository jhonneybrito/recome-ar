# Recomeçar

Aplicação SaaS de organização financeira pessoal e para casais, construída com Next.js, TypeScript e Tailwind CSS. O projeto inclui dados demonstrativos e está preparado para integrações com Supabase, Stripe e inteligência artificial.

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

Nunca exponha `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` ou `OPENAI_API_KEY` em código executado no navegador.

## Supabase

1. Crie um projeto no Supabase.
2. Execute [`supabase/schema.sql`](supabase/schema.sql) no SQL Editor.
3. Configure a URL e as chaves nas variáveis de ambiente.
4. Ative os provedores de autenticação desejados.

O schema inclui perfis, movimentações, dívidas, metas, casais, metas compartilhadas, planos de IA, assinaturas e políticas de Row Level Security.

## Stripe

1. Crie os produtos Individual e Plano a Dois.
2. Configure as chaves do Stripe.
3. Envie o Price ID para `POST /api/stripe/checkout`.
4. Configure um webhook antes de ativar assinaturas reais.

## Inteligência artificial

O endpoint `POST /api/ai-plan` mantém a chave no servidor. Sem `OPENAI_API_KEY`, ele usa um fallback demonstrativo para que a aplicação continue navegável.

## Rotas

- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/onboarding`
- `/dashboard`
- `/transactions`
- `/debts`
- `/goals`
- `/couple`
- `/ai-plan`
- `/settings`

## Aviso

O plano inteligente oferece conteúdo educacional e não substitui orientação financeira profissional.
