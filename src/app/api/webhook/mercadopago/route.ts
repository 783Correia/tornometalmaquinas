import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function verifyWebhookSignature(req: NextRequest, body: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("⚠️ MP_WEBHOOK_SECRET not configured - webhook signature verification skipped");
    return true;
  }

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  if (!xSignature || !xRequestId) return false;

  const parts = xSignature.split(",");
  const ts = parts.find((p) => p.trim().startsWith("ts="))?.split("=")[1];
  const hash = parts.find((p) => p.trim().startsWith("v1="))?.split("=")[1];
  if (!ts || !hash) return false;

  const url = new URL(req.url);
  const dataId = url.searchParams.get("data.id") || "";
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const computedHash = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  return computedHash === hash;
}

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();

    // Verify webhook signature
    if (!verifyWebhookSignature(req, bodyText)) {
      console.error("Webhook signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(bodyText);

    if (body.type === "payment") {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: body.data.id });

      if (paymentData.external_reference) {
        const orderId = Number(paymentData.external_reference);
        let status = "pending";

        if (paymentData.status === "approved") status = "processing";
        else if (paymentData.status === "rejected") status = "cancelled";

        await supabase.from("orders").update({
          payment_status: paymentData.status || "unknown",
          payment_method: paymentData.payment_method_id || null,
          status,
        }).eq("id", orderId);

        // On payment approval: decrement stock + send email
        if (paymentData.status === "approved") {
          const { data: orderItems } = await supabase
            .from("order_items")
            .select("product_id, product_name, quantity, price")
            .eq("order_id", orderId);

          if (orderItems) {
            for (const item of orderItems) {
              await supabase.rpc("decrement_stock", {
                p_product_id: item.product_id,
                p_quantity: item.quantity,
              });
            }
          }

          // Get order + customer info for email
          const { data: order } = await supabase
            .from("orders")
            .select("*, customers(full_name, email)")
            .eq("id", orderId)
            .single();

          if (order?.customers) {
            const { sendPaymentApproved } = await import("@/lib/email/resend");
            await sendPaymentApproved({
              orderId,
              customerName: order.customers.full_name,
              customerEmail: order.customers.email,
              items: orderItems || [],
              total: order.total,
              shippingCost: order.shipping_cost,
            });
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
