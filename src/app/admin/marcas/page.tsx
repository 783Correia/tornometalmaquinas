"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";

type Brand = { id: number; name: string; slug: string };

function slugify(t: string) {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminMarcas() {
  const [items, setItems] = useState<Brand[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", slug: "" });
  const [adding, setAdding] = useState(false);

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from("brands").select("*").order("name");
    setItems(data || []);
  }

  async function handleSave() {
    if (!form.name) return;
    const slug = form.slug || slugify(form.name);
    if (editing) {
      await supabase.from("brands").update({ name: form.name, slug }).eq("id", editing);
    } else {
      await supabase.from("brands").insert({ name: form.name, slug });
    }
    setEditing(null); setAdding(false); setForm({ name: "", slug: "" });
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Excluir esta marca?")) return;
    await supabase.from("brands").delete().eq("id", id);
    load();
  }

  function startEdit(item: Brand) {
    setEditing(item.id); setForm({ name: item.name, slug: item.slug }); setAdding(false);
  }

  function cancel() { setEditing(null); setAdding(false); setForm({ name: "", slug: "" }); }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Marcas ({items.length})</h1>
        <button onClick={() => { setAdding(true); setEditing(null); setForm({ name: "", slug: "" }); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition">
          <Plus size={18} /> Nova Marca
        </button>
      </div>

      {(adding || editing) && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ name: e.target.value, slug: slugify(e.target.value) })}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition" />
          </div>
          <button onClick={handleSave} className="flex items-center gap-1 bg-primary text-white px-4 py-2.5 rounded-xl text-sm hover:bg-primary-dark transition">
            <Save size={16} /> Salvar
          </button>
          <button onClick={cancel} className="flex items-center gap-1 border-2 border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm hover:border-gray-300 transition">
            <X size={16} /> Cancelar
          </button>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr><th className="px-4 py-3 text-left">Nome</th><th className="px-4 py-3 text-left">Slug</th><th className="px-4 py-3 text-right">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                <td className="px-4 py-3 text-gray-500">{item.slug}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => startEdit(item)} className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
