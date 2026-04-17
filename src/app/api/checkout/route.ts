import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, items, shipping, address } = body;

    if (!userId || !items?.length || !shipping || !address) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Check if customer profile exists
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("id", userId)
      .single();

    if (!existingCustomer) {
      // Customer registered with old broken system - create profile from auth data
      const { data: { user } } = await supabase.auth.admin.getUserById(userId);
      if (user) {
        await supabase.from("customers").insert({
          id: userId,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Cliente",
          email: user.email || "",
          phone: null,
          cpf: null,
        });
      } else {
        return NextResponse.json({ error: "Usuário não encontrado. Faça login novamente." }, { status: 401 });
      }
    }

    // Save address
    await supabase.from("customers").update({
      address_zip: address.address_zip,
      address_street: address.address_street,
      address_number: address.address_number,
      address_complement: address.address_complement,
      address_neighborhood: address.address_neighborhood,
      address_city: address.address_city,
      address_state: address.address_state,
    }).eq("id", userId);

    // Fetch real prices from DB for each item
    const verifiedItems = await Promise.all(
      items.map(async (item: { id: number; name: string; quantity: number }) => {
        const { data: product } = await supabase
          .from("products")
          .select("price, sale_price, name")
          .eq("id", item.id)
          .single();
        const realPrice = product?.sale_price ?? product?.price ?? 0;
        return {
          id: item.id,
          name: product?.name || item.name,
          quantity: item.quantity,
          price: Number(realPrice),
        };
      })
    );

    const itemsTotal = verifiedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const orderTotal = itemsTotal + Number(shipping.price);

    // Create order
    const { data: order, error: orderErr } = await supabase.from("orders").insert({
      customer_id: userId,
      status: "pending",
      total: orderTotal,
      shipping_cost: shipping.price,
      payment_method: null,
      payment_status: "pending",
      notes: `Frete: ${shipping.company} - ${shipping.name} (${shipping.delivery_time} dias)`,
    }).select("id").single();

    if (orderErr || !order) {
      console.error("Order creation error:", orderErr);
      return NextResponse.json({ error: `Erro ao criar pedido: ${orderErr?.message || "erro desconhecido"}` }, { status: 500 });
    }

    // Create order items with real prices from DB
    const { error: itemsErr } = await supabase.from("order_items").insert(
      verifiedItems.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
      }))
    );

    if (itemsErr) {
      console.error("Order items error:", itemsErr);
      return NextResponse.json({ error: "Erro ao salvar itens" }, { status: 500 });
    }

    // Get customer profile for payment/email
    const { data: profile } = await supabase
      .from("customers")
      .select("full_name, email")
      .eq("id", userId)
      .single();

    return NextResponse.json({
      orderId: order.id,
      customerName: profile?.full_name || "",
      customerEmail: profile?.email || "",
    });
  } catch (err) {
    console.error("Checkout API error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
