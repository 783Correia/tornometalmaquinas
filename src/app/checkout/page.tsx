"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/lib/cart-store";
import { ShippingCalculator } from "@/components/shipping-calculator";
import { MapPin, Truck, CreditCard, Loader2, CheckCircle } from "lucide-react";

type Address = {
  address_zip: string;
  address_street: string;
  address_number: string;
  address_complement: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
};

type ShippingOption = {
  id: number;
  name: string;
  company: string;
  logo: string;
  price: number;
  delivery_time: number;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [userId, setUserId] = useState("");
  const [address, setAddress] = useState<Address>({
    address_zip: "", address_street: "", address_number: "",
    address_complement: "", address_neighborhood: "", address_city: "", address_state: "",
  });
  const [shipping, setShipping] = useState<ShippingOption | null>(null);
  const [cepLoading, setCepLoading] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login?redirect=/checkout"); return; }
      setUserId(user.id);
      const { data: profile } = await supabase.from("customers").select("*").eq("id", user.id).single();
      if (profile) {
        setAddress({
          address_zip: profile.address_zip || "",
          address_street: profile.address_street || "",
          address_number: profile.address_number || "",
          address_complement: profile.address_complement || "",
          address_neighborhood: profile.address_neighborhood || "",
          address_city: profile.address_city || "",
          address_state: profile.address_state || "",
        });
      }
      setLoading(false);
    }
    init();
  }, [router]);

  function updateAddress(field: keyof Address, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  async function fetchCep(cep: string) {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setAddress((prev) => ({
          ...prev,
          address_street: data.logradouro || prev.address_street,
          address_neighborhood: data.bairro || prev.address_neighborhood,
          address_city: data.localidade || prev.address_city,
          address_state: data.uf || prev.address_state,
          address_zip: clean,
        }));
      }
    } catch {}
    setCepLoading(false);
  }

  function formatCep(value: string) {
    const d = value.replace(/\D/g, "").slice(0, 8);
    return d.length > 5 ? d.replace(/(\d{5})(\d)/, "$1-$2") : d;
  }

  function canAdvanceStep1() {
    return address.address_zip && address.address_street && address.address_number && address.address_city && address.address_state;
  }

  async function handlePlaceOrder() {
    if (!shipping) return;
    setPlacing(true);

    // Validate stock before placing order
    for (const item of items) {
      const { data: product } = await supabase
        .from("products")
        .select("stock_quantity, manage_stock, name")
        .eq("id", item.id)
        .single();

      if (product?.manage_stock && product.stock_quantity < item.quantity) {
        alert(`Produto "${product.name}" tem apenas ${product.stock_quantity} unidade(s) em estoque.`);
        setPlacing(false);
        return;
      }
    }

    // Save address to customer profile
    await supabase.from("customers").update({
      address_zip: address.address_zip, address_street: address.address_street,
      address_number: address.address_number, address_complement: address.address_complement,
      address_neighborhood: address.address_neighborhood, address_city: address.address_city,
      address_state: address.address_state,
    }).eq("id", userId);

    // Create order
    const { data: order } = await supabase.from("orders").insert({
      customer_id: userId,
      status: "pending",
      total: totalPrice() + shipping.price,
      shipping_cost: shipping.price,
      payment_method: null,
      payment_status: "pending",
      notes: `Frete: ${shipping.company} - ${shipping.name} (${shipping.delivery_time} dias)`,
    }).select("id").single();

    if (order) {
      // Create order items
      await supabase.from("order_items").insert(
        items.map((item) => ({
          order_id: order.id,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
        }))
      );

      // Get user email for payer info
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("customers").select("full_name, email").eq("id", userId).single();

      // Send order confirmation email
      const fullAddress = `${address.address_street}, ${address.address_number}${address.address_complement ? ` - ${address.address_complement}` : ""} - ${address.address_neighborhood ? `${address.address_neighborhood}, ` : ""}${address.address_city}/${address.address_state} - CEP ${address.address_zip}`;
      fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "order_confirmation",
          data: {
            orderId: order.id,
            customerName: profile?.full_name || "",
            customerEmail: profile?.email || user?.email || "",
            items: items.map((item) => ({ product_name: item.name, quantity: item.quantity, price: item.price })),
            total: totalPrice() + shipping.price,
            shippingCost: shipping.price,
            shippingMethod: `${shipping.company} - ${shipping.name}`,
            address: fullAddress,
          },
        }),
      }).catch((err) => console.error("Erro ao enviar email de confirmação:", err));

      // Create Mercado Pago preference
      try {
        const mpRes = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            items: items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            shipping: shipping ? { price: shipping.price } : null,
            payer: { email: profile?.email || user?.email, name: profile?.full_name || "" },
          }),
        });
        const mpData = await mpRes.json();

        if (mpData.init_point) {
          clearCart();
          window.location.href = mpData.init_point;
          return;
        }
      } catch (err) {
        console.error("MP error:", err);
      }

      // Fallback: go to order confirmation
      clearCart();
      router.push(`/pedido-confirmado?id=${order.id}`);
    } else {
      setPlacing(false);
    }
  }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-gray-400">Carregando...</div>;

  if (items.length === 0) {
    router.push("/carrinho");
    return null;
  }

  const inputClass = "w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition";

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Finalizar Compra</h1>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { n: 1, label: "Endereço", icon: <MapPin size={16} /> },
            { n: 2, label: "Frete", icon: <Truck size={16} /> },
            { n: 3, label: "Confirmação", icon: <CreditCard size={16} /> },
          ].map((s) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                step >= s.n ? "bg-primary text-white" : "bg-white text-gray-400 border border-gray-200"
              }`}>
                {step > s.n ? <CheckCircle size={16} /> : s.icon} {s.label}
              </div>
              {s.n < 3 && <div className={`w-8 h-0.5 ${step > s.n ? "bg-primary" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2">
            {/* Step 1 - Address */}
            {step === 1 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-semibold text-gray-900">Endereço de Entrega</h2>
                <div className="max-w-xs">
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                  <div className="flex gap-2">
                    <input type="text" value={formatCep(address.address_zip)}
                      onChange={(e) => updateAddress("address_zip", e.target.value.replace(/\D/g, ""))}
                      onBlur={(e) => fetchCep(e.target.value)}
                      className={inputClass} placeholder="00000-000" />
                    {cepLoading && <Loader2 size={20} className="animate-spin text-primary mt-2" />}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rua *</label>
                    <input type="text" value={address.address_street} onChange={(e) => updateAddress("address_street", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                    <input type="text" value={address.address_number} onChange={(e) => updateAddress("address_number", e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                  <input type="text" value={address.address_complement} onChange={(e) => updateAddress("address_complement", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                  <input type="text" value={address.address_neighborhood} onChange={(e) => updateAddress("address_neighborhood", e.target.value)} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                    <input type="text" value={address.address_city} onChange={(e) => updateAddress("address_city", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                    <select value={address.address_state} onChange={(e) => updateAddress("address_state", e.target.value)} className={inputClass}>
                      <option value="">Selecione</option>
                      {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map((uf) => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button onClick={() => setStep(2)} disabled={!canAdvanceStep1()}
                  className="bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-dark transition disabled:opacity-50">
                  Continuar para Frete
                </button>
              </div>
            )}

            {/* Step 2 - Shipping */}
            {step === 2 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-semibold text-gray-900">Escolha o Frete</h2>
                <p className="text-sm text-gray-500">
                  Entrega para: {address.address_street}, {address.address_number} - {address.address_city}/{address.address_state} - CEP {formatCep(address.address_zip)}
                </p>
                <ShippingCalculator
                  products={items.map((item) => ({
                    weight: item.weight || 0.3,
                    width: item.width || 11,
                    height: item.height || 11,
                    length: item.length || 16,
                    quantity: item.quantity,
                    price: item.price,
                  }))}
                  onSelect={(opt) => setShipping(opt)}
                />
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)}
                    className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition">
                    Voltar
                  </button>
                  <button onClick={() => setStep(3)} disabled={!shipping}
                    className="bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-dark transition disabled:opacity-50">
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 - Confirmation */}
            {step === 3 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
                <h2 className="font-semibold text-gray-900">Confirme seu Pedido</h2>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Endereço de entrega</p>
                  <p className="text-sm text-gray-500">
                    {address.address_street}, {address.address_number}
                    {address.address_complement ? ` - ${address.address_complement}` : ""}
                    <br />
                    {address.address_neighborhood ? `${address.address_neighborhood} - ` : ""}
                    {address.address_city}/{address.address_state} - CEP {formatCep(address.address_zip)}
                  </p>
                </div>

                {shipping && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Frete selecionado</p>
                    <p className="text-sm text-gray-500">
                      {shipping.company} - {shipping.name} | R$ {shipping.price.toFixed(2).replace(".", ",")} | {shipping.delivery_time} dias úteis
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Itens do pedido</p>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 text-sm">
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {item.image && <Image src={item.image} alt="" fill className="object-cover" sizes="48px" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 truncate">{item.name}</p>
                          <p className="text-gray-400">Qtd: {item.quantity}</p>
                        </div>
                        <span className="font-medium text-gray-900">R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(2)}
                    className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition">
                    Voltar
                  </button>
                  <button onClick={handlePlaceOrder} disabled={placing}
                    className="flex-1 bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2">
                    {placing ? <><Loader2 size={18} className="animate-spin" /> Processando...</> : "Confirmar Pedido"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Resumo</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Produtos ({items.reduce((a, i) => a + i.quantity, 0)})</span>
                  <span>R$ {totalPrice().toFixed(2).replace(".", ",")}</span>
                </div>
                {shipping && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Frete</span>
                    <span>R$ {shipping.price.toFixed(2).replace(".", ",")}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-gray-100 text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary">
                    R$ {(totalPrice() + (shipping?.price || 0)).toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
