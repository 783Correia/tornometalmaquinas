import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
