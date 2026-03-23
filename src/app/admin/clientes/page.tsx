"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, ChevronDown, ChevronUp, Save, ShoppingBag } from "lucide-react";

type Customer = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  cpf: string;
  cnpj: string | null;
  created_at: string;
  address_street?: string;
  address_number?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
};

type CustomerOrder = {
  id: number;
  status: string;
  total: number;
  created_at: string;
};

const statusLabels: Record<string, string> = {
  pending: "Pendente", processing: "Processando", shipped: "Enviado",
  delivered: "Entregue", cancelled: "Cancelado",
};

export default function AdminClientes() {
  const [items, setItems] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [orders, setOrders] = useState<Record<string, CustomerOrder[]>>({});
  const [editing, setEditing] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    setItems(data || []);
  }

  async function loadOrders(customerId: string) {
    if (orders[customerId]) return;
    const { data } = await supabase.from("orders")
      .select("id, status, total, created_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });
    setOrders((prev) => ({ ...prev, [customerId]: data || [] }));
  }

  async function toggleExpand(c: Customer) {
    if (expanded === c.id) {
      setExpanded(null);
      setEditing(null);
    } else {
      setExpanded(c.id);
      setEditing({ ...c });
      loadOrders(c.id);
    }
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase.from("customers").update({
      full_name: editing.full_name,
      phone: editing.phone,
      cpf: editing.cpf,
      cnpj: editing.cnpj,
      address_street: editing.address_street,
      address_number: editing.address_number,
      address_city: editing.address_city,
      address_state: editing.address_state,
      address_zip: editing.address_zip,
    }).eq("id", editing.id);

    if (error) {
      setMessage("Erro ao salvar.");
    } else {
      setMessage("Dados salvos!");
      setItems((prev) => prev.map((c) => c.id === editing.id ? { ...c, ...editing } : c));
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  }

  const filtered = items.filter((c) =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.cpf?.includes(search)
  );

  // Calculate totals per customer
  const customerTotals = (id: string) => {
    const o = orders[id] || [];
    const total = o.filter((x) => x.status !== "cancelled").reduce((sum, x) => sum + Number(x.total), 0);
    return { count: o.length, total };
  };

  const inputClass = "w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition";
  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clientes ({items.length})</h1>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Buscar por nome, email ou CPF..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition" />
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${message.includes("Erro") ? "bg-red-50 border-red-200 text-red-600" : "bg-green-50 border-green-200 text-green-600"}`}>
          {message}
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((c) => {
          const isOpen = expanded === c.id;
          const ct = customerTotals(c.id);

          return (
            <div key={c.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(c)}>
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{c.full_name?.charAt(0)?.toUpperCase() || "?"}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{c.full_name}</p>
                    <p className="text-xs text-gray-400 truncate">{c.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-gray-400">{c.phone || ""}</span>
                  <span className="text-xs text-gray-400">
                    {c.address_city && c.address_state ? `${c.address_city}/${c.address_state}` : ""}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString("pt-BR")}</span>
                  {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
              </div>

              {isOpen && editing && (
                <div className="border-t border-gray-100 px-5 py-5 space-y-5">
                  {/* Edit form */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Dados do Cliente</h3>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Nome</label>
                        <input type="text" value={editing.full_name || ""} onChange={(e) => setEditing({ ...editing, full_name: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Telefone</label>
                        <input type="text" value={editing.phone || ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">CPF</label>
                        <input type="text" value={editing.cpf || ""} onChange={(e) => setEditing({ ...editing, cpf: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">CNPJ</label>
                        <input type="text" value={editing.cnpj || ""} onChange={(e) => setEditing({ ...editing, cnpj: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Cidade</label>
                        <input type="text" value={editing.address_city || ""} onChange={(e) => setEditing({ ...editing, address_city: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">UF</label>
                        <input type="text" value={editing.address_state || ""} onChange={(e) => setEditing({ ...editing, address_state: e.target.value })} className={inputClass} maxLength={2} />
                      </div>
                    </div>
                    <button onClick={handleSave} disabled={saving}
                      className="mt-3 flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-dark transition disabled:opacity-50">
                      <Save size={16} /> {saving ? "Salvando..." : "Salvar"}
                    </button>
                  </div>

                  {/* Orders */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <ShoppingBag size={16} /> Pedidos ({ct.count})
                      {ct.count > 0 && <span className="text-xs text-gray-400 font-normal">— Total: {fmt(ct.total)}</span>}
                    </h3>
                    {(orders[c.id] || []).length === 0 ? (
                      <p className="text-sm text-gray-400">Nenhum pedido.</p>
                    ) : (
                      <div className="space-y-2">
                        {orders[c.id].map((order) => (
                          <div key={order.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5 text-sm">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-gray-900">#{order.id}</span>
                              <span className="text-xs text-gray-500">{statusLabels[order.status] || order.status}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-primary">{fmt(Number(order.total))}</span>
                              <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString("pt-BR")}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-400">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
