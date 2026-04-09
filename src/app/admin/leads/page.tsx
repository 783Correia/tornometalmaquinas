"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Filter, Check, Phone, Mail, MapPin, Building2, TrendingUp, Users, DollarSign } from "lucide-react";

type Lead = {
  id: number;
  nome: string;
  empresa: string;
  contato: string;
  email: string;
  estado: string;
  source: string;
  status: string;
  valor_compra: number | null;
  notas: string | null;
  created_at: string;
};

type EditingLead = {
  id: number;
  status: string;
  valor_compra: string;
  notas: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  novo:           { label: "Novo",           color: "bg-gray-100 text-gray-700",     dot: "bg-gray-400" },
  contatado:      { label: "Contatado",      color: "bg-blue-100 text-blue-700",     dot: "bg-blue-500" },
  comprou:        { label: "Comprou",        color: "bg-green-100 text-green-700",   dot: "bg-green-500" },
  nao_converteu:  { label: "Não converteu",  color: "bg-red-100 text-red-700",       dot: "bg-red-400" },
};

const FILTROS = ["todos", "novo", "contatado", "comprou", "nao_converteu"];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filtro, setFiltro] = useState("todos");
  const [editing, setEditing] = useState<EditingLead | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    setLeads((data as Lead[]) || []);
  }

  function startEdit(lead: Lead) {
    setEditing({
      id: lead.id,
      status: lead.status || "novo",
      valor_compra: lead.valor_compra != null ? String(lead.valor_compra) : "",
      notas: lead.notas || "",
    });
    setExpandedId(lead.id);
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    const valor = editing.valor_compra ? parseFloat(editing.valor_compra.replace(",", ".")) : null;
    await supabase.from("leads").update({
      status: editing.status,
      valor_compra: valor,
      notas: editing.notas || null,
    }).eq("id", editing.id);
    await load();
    setEditing(null);
    setSaving(false);
  }

  function cancelEdit() {
    setEditing(null);
  }

  const filtered = filtro === "todos" ? leads : leads.filter((l) => l.status === filtro);

  // Stats
  const total = leads.length;
  const novos = leads.filter((l) => !l.status || l.status === "novo").length;
  const compraram = leads.filter((l) => l.status === "comprou").length;
  const receitaGerada = leads.reduce((sum, l) => sum + (l.valor_compra || 0), 0);
  const conversao = total > 0 ? Math.round((compraram / total) * 100) : 0;

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <Filter size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads LP</h1>
          <p className="text-sm text-gray-500">Revendas que preencheram o formulário da landing page</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center mb-3">
            <Users size={20} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-sm text-gray-500">Total de leads</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="w-10 h-10 bg-gray-400 rounded-xl flex items-center justify-center mb-3">
            <Filter size={20} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{novos}</p>
          <p className="text-sm text-gray-500">Aguardando contato</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp size={20} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{compraram} <span className="text-sm font-normal text-gray-400">({conversao}%)</span></p>
          <p className="text-sm text-gray-500">Convertidos</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mb-3">
            <DollarSign size={20} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(receitaGerada)}</p>
          <p className="text-sm text-gray-500">Receita rastreada</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => {
          const cfg = f === "todos" ? null : STATUS_CONFIG[f];
          const count = f === "todos" ? total : leads.filter((l) => l.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                filtro === f
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cfg ? cfg.label : "Todos"} <span className="ml-1 opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">Nenhum lead encontrado.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((lead) => {
              const cfg = STATUS_CONFIG[lead.status || "novo"] || STATUS_CONFIG.novo;
              const isExpanded = expandedId === lead.id;
              const isEditing = editing?.id === lead.id;

              return (
                <div key={lead.id} className="hover:bg-gray-50 transition">
                  {/* Linha principal */}
                  <div
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                    onClick={() => {
                      if (isExpanded && !isEditing) {
                        setExpandedId(null);
                      } else {
                        setExpandedId(lead.id);
                        if (!isEditing) setEditing(null);
                      }
                    }}
                  >
                    {/* Status dot */}
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />

                    {/* Nome + empresa */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{lead.nome}</p>
                      <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                        <Building2 size={10} /> {lead.empresa}
                      </p>
                    </div>

                    {/* Contato */}
                    <div className="hidden sm:block text-xs text-gray-500 shrink-0">
                      <a
                        href={`https://wa.me/55${lead.contato.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 hover:text-green-600 transition"
                      >
                        <Phone size={11} /> {lead.contato}
                      </a>
                    </div>

                    {/* Estado */}
                    <span className="hidden md:block text-xs text-gray-400 shrink-0 w-8 text-center font-mono">
                      {lead.estado}
                    </span>

                    {/* Valor */}
                    <span className="hidden lg:block text-sm font-semibold text-gray-700 shrink-0 w-28 text-right">
                      {lead.valor_compra ? fmt(lead.valor_compra) : <span className="text-gray-300 font-normal">—</span>}
                    </span>

                    {/* Status badge */}
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${cfg.color}`}>
                      {cfg.label}
                    </span>

                    {/* Data */}
                    <span className="hidden lg:block text-[11px] text-gray-400 shrink-0">
                      {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                    </span>

                    {/* Editar */}
                    <button
                      onClick={(e) => { e.stopPropagation(); startEdit(lead); }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium shrink-0 transition"
                    >
                      Editar
                    </button>
                  </div>

                  {/* Expansão */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-gray-100 bg-gray-50/50">
                      {isEditing ? (
                        /* Formulário de edição */
                        <div className="pt-4 grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                              Status
                            </label>
                            <select
                              value={editing.status}
                              onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                <option key={key} value={key}>{cfg.label}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                              Valor da Compra (R$)
                            </label>
                            <input
                              type="text"
                              value={editing.valor_compra}
                              onChange={(e) => setEditing({ ...editing, valor_compra: e.target.value })}
                              placeholder="0,00"
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                              Notas internas
                            </label>
                            <textarea
                              value={editing.notas}
                              onChange={(e) => setEditing({ ...editing, notas: e.target.value })}
                              placeholder="Ex: pediu condutor Semeato, aguardando resposta..."
                              rows={3}
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                            />
                          </div>

                          <div className="sm:col-span-2 flex gap-2 justify-end">
                            <button
                              onClick={cancelEdit}
                              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={saveEdit}
                              disabled={saving}
                              className="px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-60"
                            >
                              <Check size={15} />
                              {saving ? "Salvando…" : "Salvar"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Detalhes do lead */
                        <div className="pt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Email</p>
                            <a href={`mailto:${lead.email}`} className="text-indigo-600 hover:underline flex items-center gap-1">
                              <Mail size={13} /> {lead.email}
                            </a>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">WhatsApp</p>
                            <a
                              href={`https://wa.me/55${lead.contato.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:underline flex items-center gap-1"
                            >
                              <Phone size={13} /> {lead.contato}
                            </a>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Estado</p>
                            <p className="flex items-center gap-1 text-gray-700"><MapPin size={13} /> {lead.estado}</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Data do lead</p>
                            <p className="text-gray-700">{new Date(lead.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
                          </div>
                          {lead.valor_compra && (
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Valor da compra</p>
                              <p className="text-gray-900 font-semibold">{fmt(lead.valor_compra)}</p>
                            </div>
                          )}
                          {lead.notas && (
                            <div className="sm:col-span-2 lg:col-span-3">
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Notas</p>
                              <p className="text-gray-700 whitespace-pre-line">{lead.notas}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SQL hint */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Atenção:</strong> Para que os campos de status, valor e notas funcionem, rode este SQL no Supabase:
        <pre className="mt-2 text-xs bg-amber-100 rounded-lg p-3 overflow-x-auto font-mono">
{`ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'lp_revenda',
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'novo',
  ADD COLUMN IF NOT EXISTS valor_compra numeric(10,2),
  ADD COLUMN IF NOT EXISTS notas text;`}
        </pre>
      </div>
    </div>
  );
}
