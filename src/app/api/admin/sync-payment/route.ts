import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const { orderId } = await req.json();
  if (!orderId) return NextResponse.json({ error: "orderId obrigatório" }, { status: 400 });

  // Check current order status BEFORE any update
  const { data: existingOrder } = await supabase
    .from("orders")
    .select("payment_status")
    .eq("id", orderId)
    .single();

  const alreadyProcessed = existingOrder?.payment_status === "approved";

  // Busca pagamentos no MP pelo external_reference (orderId)
  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/search?external_reference=${orderId}&sort=date_created&criteria=desc&limit=1`,
    { headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` } }
  );
  const data = await res.json();
  const payment = data?.results?.[0];

  if (!payment) {
    return NextResponse.json({ message: "Nenhum pagamento encontrado no Mercado Pago para este pedido." });
  }

  const paymentStatus = payment.status as string;
  let orderStatus = "pending";
  if (paymentStatus === "approved") orderStatus = "processing";
  else if (paymentStatus === "rejected") orderStatus = "cancelled";

  await supabase.from("orders").update({
    payment_status: paymentStatus,
    payment_method: payment.payment_method_id || null,
    status: orderStatus,
  }).eq("id", orderId);

  // Se aprovado pela primeira vez: decrementa estoque e envia email
  if (paymentStatus === "approved" && !alreadyProcessed) {
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

    const { data: order } = await supabase
      .from("orders")
      .select("*, customers(full_name, email), order_items(*)")
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
      }).catch((e) => console.error("Email error:", e));
    }
  }

  return NextResponse.json({ paymentStatus, orderStatus, paymentId: payment.id });
}
