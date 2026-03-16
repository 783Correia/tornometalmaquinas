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

  // Consolidar todos os produtos em um único pacote
  let totalWeight = 0;
  let totalInsurance = 0;
  let maxWidth = 0;
  let maxLength = 0;
  let totalHeight = 0;

  for (const p of products as { weight: number; width: number; height: number; length: number; quantity: number; price: number }[]) {
    const qty = p.quantity || 1;

    // Peso: converter de gramas se necessário
    let weight = p.weight || 0.3;
    if (weight > 100) weight = weight / 1000;
    if (weight < 0.1) weight = 0.1;
    totalWeight += weight * qty;

    // Dimensões do produto (com defaults)
    const width = Math.max(Math.min(p.width || 11, 60), 1);
    const height = Math.max(Math.min(p.height || 11, 60), 1);
    const length = Math.max(Math.min(p.length || 16, 60), 1);

    // Maior largura e comprimento definem a base do pacote
    maxWidth = Math.max(maxWidth, width);
    maxLength = Math.max(maxLength, length);
    // Alturas se somam (empilhados)
    totalHeight += height * qty;

    totalInsurance += (p.price || 0) * qty;
  }

  // Limites do Melhor Envio: max 150cm por dimensão, max 30kg
  const packageWidth = Math.min(maxWidth, 150);
  const packageLength = Math.min(maxLength, 150);
  const packageHeight = Math.min(Math.max(totalHeight, 1), 150);
  const packageWeight = Math.min(Math.max(totalWeight, 0.1), 30);

  const payload = {
    from: { postal_code: FROM_CEP },
    to: { postal_code: cleanCep },
    products: [
      {
        id: "1",
        width: packageWidth,
        height: packageHeight,
        length: packageLength,
        weight: packageWeight,
        insurance_value: totalInsurance,
        quantity: 1,
      },
    ],
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
