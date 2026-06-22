import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const financialContext = await request.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      mode: "mock",
      plan: {
        summary: "Seu foco agora é criar espaço no orçamento sem perder segurança.",
        steps: [
          "Separar um pequeno colchão para imprevistos.",
          "Quitar primeiro a dívida que libera mais fluxo mensal.",
          "Automatizar a contribuição para sua meta principal.",
        ],
      },
      received: financialContext,
    });
  }

  // Conecte aqui o SDK oficial da OpenAI. O endpoint já mantém a chave somente no servidor.
  return NextResponse.json({ mode: "ready", message: "OPENAI_API_KEY configurada." });
}
