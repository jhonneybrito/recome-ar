import LegalPage from "@/components/legal-page";

export default function CookiesPage() {
  return <LegalPage eyebrow="Preferências de navegação" title="Política de Cookies" intro="Cookies são pequenos arquivos usados para manter recursos, lembrar escolhas e compreender o desempenho da plataforma." sections={[
    {title:"Cookies essenciais",paragraphs:["São necessários para segurança, autenticação, navegação, preferências de privacidade e funcionamento da aplicação. Não podem ser desativados pelo nosso painel porque a plataforma pode deixar de funcionar corretamente."]},
    {title:"Cookies analíticos",paragraphs:["Com seu consentimento, poderão ajudar a entender páginas visitadas, origem do acesso e uso geral. A integração futura pode incluir Google Analytics. Esses cookies devem permanecer desativados até o consentimento."]},
    {title:"Cookies de desempenho e experiência",paragraphs:["Com autorização, poderemos analisar erros, velocidade e interação para melhorar a experiência. Integrações futuras podem incluir Microsoft Clarity."]},
    {title:"Publicidade e mensuração",paragraphs:["O Meta Pixel poderá ser integrado futuramente apenas após avaliação de privacidade, configuração adequada e consentimento quando aplicável. Não usamos essa tecnologia nesta versão inicial."]},
    {title:"Como controlar",paragraphs:["No primeiro acesso você pode aceitar todos ou manter somente os essenciais. Também é possível apagar cookies e dados do site nas configurações do navegador. A recusa dos opcionais não impede o uso das funções básicas."]},
    {title:"Mudanças nesta política",paragraphs:["Esta política será atualizada quando novas tecnologias forem efetivamente ativadas. Alterações relevantes serão comunicadas de forma apropriada."]},
  ]}/>;
}
