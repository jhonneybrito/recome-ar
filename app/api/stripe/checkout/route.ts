import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type PaidPlan = "premium_monthly" | "premium_annual";

export function GET() {
  return NextResponse.json(
    { message: "Endpoint de checkout Stripe ativo. Inicie uma sessão usando POST." },
    { status: 405, headers: { Allow: "POST" } },
  );
}

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY não está configurada na Vercel." },
      { status: 503 },
    );
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: "As variáveis públicas do Supabase não estão configuradas." },
      { status: 503 },
    );
  }

  let plan: PaidPlan;
  try {
    const body = await request.json();
    plan = body.plan;
  } catch {
    return NextResponse.json({ error: "Corpo JSON inválido." }, { status: 400 });
  }
  if (!["premium_monthly", "premium_annual"].includes(plan)) {
    return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
  }

  const priceId = plan === "premium_monthly"
    ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
    : process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID;
  if (!priceId) {
    const variable = plan === "premium_monthly"
      ? "NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID"
      : "NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID";
    return NextResponse.json({ error: `${variable} não está configurada na Vercel.` }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Entre na sua conta antes de assinar." }, { status: 401 });
  }

  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    vercelUrl ||
    new URL(request.url).origin
  ).replace(/\/$/, "");

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: { user_id: user.id, plan },
      subscription_data: { metadata: { user_id: user.id, plan } },
      success_url: `${baseUrl}/plans?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/plans?checkout=cancelled`,
    });
    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido do Stripe.";
    return NextResponse.json({ error: `Não foi possível criar o checkout: ${message}` }, { status: 500 });
  }
}
