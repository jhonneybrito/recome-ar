import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

type PurchasePayload = {
  email: string;
  name: string | null;
  stripe_customer_id: string | null;
  stripe_session_id: string;
  payment_status: string | null;
  product_name: string;
  access_granted: boolean;
};

const PRODUCT_NAME = "Método Recomeçar";
const PREMIUM_PLAN = "premium_monthly";
const AUTOMATIC_ACCESS_RELEASE_ENABLED = false;

function safeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() || null;
}

function getStripeId(value: string | Stripe.Customer | Stripe.DeletedCustomer | null) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export function GET() {
  return NextResponse.json(
    { message: "Endpoint do webhook Stripe ativo. Este endpoint aceita apenas POST." },
    { status: 405, headers: { Allow: "POST" } },
  );
}

export async function POST(request: Request) {
  console.log("[stripe:webhook] webhook recebido");

  if (!AUTOMATIC_ACCESS_RELEASE_ENABLED) {
    console.log("[stripe:webhook] liberação automática temporariamente desativada");
    return NextResponse.json({
      received: true,
      handled: false,
      automatic_access_release_enabled: false,
      message: "Webhook recebido, mas a liberação automática está temporariamente desativada.",
    });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe:webhook] STRIPE_WEBHOOK_SECRET ausente");
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET não está configurado." },
      { status: 503 },
    );
  }
  if (!stripe) {
    console.error("[stripe:webhook] STRIPE_SECRET_KEY ausente");
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY não está configurada." },
      { status: 503 },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[stripe:webhook] credenciais administrativas do Supabase ausentes");
    return NextResponse.json(
      { error: "As credenciais administrativas do Supabase não estão configuradas." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    console.warn("[stripe:webhook] assinatura ausente");
    return NextResponse.json({ error: "Cabeçalho stripe-signature ausente." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    console.log("[stripe:webhook] assinatura validada", { eventType: event.type });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Assinatura inválida.";
    console.warn("[stripe:webhook] assinatura inválida", { message });
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    console.log("[stripe:webhook] evento ignorado com segurança", { eventType: event.type });
    return NextResponse.json({ received: true, handled: false, type: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const email = safeEmail(session.customer_details?.email || session.customer_email);
  if (!email) {
    console.warn("[stripe:webhook] sessão sem e-mail", { sessionId: session.id });
    return NextResponse.json({ error: "Sessão Stripe sem e-mail do comprador." }, { status: 400 });
  }
  console.log("[stripe:webhook] e-mail identificado", { email });

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const purchase: PurchasePayload = {
    email,
    name: session.customer_details?.name || null,
    stripe_customer_id: getStripeId(session.customer),
    stripe_session_id: session.id,
    payment_status: session.payment_status || null,
    product_name: PRODUCT_NAME,
    access_granted: true,
  };

  const { error: purchaseError } = await admin
    .from("purchases")
    .upsert(purchase, { onConflict: "stripe_session_id" });

  if (purchaseError) {
    console.error("[stripe:webhook] erro ao registrar compra", { message: purchaseError.message });
    return NextResponse.json(
      { error: "Erro ao registrar compra no Supabase." },
      { status: 500 },
    );
  }
  console.log("[stripe:webhook] compra registrada", { email, sessionId: session.id });

  const updatedAt = new Date().toISOString();
  const { data: updatedProfiles, error: profileUpdateError } = await admin
    .from("profiles")
    .update({ plan: PREMIUM_PLAN, updated_at: updatedAt })
    .eq("email", email)
    .select("user_id");

  if (profileUpdateError) {
    console.error("[stripe:webhook] erro ao liberar acesso em profiles", { message: profileUpdateError.message });
    return NextResponse.json(
      { error: "Compra registrada, mas houve erro ao atualizar perfil." },
      { status: 500 },
    );
  }

  const userId = updatedProfiles?.[0]?.user_id || null;
  if (userId) {
    const { error: subscriptionError } = await admin
      .from("subscriptions")
      .upsert({
        user_id: userId,
        stripe_customer_id: purchase.stripe_customer_id,
        stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : session.subscription?.id || null,
        plan: PREMIUM_PLAN,
        status: "active",
        updated_at: updatedAt,
      }, { onConflict: "user_id" });

    if (subscriptionError) {
      console.warn("[stripe:webhook] compra registrada, mas assinatura não foi atualizada", { message: subscriptionError.message });
    }
  }

  console.log("[stripe:webhook] acesso liberado", { email, linkedProfile: Boolean(userId) });

  return NextResponse.json({
    received: true,
    handled: true,
    event: event.type,
    email,
    access_granted: true,
    linked_profile: Boolean(userId),
  });
}
