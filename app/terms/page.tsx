import LegalPage from "@/components/legal-page";

export default function TermsPage() {
  return <LegalPage eyebrow="Regras de utilização" title="Termos de Uso" intro="Estes termos definem o papel do Recomeçar, os limites da plataforma e as condições de uso nesta fase de pagamento único." sections={[
    {title:"O que é o Recomeçar",paragraphs:["O Recomeçar é uma ferramenta de organização e educação financeira que transforma dados informados pelo usuário em cálculos, projeções e conteúdos educativos."]},
    {title:"O que o Recomeçar não é",paragraphs:["O Recomeçar não presta consultoria financeira, assessoria de investimentos, gestão de patrimônio, contabilidade, aconselhamento jurídico ou planejamento financeiro profissional. Nenhuma análise constitui recomendação de investimento, crédito, renegociação ou contratação de produto financeiro."]},
    {title:"Responsabilidade pelas decisões",paragraphs:["As informações dependem da qualidade e atualização dos dados fornecidos. Cabe ao usuário avaliar sua realidade, conferir os cálculos e assumir integral responsabilidade pelas decisões financeiras tomadas. Procure profissionais habilitados quando necessário."]},
    {title:"Sem garantia de resultados",paragraphs:["Projeções são estimativas e não garantem economia, quitação, rentabilidade ou melhora financeira. Resultados podem variar por renda, despesas, juros, eventos pessoais, mercado e comportamento do usuário."]},
    {title:"Conta e uso adequado",items:["Forneça informações verdadeiras e mantenha suas credenciais protegidas.","Não use a plataforma para atividades ilícitas, fraude ou violação de direitos.","O acesso poderá ser suspenso em caso de abuso, risco de segurança ou descumprimento destes termos."]},
    {title:"Pagamento e acesso",paragraphs:["Nesta fase, o Recomeçar é vendido por pagamento único de R$ 27,90. Não há assinatura recorrente ativa nem oferta de upgrade dentro da plataforma. Mudanças futuras de modelo comercial serão informadas antes de qualquer nova contratação."]},
    {title:"Reembolso",paragraphs:["Durante os primeiros 30 dias após a compra, o usuário poderá solicitar reembolso integral pelo canal de suporte. Após 30 dias, não haverá reembolso, sem prejuízo de direitos obrigatórios previstos na legislação aplicável."]},
    {title:"Garantia de 30 dias",paragraphs:["A garantia comercial de 30 dias aplica-se à primeira contratação paga elegível. Para solicitar, escreva para suporte@recomecar.app dentro do prazo, informando o e-mail da conta e os dados necessários para localizar a cobrança."]},
    {title:"Propriedade intelectual e disponibilidade",paragraphs:["Marca, interface, textos e software pertencem aos seus respectivos titulares. Podemos evoluir, corrigir, suspender ou descontinuar funcionalidades, buscando informar mudanças relevantes."]},
    {title:"Contato e legislação",paragraphs:["Dúvidas podem ser enviadas a suporte@recomecar.app. Estes termos são interpretados conforme a legislação brasileira, respeitados os direitos do consumidor e o foro legalmente competente."]},
  ]}/>;
}
