"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Customer, Order } from "@/lib/supabase";
import {
  User,
  Package,
  MapPin,
  LogOut,
  Save,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

type Tab = "perfil" | "endereco" | "pedidos";

export default function MinhaContaPage() {
  const [tab, setTab] = useState<Tab>("perfil");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("customers")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) setCustomer(profile);

    const { data: orderData } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

    if (orderData) setOrders(orderData);
    setLoading(false);
  }

  async function handleSave() {
    if (!customer) return;
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("customers")
      .update({
        full_name: customer.full_name,
        phone: customer.phone,
        cpf: customer.cpf,
        address_street: customer.address_street,
        address_number: customer.address_number,
        address_complement: customer.address_complement,
        address_neighborhood: customer.address_neighborhood,
        address_city: customer.address_city,
        address_state: customer.address_state,
        address_zip: customer.address_zip,
      })
      .eq("id", customer.id);

    if (error) {
      setMessage("Erro ao salvar.");
    } else {
      setMessage("Dados salvos com sucesso!");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  function update(field: keyof Customer, value: string) {
    if (!customer) return;
    setCustomer({ ...customer, [field]: value });
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (!customer) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "perfil", label: "Perfil", icon: <User size={18} /> },
    { id: "endereco", label: "Endereço", icon: <MapPin size={18} /> },
    { id: "pedidos", label: "Pedidos", icon: <Package size={18} /> },
  ];

  const statusLabels: Record<string, string> = {
    pending: "Pendente",
    paid: "Pago",
    shipped: "Enviado",
    delivered: "Entregue",
    cancelled: "Cancelado",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500",
    paid: "bg-blue-500/10 text-blue-500",
    shipped: "bg-purple-500/10 text-purple-500",
    delivered: "bg-green-500/10 text-green-500",
    cancelled: "bg-red-500/10 text-red-500",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Minha Conta</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition"
        >
          <LogOut size={16} /> Sair
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl text-sm ${
            message.includes("Erro")
              ? "bg-red-500/10 border border-red-500/30 text-red-400"
              : "bg-green-500/10 border border-green-500/30 text-green-400"
          }`}
        >
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              tab === t.id
                ? "bg-primary text-black"
                : "bg-dark-800 text-gray-400 hover:text-white border border-dark-600"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
        {/* Perfil */}
        {tab === "perfil" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Nome completo
              </label>
              <input
                type="text"
                value={customer.full_name}
                onChange={(e) => update("full_name", e.target.value)}
                className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                value={customer.email}
                disabled
                className="w-full bg-dark-700/50 border border-dark-500 rounded-xl px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Telefone
                </label>
                <input
                  type="text"
                  value={customer.phone || ""}
                  onChange={(e) => update("phone", e.target.value)}
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  CPF
                </label>
                <input
                  type="text"
                  value={customer.cpf || ""}
                  onChange={(e) => update("cpf", e.target.value)}
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary transition"
                />
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-black font-semibold px-6 py-3 rounded-xl hover:bg-primary-light transition disabled:opacity-50"
            >
              <Save size={18} /> {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        )}

        {/* Endereço */}
        {tab === "endereco" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                CEP
              </label>
              <input
                type="text"
                value={customer.address_zip || ""}
                onChange={(e) => update("address_zip", e.target.value)}
                className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary transition max-w-xs"
                placeholder="00000-000"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Rua
                </label>
                <input
                  type="text"
                  value={customer.address_street || ""}
                  onChange={(e) => update("address_street", e.target.value)}
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Número
                </label>
                <input
                  type="text"
                  value={customer.address_number || ""}
                  onChange={(e) => update("address_number", e.target.value)}
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Complemento
              </label>
              <input
                type="text"
                value={customer.address_complement || ""}
                onChange={(e) => update("address_complement", e.target.value)}
                className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Bairro
              </label>
              <input
                type="text"
                value={customer.address_neighborhood || ""}
                onChange={(e) =>
                  update("address_neighborhood", e.target.value)
                }
                className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Cidade
                </label>
                <input
                  type="text"
                  value={customer.address_city || ""}
                  onChange={(e) => update("address_city", e.target.value)}
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Estado
                </label>
                <select
                  value={customer.address_state || ""}
                  onChange={(e) => update("address_state", e.target.value)}
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary transition"
                >
                  <option value="">Selecione</option>
                  {[
                    "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
                  ].map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-black font-semibold px-6 py-3 rounded-xl hover:bg-primary-light transition disabled:opacity-50"
            >
              <Save size={18} /> {saving ? "Salvando..." : "Salvar Endereço"}
            </button>
          </div>
        )}

        {/* Pedidos */}
        {tab === "pedidos" && (
          <div>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto mb-3 text-gray-600" size={48} />
                <p className="text-gray-500 mb-4">
                  Você ainda não fez nenhum pedido.
                </p>
                <Link
                  href="/loja"
                  className="text-primary hover:underline text-sm"
                >
                  Ver produtos →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-dark-700 rounded-xl p-4 border border-dark-500"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">
                        Pedido #{order.id}
                      </span>
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${
                          statusColors[order.status] || "bg-gray-500/10 text-gray-500"
                        }`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(order.created_at).toLocaleDateString("pt-BR")}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold">
                        R$ {order.total.toFixed(2)}
                      </span>
                      {order.tracking_code && (
                        <span className="text-xs text-gray-400">
                          Rastreio: {order.tracking_code}
                        </span>
                      )}
                    </div>
                    {order.order_items && order.order_items.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-dark-500 space-y-1">
                        {order.order_items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm text-gray-400"
                          >
                            <span>
                              {item.quantity}x {item.product_name}
                            </span>
                            <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
