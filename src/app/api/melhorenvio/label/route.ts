import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendShippingNotification } from "@/lib/email/resend";

const ME_BASE = "https://melhorenvio.com.br/api/v2/me";
const TOKEN = process.env.MELHOR_ENVIO_TOKEN!;

const FROM = {
  name: process.env.MELHOR_ENVIO_FROM_NAME || "TornoMetal Everton Lopes",
  phone: process.env.MELHOR_ENVIO_FROM_PHONE || "54331539690",
  email: process.env.MELHOR_ENVIO_FROM_EMAIL || "tornometal.maquina@hotmail.com",
  document: process.env.MELHOR_ENVIO_FROM_DOCUMENT || "",
  company_document: process.env.MELHOR_ENVIO_FROM_DOCUMENT || "",
  state_register: null as null,
  address: process.env.MELHOR_ENVIO_FROM_ADDRESS || "",
  number: process.env.MELHOR_ENVIO_FROM_NUMBER || "",
  complement: null as null,
  district: process.env.MELHOR_ENVIO_FROM_DISTRICT || "",
  city: process.env.MELHOR_ENVIO_FROM_CITY || "Passo Fundo",
  country_id: "BR",
  postal_code: (process.env.MELHOR_ENVIO_FROM_CEP || "99070250").replace(/\D/g, ""),
  note: null as null,
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function meHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
    Accept: "application/json",
    "User-Agent": "TornoMetal (tornometal.maquina@hotmail.com)",
  };
}

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: "orderId obrigatório" }, { status: 400 });

    // Busca pedido completo
    const { data: order } = await supabase
      .from("orders")
      .select("*, customers(*), order_items(*)")
      .eq("id", orderId)
      .single();

    if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    if (order.payment_status !== "approved") return NextResponse.json({ error: "Pedido ainda não foi pago" }, { status: 400 });
    if (order.tracking_code) return NextResponse.json({ error: "Etiqueta já gerada", trackingCode: order.tracking_code }, { status: 409 });

    const customer = order.customers;
    if (!customer?.address_street) return NextResponse.json({ error: "Endereço do cliente incompleto" }, { status: 400 });

    // Extrai serviceId das notes do pedido
    const serviceIdMatch = order.notes?.match(/serviceId:(\d+)/);
    const serviceId = serviceIdMatch ? parseInt(serviceIdMatch[1]) : 1;

    // Busca dimensões reais dos produtos
    const productIds = order.order_items.map((i: { product_id: number }) => i.product_id);
    const { data: products } = await supabase
      .from("products")
      .select("id, weight, width, height, length")
      .in("id", productIds);

    const productMap = new Map((products || []).map((p: { id: number; weight: number; width: number; height: number; length: number }) => [p.id, p]));

    // Consolida dimensões do pacote (mesmo algoritmo do frete)
    let totalWeight = 0, totalVolume = 0, maxDimension = 0, totalInsurance = 0;
    for (const item of order.order_items) {
      const prod = productMap.get(item.product_id);
      const qty = item.quantity;
      let w = prod?.weight || 0.3;
      if (w > 100) w = w / 1000;
      if (w < 0.1) w = 0.1;
      totalWeight += w * qty;
      const pw = Math.max(prod?.width || 8, 1);
      const ph = Math.max(prod?.height || 8, 1);
      const pl = Math.max(prod?.length || 10, 1);
      totalVolume += pw * ph * pl * qty;
      maxDimension = Math.max(maxDimension, pw, ph, pl);
      totalInsurance += item.price * qty;
    }
    const cubeRoot = Math.cbrt(totalVolume * 1.2);
    const base = Math.max(Math.ceil(cubeRoot), maxDimension);
    const pkgW = Math.min(Math.max(base, 11), 100);
    const pkgL = Math.min(Math.max(base, 11), 100);
    const pkgH = Math.min(Math.max(Math.ceil((totalVolume * 1.2) / (pkgW * pkgL)), 2), 100);
    const pkgWeight = Math.min(Math.max(totalWeight, 0.3), 30);

    const cartPayload = {
      service: serviceId,
      from: FROM,
      to: {
        name: customer.full_name,
        phone: customer.phone?.replace(/\D/g, "") || "",
        email: customer.email,
        document: customer.cpf?.replace(/\D/g, "") || customer.cnpj?.replace(/\D/g, "") || "",
        company_document: customer.cnpj?.replace(/\D/g, "") || null,
        state_register: customer.inscricao_estadual || null,
        address: customer.address_street,
        number: customer.address_number || "S/N",
        complement: customer.address_complement || null,
        district: customer.address_neighborhood || "",
        city: customer.address_city || "",
        country_id: "BR",
        postal_code: customer.address_zip?.replace(/\D/g, "") || "",
        note: null,
      },
      products: order.order_items.map((item: { product_name: string; quantity: number; price: number }) => ({
        name: item.product_name,
        quantity: item.quantity,
        unitary_value: Number(item.price),
      })),
      volumes: [{ height: pkgH, width: pkgW, length: pkgL, weight: pkgWeight }],
      options: {
        insurance_value: totalInsurance,
        receipt: false,
        own_hand: false,
        reverse: false,
        non_commercial: false,
        invoice: { key: null },
        platform: "TornoMetal",
        tags: [{ tag: `pedido-${orderId}`, url: null }],
      },
    };

    // 1. Adiciona ao carrinho Melhor Envio
    const cartRes = await fetch(`${ME_BASE}/cart`, {
      method: "POST",
      headers: meHeaders(),
      body: JSON.stringify(cartPayload),
    });
    const cartData = await cartRes.json();
    if (!cartRes.ok || cartData.errors) {
      return NextResponse.json({ error: "Erro no carrinho Melhor Envio", detail: cartData }, { status: 500 });
    }
    const cartId = cartData.id;

    // 2. Checkout (debita do saldo ME)
    const checkoutRes = await fetch(`${ME_BASE}/shipment/checkout`, {
      method: "POST",
      headers: meHeaders(),
      body: JSON.stringify({ orders: [cartId] }),
    });
    if (!checkoutRes.ok) {
      const err = await checkoutRes.json();
      return NextResponse.json({ error: "Saldo insuficiente no Melhor Envio ou erro no checkout", detail: err }, { status: 500 });
    }

    // 3. Gera etiqueta
    const generateRes = await fetch(`${ME_BASE}/shipment/generate`, {
      method: "POST",
      headers: meHeaders(),
      body: JSON.stringify({ orders: [cartId] }),
    });
    const generateData = await generateRes.json();
    const labelInfo = generateData?.[cartId];
    const trackingCode = labelInfo?.tracking;
    const labelUrl = labelInfo?.label?.url || null;

    if (!trackingCode) {
      return NextResponse.json({ error: "Etiqueta gerada mas rastreio indisponível no momento", labelUrl }, { status: 206 });
    }

    // Salva rastreio e marca como enviado
    await supabase.from("orders").update({
      tracking_code: trackingCode,
      status: "shipped",
    }).eq("id", orderId);

    // Envia email de rastreio pro cliente
    const shippingMethod = order.notes?.split("|")[0]?.replace("Frete: ", "").trim() || "";
    await sendShippingNotification({
      orderId,
      customerName: customer.full_name,
      customerEmail: customer.email,
      items: order.order_items,
      total: order.total,
      shippingCost: order.shipping_cost,
      trackingCode,
      shippingMethod,
    }).catch(() => {});

    return NextResponse.json({ trackingCode, labelUrl });
  } catch (err) {
    console.error("Label generation error:", err);
    return NextResponse.json({ error: "Erro interno ao gerar etiqueta" }, { status: 500 });
  }
}
