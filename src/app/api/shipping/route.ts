import { NextRequest, NextResponse } from "next/server";

const MELHOR_ENVIO_URL = "https://melhorenvio.com.br/api/v2/me/shipment/calculate";
const TOKEN = process.env.MELHOR_ENVIO_TOKEN!;
const FROM_CEP = process.env.MELHOR_ENVIO_FROM_CEP || "99070250";

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
    products: products.map((p: { weight: number; width: number; height: number; length: number; quantity: number; price: number }, i: number) => {
      // Ensure weight is reasonable (max 29kg per item, min 0.1kg)
      let weight = p.weight || 0.3;
      if (weight > 100) weight = weight / 1000; // probably in grams, convert to kg
      if (weight > 29) weight = 29;
      if (weight < 0.1) weight = 0.1;

      return {
        id: String(i + 1),
        width: Math.min(p.width || 11, 100),
        height: Math.min(p.height || 11, 100),
        length: Math.min(p.length || 16, 100),
        weight,
        insurance_value: p.price || 0,
        quantity: Math.min(p.quantity || 1, 10),
      };
    }),
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

    // Debug: return raw response if no valid options
    const allOptions = Array.isArray(data) ? data : [];
    if (allOptions.length === 0 || allOptions.every((s: { error?: string }) => s.error)) {
      return NextResponse.json({ options: [], debug: data });
    }

    const options = allOptions
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
