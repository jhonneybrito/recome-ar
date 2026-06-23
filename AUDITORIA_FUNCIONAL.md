# Auditoria funcional do Recomeçar

Data: 22 de junho de 2026

## Problemas encontrados

- Movimentações possuíam criação e exclusão, mas não edição.
- A lista inicial de movimentações continha registros fictícios.
- Dívidas eram apenas um agregado do onboarding, sem cadastro individual.
- Metas não permitiam criação, edição ou exclusão.
- Dashboard e relatório não priorizavam os registros financeiros cadastrados.
- Configurações exibiam campos que não salvavam.
- Plano a Dois possuía botões e pessoas fictícias.
- O menu exibia progresso fixo de 72%.
- O sino de notificações não realizava ação.
- O formulário de contato apenas simulava o envio.
- Componentes órfãos ainda continham dados e telas mockadas.

## Correções realizadas

- CRUD completo de receitas e despesas com persistência local.
- CRUD completo de dívidas com valor total, pago, parcela, juros e tipo.
- CRUD completo de metas com valores, contribuição e data desejada.
- Dashboard conectado às movimentações do mês, dívidas e metas.
- Relatório reconstruído com os registros reais.
- Configurações agora persistem nome, e-mail e telefone.
- Plano a Dois agora salva parceiro e ritual financeiro.
- Progresso lateral conectado às missões semanais.
- Ação de notificações sem função removida.
- Contato abre o cliente de e-mail com a mensagem preenchida.
- Dados iniciais fictícios removidos.
- Componentes mockados e órfãos removidos.
- Cadastro e login local validados por credencial com hash SHA-256; recuperação abre solicitação ao suporte.
- Relatório e dashboard usam a mesma regra de prioridade: movimentações do mês quando existem e planejamento inicial apenas para os tipos ainda não registrados.
- Exclusões de movimentações, dívidas e metas agora pedem confirmação e explicam o impacto antes de apagar.
- Linguagem de dívida, saldo negativo, metas e autenticação revisada para reduzir culpa, medo e sensação de fracasso.
- Estados vazios convidam a começar com um passo pequeno, sem pressão ou comparação.
- Recomendações financeiras foram divididas em ações possíveis e preservam despesas essenciais.
- A classificação de saúde mais sensível foi renomeada de “Crítica” para “Precisa de cuidado”.

## Persistência

Enquanto o Supabase não estiver ativo, os dados são armazenados em chaves separadas do `localStorage` para perfil, movimentações, dívidas, metas, gamificação, consentimentos, cookies e Plano a Dois.

## Validação

- TypeScript: aprovado.
- `npm run build`: aprovado.
- 22 páginas geradas.
- Rotas financeiras principais: HTTP 200.
- Formulários de movimentações, dívidas e metas verificados.
- Sem rolagem horizontal nas rotas principais testadas.
- Dashboard, relatório e simulador usam cálculos consistentes para receitas, despesas, dívidas, patrimônio e metas.

## Princípios emocionais aplicados

- Acolher antes de orientar: números difíceis não são apresentados como falha pessoal.
- Reduzir sobrecarga: a interface propõe um próximo passo por vez.
- Preservar autonomia: previsões são educativas e a decisão permanece com a pessoa.
- Evitar punição: pontos e missões celebram constância, sem ranking ou comparação social.
- Dar segurança: ações destrutivas exigem confirmação e mudanças de prioridade são tratadas como parte natural da vida.

## Limite atual do MVP

Os dados ainda ficam no navegador do dispositivo. Para produção com sincronização, recuperação de conta e múltiplos dispositivos, é necessário conectar autenticação e banco de dados do Supabase. O hash local protege a senha de armazenamento em texto puro, mas não substitui autenticação de produção.

## Revisão de conexão entre interface e dados — 23 de junho de 2026

### Problema encontrado

O dashboard e o relatório conseguiam usar os valores agregados do onboarding, mas as páginas de movimentações e dívidas permaneciam vazias. Além disso, uma lista vazia era tratada como “nunca cadastrada”, fazendo valores antigos do onboarding reaparecerem depois da exclusão do último registro.

### Correções

- Valores financeiros já informados no onboarding são migrados uma única vez para movimentações, dívidas e metas editáveis.
- A migração preserva qualquer conjunto que já tenha sido cadastrado e não sobrescreve dados existentes.
- As stores agora distinguem “ainda não inicializado” de “inicializado e vazio”.
- Dashboard e relatório usam o onboarding somente antes da primeira inicialização da respectiva store.
- Depois da inicialização, inclusive com lista vazia, apenas os dados reais cadastrados são considerados.
- Movimentações, dívidas e metas sincronizam alterações entre componentes e abas por eventos do navegador.
- A distribuição de despesas por categoria é recalculada diretamente das movimentações persistidas.

### Validação

- Valores do onboarding migrados para 4 movimentações e 1 dívida reais na prévia existente.
- Dashboard, movimentações, dívidas, metas e relatório exibiram totais consistentes.
- Formulários de criação das três áreas abriram corretamente.
- Edição e salvamento de movimentação, dívida e meta foram executados no navegador sem duplicação.
- Exclusões foram verificadas na implementação, incluindo atualização do `localStorage` e evento de sincronização; nenhum dado real foi apagado durante a auditoria.
- TypeScript e build de produção aprovados.

## Perfil, patrimônio, dívidas e Plano a Dois — 23 de junho de 2026

### Problemas encontrados

- O avatar do perfil era sempre formado pelas iniciais e não aceitava fotografia.
- Metas da categoria Patrimônio não atualizavam `accumulatedNetWorth` e `netWorthGoal` do perfil.
- Dívidas não possuíam contexto de prioridade emocional ou urgência.
- O Plano a Dois salvava apenas nome e ritual, sem utilizar dados financeiros nas conversas.

### Correções realizadas

- Upload de foto com pré-visualização, limite de 2 MB, troca, remoção e persistência base64 no `localStorage`.
- Avatar da barra lateral conectado à foto, com retorno automático às iniciais quando não houver imagem.
- Meta de Patrimônio usa rótulos específicos para patrimônio existente e meta patrimonial.
- Ao salvar ou editar uma meta patrimonial, o perfil e o dashboard são atualizados imediatamente.
- Card patrimonial mostra valor atual, meta e percentual calculado por `patrimônio atual / meta`.
- Dívidas receberam tipo de prioridade, motivo opcional de urgência e marcação de Prioridade atual.
- Dívida emocional/urgente prevalece na recomendação quando não existe marcação manual.
- A dívida recomendada aparece no topo com contexto humano e financeiro.
- Plano a Dois gera exatamente três pautas a partir de receitas, despesas, saldo, dívidas e metas reais.
- As pautas são persistidas junto às configurações do casal e recalculadas quando os dados mudam.

### Testes

- Controles de escolher, trocar e remover foto presentes; fallback de iniciais preservado.
- Formulário patrimonial alterna corretamente para “Meta de patrimônio” e “Patrimônio existente hoje”.
- Campos de prioridade, urgência e Prioridade atual presentes e editáveis.
- Dívida recomendada exibida no topo.
- Três pautas reais geradas com dívida, receitas, despesas e meta existentes.
- Layout sem rolagem horizontal em 375 px nas telas Configurações, Dívidas, Plano a Dois e Metas.
- TypeScript aprovado.
- `npm run build` aprovado com 22 páginas.

### Dependências futuras de backend

- A foto permanece limitada ao armazenamento local do navegador; produção deve usar Supabase Storage.
- Perfil, patrimônio, prioridades e pautas precisam de tabelas e sincronização no Supabase para múltiplos dispositivos.

## Supabase Auth e banco real — 23 de junho de 2026

### Implementado

- Cadastro, login, logout, recuperação de senha e sessão com Supabase Auth.
- Middleware protegendo dashboard, movimentações, dívidas, metas, Plano a Dois, configurações, relatório e onboarding.
- Nome, e-mail e avatar do usuário autenticado exibidos no menu.
- CRUDs de movimentações, dívidas e metas usando Supabase como fonte principal.
- Perfil, patrimônio, avatar e pautas do casal persistidos no Supabase.
- Onboarding grava perfil e registros financeiros iniciais vinculados ao usuário autenticado.
- `localStorage` mantido apenas como cache/fallback quando o Supabase não está configurado.
- Schema completo com RLS, índices, competências mensais, recorrências, reuniões do casal e bucket `avatars`.
- Migração compatível com colunas do schema inicial.

### Validação local

- TypeScript aprovado.
- `npm run build` aprovado.
- 22 páginas e middleware gerados.
- Fallback sem credenciais continua navegável para desenvolvimento.

### Validação que exige o projeto Supabase

Este workspace não contém as credenciais configuradas na Vercel. Após executar `supabase/schema.sql`, validar cadastro com confirmação de e-mail, login em outro navegador, recuperação de senha, upload real no Storage e RLS entre duas contas distintas.

## Etapa 2 — planos, limites e marketing

- Avatar real aceita JPG/JPEG/PNG/WEBP até 5 MB no bucket `avatars`.
- Recuperação de senha direciona para `/reset-password`, com mínimo de 8 caracteres.
- Criada `/plans` com Gratuito, Premium Mensal de R$ 27 e Premium Anual de R$ 147.
- Checkout Stripe usa o usuário autenticado e o webhook atualiza o plano no Supabase.
- Limites gratuitos aplicados na interface e em triggers SQL.
- Campo `profiles.plan` protegido contra alteração pelo próprio usuário.
- Criada tabela `leads` com captura na landing e no cadastro.
- Estrutura do Meta Pixel preparada para PageView, Lead, CompleteRegistration, InitiateCheckout e Purchase.
