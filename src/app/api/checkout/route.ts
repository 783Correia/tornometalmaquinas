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

    // Validate stock
    for (const item of items) {
      const { data: product } = await supabase
        .from("products")
        .select("stock_quantity, manage_stock, name")
        .eq("id", item.id)
        .single();

      if (product?.manage_stock && product.stock_quantity < item.quantity) {
        return NextResponse.json(
          { error: `Produto "${product.name}" tem apenas ${product.stock_quantity} unidade(s) em estoque.` },
          { status: 409 }
        );
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

    // Create order
    const { data: order, error: orderErr } = await supabase.from("orders").insert({
      customer_id: userId,
      status: "pending",
      total: shipping.total,
      shipping_cost: shipping.price,
      payment_method: null,
      payment_status: "pending",
      notes: `Frete: ${shipping.company} - ${shipping.name} (${shipping.delivery_time} dias)`,
    }).select("id").single();

    if (orderErr || !order) {
      console.error("Order creation error:", orderErr);
      return NextResponse.json({ error: "Erro ao criar pedido" }, { status: 500 });
    }

    // Create order items
    const { error: itemsErr } = await supabase.from("order_items").insert(
      items.map((item: { id: number; name: string; quantity: number; price: number }) => ({
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
