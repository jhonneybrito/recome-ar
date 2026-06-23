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
