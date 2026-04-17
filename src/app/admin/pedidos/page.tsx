"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, ChevronDown, ChevronUp, Truck, Filter, CheckSquare, Square, Tag, ExternalLink } from "lucide-react";

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
  payment_status?: string;
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

const paymentLabels: Record<string, { label: string; color: string }> = {
  approved: { label: "Aprovado", color: "bg-green-100 text-green-700" },
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-700" },
  rejected: { label: "Rejeitado", color: "bg-red-100 text-red-700" },
  in_process: { label: "Em análise", color: "bg-blue-100 text-blue-700" },
};

type StatusFilter = "all" | "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export default function AdminPedidos() {
  const [items, setItems] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [generatingLabel, setGeneratingLabel] = useState<number | null>(null);
  const [labelResult, setLabelResult] = useState<Record<number, { trackingCode?: string; labelUrl?: string; error?: string }>>({});

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

  async function generateLabel(orderId: number) {
    setGeneratingLabel(orderId);
    try {
      const res = await fetch("/api/melhorenvio/label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLabelResult((prev) => ({ ...prev, [orderId]: { error: data.error || "Erro ao gerar etiqueta" } }));
      } else {
        setLabelResult((prev) => ({ ...prev, [orderId]: { trackingCode: data.trackingCode, labelUrl: data.labelUrl } }));
        load();
      }
    } catch {
      setLabelResult((prev) => ({ ...prev, [orderId]: { error: "Erro de conexão" } }));
    }
    setGeneratingLabel(null);
  }

  async function updateTracking(id: number, code: string) {
    await supabase.from("orders").update({ tracking_code: code }).eq("id", id);

    if (code) {
      const order = items.find((o) => o.id === id);
      if (order?.customers) {
        fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "shipping",
            data: {
              orderId: id,
              customerName: order.customers.full_name,
              customerEmail: order.customers.email,
              items: order.order_items?.map((i) => ({ product_name: i.product_name, quantity: i.quantity, price: i.price })) || [],
              total: order.total,
              shippingCost: order.shipping_cost,
              trackingCode: code,
              shippingMethod: order.notes?.replace("Frete: ", "") || "",
            },
          }),
        }).catch((err) => console.error("Erro ao enviar email de rastreio:", err));
      }
    }
    load();
  }

  async function handleBulkUpdate() {
    if (!bulkStatus || selectedIds.size === 0) return;
    if (!confirm(`Alterar ${selectedIds.size} pedido(s) para "${statusLabels[bulkStatus]?.label}"?`)) return;
    for (const id of selectedIds) {
      await supabase.from("orders").update({ status: bulkStatus }).eq("id", id);
    }
    setSelectedIds(new Set());
    setBulkStatus("");
    load();
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((o) => o.id)));
    }
  }

  const filtered = items.filter((o) => {
    const matchSearch = !search ||
      o.id.toString().includes(search) ||
      o.customers?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customers?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = items.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const fmt = (v: number) => `R$ ${Number(v).toFixed(2).replace(".", ",")}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos ({items.length})</h1>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: "all" as StatusFilter, label: "Todos", count: items.length },
          { key: "pending" as StatusFilter, label: "Pendentes", count: statusCounts.pending || 0 },
          { key: "processing" as StatusFilter, label: "Processando", count: statusCounts.processing || 0 },
          { key: "shipped" as StatusFilter, label: "Enviados", count: statusCounts.shipped || 0 },
          { key: "delivered" as StatusFilter, label: "Entregues", count: statusCounts.delivered || 0 },
          { key: "cancelled" as StatusFilter, label: "Cancelados", count: statusCounts.cancelled || 0 },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatusFilter(tab.key); setSelectedIds(new Set()); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              statusFilter === tab.key
                ? "bg-primary text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-primary/30"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Search + bulk actions */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar por nº, nome ou email..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition" />
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
            <Filter size={14} className="text-blue-500" />
            <span className="text-sm text-blue-700 font-medium">{selectedIds.size} selecionado(s)</span>
            <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}
              className="border border-blue-200 rounded-lg px-2 py-1 text-sm outline-none">
              <option value="">Alterar status...</option>
              <option value="pending">Pendente</option>
              <option value="processing">Processando</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregue</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <button onClick={handleBulkUpdate} disabled={!bulkStatus}
              className="bg-primary text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-primary-dark transition disabled:opacity-50">
              Aplicar
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* Select all */}
        {filtered.length > 0 && (
          <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition px-1">
            {selectedIds.size === filtered.length ? <CheckSquare size={16} /> : <Square size={16} />}
            {selectedIds.size === filtered.length ? "Desmarcar todos" : "Selecionar todos"}
          </button>
        )}

        {filtered.map((order) => {
          const st = statusLabels[order.status] || statusLabels.pending;
          const ps = paymentLabels[order.payment_status || ""] || null;
          const isOpen = expanded === order.id;
          const isSelected = selectedIds.has(order.id);

          return (
            <div key={order.id} className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition ${isSelected ? "border-primary/40 ring-1 ring-primary/20" : "border-gray-200"}`}>
              <div className="flex items-center px-5 py-4">
                <button onClick={(e) => { e.stopPropagation(); toggleSelect(order.id); }} className="mr-3 text-gray-400 hover:text-primary transition">
                  {isSelected ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} />}
                </button>
                <div className="flex-1 flex items-center justify-between cursor-pointer hover:opacity-80"
                  onClick={() => setExpanded(isOpen ? null : order.id)}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-gray-900">#{order.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                    {ps && <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${ps.color}`}>{ps.label}</span>}
                    <span className="text-sm text-gray-500">{order.customers?.full_name || "—"}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900">{fmt(order.total)}</span>
                    <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString("pt-BR")}</span>
                    {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                  </div>
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Cliente</p>
                      <p className="font-medium">{order.customers?.full_name}</p>
                      <p className="text-gray-400">{order.customers?.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Pagamento</p>
                      <p className="font-medium">{order.payment_method || "—"}</p>
                      {ps && <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${ps.color}`}>{ps.label}</span>}
                    </div>
                    <div>
                      <p className="text-gray-500">Frete</p>
                      <p className="font-medium">{fmt(order.shipping_cost || 0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-bold text-primary text-lg">{fmt(order.total)}</p>
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
                              <td className="px-3 py-2 text-right">{fmt(item.price)}</td>
                              <td className="px-3 py-2 text-right">{fmt(item.quantity * Number(item.price))}</td>
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
                        placeholder="Código de rastreio manual"
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

                    {/* Gerar etiqueta automaticamente via Melhor Envio */}
                    {order.payment_status === "approved" && !order.tracking_code && (
                      <button
                        onClick={() => generateLabel(order.id)}
                        disabled={generatingLabel === order.id}
                        className="flex items-center gap-2 bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-green-700 transition disabled:opacity-50"
                      >
                        <Tag size={15} />
                        {generatingLabel === order.id ? "Gerando..." : "Gerar Etiqueta"}
                      </button>
                    )}

                    {/* Resultado da geração */}
                    {labelResult[order.id] && (
                      <div className={`text-sm px-3 py-2 rounded-xl ${labelResult[order.id].error ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
                        {labelResult[order.id].error ? (
                          labelResult[order.id].error
                        ) : (
                          <div className="flex items-center gap-3">
                            <span>Rastreio: <strong>{labelResult[order.id].trackingCode}</strong></span>
                            {labelResult[order.id].labelUrl && (
                              <a href={labelResult[order.id].labelUrl!} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 underline font-medium">
                                <ExternalLink size={13} /> Imprimir etiqueta
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    )}
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
