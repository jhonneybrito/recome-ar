import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { priceId, plan } = await request.json();
  if (!stripe || !priceId) {
    return NextResponse.json({ mode: "mock", message: "Configure Stripe e envie um priceId." });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Entre na sua conta antes de assinar." }, { status: 401 });

  const vercelUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : null;
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    vercelUrl ||
    new URL(request.url).origin
  ).replace(/\/$/, "");

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: { user_id: user.id, plan: plan || "premium_monthly" },
    subscription_data: { metadata: { user_id: user.id, plan: plan || "premium_monthly" } },
    success_url: `${baseUrl}/plans?checkout=success`,
    cancel_url: `${baseUrl}/plans?checkout=cancelled`,
  });
  return NextResponse.json({ url: session.url });
}
