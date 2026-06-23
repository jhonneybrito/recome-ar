import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(
    { message: "Endpoint do webhook Stripe ativo. Envie eventos usando POST." },
    { status: 405, headers: { Allow: "POST" } },
  );
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET não está configurado na Vercel." },
      { status: 503 },
    );
  }
  if (!stripe) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY não está configurada na Vercel." },
      { status: 503 },
    );
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "As credenciais administrativas do Supabase não estão configuradas." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Cabeçalho stripe-signature ausente." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Assinatura inválida.";
    return NextResponse.json({ error: `Falha ao validar webhook: ${message}` }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, handled: false, type: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const customerEmail = session.customer_details?.email || session.customer_email || null;
  let userId = session.metadata?.user_id || session.client_reference_id || null;

  if (!userId && customerEmail) {
    const { data: profile, error: profileLookupError } = await admin
      .from("profiles")
      .select("user_id")
      .eq("email", customerEmail)
      .maybeSingle();
    if (profileLookupError) {
      return NextResponse.json(
        { error: `Erro ao localizar perfil: ${profileLookupError.message}` },
        { status: 500 },
      );
    }
    userId = profile?.user_id || null;
  }

  if (!userId && customerEmail) {
    const { data, error: usersError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersError) {
      return NextResponse.json(
        { error: `Erro ao localizar usuário: ${usersError.message}` },
        { status: 500 },
      );
    }
    userId = data.users.find((user) => user.email?.toLowerCase() === customerEmail.toLowerCase())?.id || null;
  }

  if (!userId) {
    return NextResponse.json(
      { error: "Não foi possível identificar o usuário pelo user_id ou customer_email da sessão." },
      { status: 422 },
    );
  }

  const plan = session.metadata?.plan === "premium_annual"
    ? "premium_annual"
    : "premium_monthly";
  const stripeCustomerId = typeof session.customer === "string"
    ? session.customer
    : session.customer?.id || null;
  const stripeSubscriptionId = typeof session.subscription === "string"
    ? session.subscription
    : session.subscription?.id || null;

  const { error: profileError } = await admin
    .from("profiles")
    .update({ plan, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (profileError) {
    return NextResponse.json(
      { error: `Erro ao atualizar profiles.plan: ${profileError.message}` },
      { status: 500 },
    );
  }

  const { error: subscriptionError } = await admin
    .from("subscriptions")
    .upsert({
      user_id: userId,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      plan,
      status: "active",
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
  if (subscriptionError) {
    return NextResponse.json(
      { error: `Erro ao registrar assinatura: ${subscriptionError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({
    received: true,
    handled: true,
    event: event.type,
    user_id: userId,
    plan,
  });
}
