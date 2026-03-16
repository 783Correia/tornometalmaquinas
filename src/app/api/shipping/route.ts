import { NextRequest, NextResponse } from "next/server";

const MELHOR_ENVIO_URL = "https://melhorenvio.com.br/api/v2/me/shipment/calculate";
const TOKEN = process.env.MELHOR_ENVIO_TOKEN!;
const FROM_CEP = process.env.MELHOR_ENVIO_FROM_CEP || "99010100";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { to_cep, products } = body;

  if (!to_cep || !products?.length) {
    return NextResponse.json({ error: "CEP e produtos são obrigatórios" }, { status: 400 });
  }

  const cleanCep = to_cep.replace(/\D/g, "");

  const payload = {
    from: { postal_code: FROM_CEP },
    to: { postal_code: cleanCep },
    products: products.map((p: { weight: number; width: number; height: number; length: number; quantity: number; price: number }) => ({
      id: "1",
      width: p.width || 11,
      height: p.height || 11,
      length: p.length || 16,
      weight: p.weight || 0.3,
      insurance_value: p.price || 0,
      quantity: p.quantity || 1,
    })),
  };

  try {
    const res = await fetch(MELHOR_ENVIO_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/json",
        "User-Agent": "TornoMetal (yuricorrea.ty@gmail.com)",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    const options = (Array.isArray(data) ? data : [])
      .filter((s: { error?: string }) => !s.error)
      .map((s: { id: number; name: string; company: { name: string; picture: string }; price: string; discount: string; delivery_time: number; custom_price: string }) => ({
        id: s.id,
        name: s.name,
        company: s.company?.name,
        logo: s.company?.picture,
        price: parseFloat(s.custom_price || s.price),
        discount: parseFloat(s.discount || "0"),
        delivery_time: s.delivery_time,
      }))
      .sort((a: { price: number }, b: { price: number }) => a.price - b.price);

    return NextResponse.json({ options });
  } catch {
    return NextResponse.json({ error: "Erro ao calcular frete" }, { status: 500 });
  }
}
