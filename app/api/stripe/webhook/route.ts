import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ message: "Webhook não configurado." }, { status: 503 });
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ message: "Assinatura ausente." }, { status: 400 });
  let event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ message: "Assinatura inválida." }, { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.user_id || session.client_reference_id;
    const plan = session.metadata?.plan || "premium_monthly";
    if (userId) {
      const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      await admin.from("profiles").update({ plan }).eq("user_id", userId);
      await admin.from("subscriptions").upsert({ user_id: userId, stripe_customer_id: String(session.customer || ""), stripe_subscription_id: String(session.subscription || ""), plan, status: "active", updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    }
  }
  return NextResponse.json({ received: true });
}
