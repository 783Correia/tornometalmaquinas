import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { orderId, shipping, payer } = body;

  if (!orderId) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  try {
    const { data: order } = await supabase
      .from("orders")
      .select("id, customer_id, status, shipping_cost")
      .eq("id", orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    if (order.status !== "pending") {
      return NextResponse.json({ error: "Pedido já processado" }, { status: 409 });
    }

    // Busca itens e preços reais do banco — ignora preços do cliente
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_id, product_name, quantity, price")
      .eq("order_id", orderId);

    if (!orderItems?.length) {
      return NextResponse.json({ error: "Itens do pedido não encontrados" }, { status: 404 });
    }

    // Valida preço real de cada produto no banco
    const verifiedItems = await Promise.all(
      orderItems.map(async (item) => {
        const { data: product } = await supabase
          .from("products")
          .select("price, sale_price, name")
          .eq("id", item.product_id)
          .single();

        const realPrice = product?.sale_price ?? product?.price ?? item.price;
        return {
          name: product?.name || item.product_name,
          quantity: item.quantity,
          unit_price: Number(realPrice),
        };
      })
    );

    const shippingCost = Number(order.shipping_cost || shipping?.price || 0);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tornometalevertonlopes.com.br";

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: verifiedItems.map((item) => ({
          id: String(orderId),
          title: item.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: "BRL",
        })),
        shipments: shippingCost > 0 ? {
          cost: shippingCost,
          mode: "not_specified",
        } : undefined,
        payer: payer ? { email: payer.email, name: payer.name } : undefined,
        back_urls: {
          success: `${siteUrl}/pagamento/sucesso?order=${orderId}`,
          failure: `${siteUrl}/pagamento/falha?order=${orderId}`,
          pending: `${siteUrl}/pagamento/pendente?order=${orderId}`,
        },
        auto_return: "approved",
        external_reference: String(orderId),
        notification_url: `${siteUrl}/api/webhook/mercadopago`,
      },
    });

    return NextResponse.json({
      id: result.id,
      init_point: result.init_point,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("MP Error:", message);
    return NextResponse.json({ error: "Erro ao criar pagamento", detail: message }, { status: 500 });
  }
}
