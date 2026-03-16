import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { orderId, items, shipping, payer } = body;

  if (!orderId || !items?.length) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  try {
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: items.map((item: { name: string; quantity: number; price: number }) => ({
          id: String(orderId),
          title: item.name,
          quantity: item.quantity,
          unit_price: Number(item.price),
          currency_id: "BRL",
        })),
        shipments: shipping ? {
          cost: Number(shipping.price),
          mode: "not_specified",
        } : undefined,
        payer: payer ? {
          email: payer.email,
          name: payer.name,
        } : undefined,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL || "https://tornometalevertonlopes.com.br"}/pagamento/sucesso?order=${orderId}`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL || "https://tornometalevertonlopes.com.br"}/pagamento/falha?order=${orderId}`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL || "https://tornometalevertonlopes.com.br"}/pagamento/pendente?order=${orderId}`,
        },
        auto_return: "approved",
        external_reference: String(orderId),
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://tornometalevertonlopes.com.br"}/api/webhook/mercadopago`,
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
