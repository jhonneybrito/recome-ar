import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const { priceId } = await request.json();
  if (!stripe || !priceId) {
    return NextResponse.json({ mode: "mock", message: "Configure Stripe e envie um priceId." });
  }

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
    success_url: `${baseUrl}/settings?checkout=success`,
    cancel_url: `${baseUrl}/settings?checkout=cancelled`,
  });
  return NextResponse.json({ url: session.url });
}
