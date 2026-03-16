"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, ChevronDown, ChevronUp, Truck, Save } from "lucide-react";

type Order = {
  id: number;
  customer_id: string;
  status: string;
  total: number;
  shipping_cost: number;
  payment_method: string;
  tracking_code: string | null;
  notes: string | null;
  created_at: string;
  customers?: { full_name: string; email: string };
  order_items?: { id: number; product_name: string; quantity: number; price: number }[];
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-700" },
  processing: { label: "Processando", color: "bg-blue-100 text-blue-700" },
  shipped: { label: "Enviado", color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Entregue", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700" },
};

export default function AdminPedidos() {
  const [items, setItems] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase
      .from("orders")
      .select("*, customers(full_name, email), order_items(*)")
      .order("created_at", { ascending: false });
    setItems(data || []);
  }

  async function updateStatus(id: number, status: string) {
    await supabase.from("orders").update({ status }).eq("id", id);
    load();
  }

  async function updateTracking(id: number, code: string) {
    await supabase.from("orders").update({ tracking_code: code }).eq("id", id);
    load();
  }

  const filtered = items.filter((o) =>
    o.id.toString().includes(search) ||
    o.customers?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.customers?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos ({items.length})</h1>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Buscar por nº, nome ou email..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition" />
      </div>

      <div className="space-y-3">
        {filtered.map((order) => {
          const st = statusLabels[order.status] || statusLabels.pending;
          const isOpen = expanded === order.id;
          return (
            <div key={order.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpanded(isOpen ? null : order.id)}>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-900">#{order.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                  <span className="text-sm text-gray-500">{order.customers?.full_name || "—"}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-900">
                    R$ {Number(order.total).toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Cliente</p>
                      <p className="font-medium">{order.customers?.full_name}</p>
                      <p className="text-gray-400">{order.customers?.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Pagamento</p>
                      <p className="font-medium">{order.payment_method || "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Frete</p>
                      <p className="font-medium">R$ {Number(order.shipping_cost || 0).toFixed(2).replace(".", ",")}</p>
                    </div>
                  </div>

                  {order.order_items && order.order_items.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Itens</p>
                      <table className="w-full text-sm">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left">Produto</th>
                            <th className="px-3 py-2 text-center">Qtd</th>
                            <th className="px-3 py-2 text-right">Preço</th>
                            <th className="px-3 py-2 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {order.order_items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-3 py-2">{item.product_name}</td>
                              <td className="px-3 py-2 text-center">{item.quantity}</td>
                              <td className="px-3 py-2 text-right">R$ {Number(item.price).toFixed(2).replace(".", ",")}</td>
                              <td className="px-3 py-2 text-right">R$ {(item.quantity * Number(item.price)).toFixed(2).replace(".", ",")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700">Status:</label>
                      <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition">
                        <option value="pending">Pendente</option>
                        <option value="processing">Processando</option>
                        <option value="shipped">Enviado</option>
                        <option value="delivered">Entregue</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck size={16} className="text-gray-400" />
                      <input
                        type="text"
                        placeholder="Código de rastreio"
                        defaultValue={order.tracking_code || ""}
                        onBlur={(e) => {
                          if (e.target.value !== (order.tracking_code || "")) {
                            updateTracking(order.id, e.target.value);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateTracking(order.id, (e.target as HTMLInputElement).value);
                          }
                        }}
                        className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition w-52"
                      />
                    </div>
                  </div>
                  {order.notes && (
                    <p className="text-xs text-gray-400 mt-2">{order.notes}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-400">
            Nenhum pedido encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
