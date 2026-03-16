"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search } from "lucide-react";

type Customer = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  cpf: string;
  created_at: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
};

export default function AdminClientes() {
  const [items, setItems] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    setItems(data || []);
  }

  const filtered = items.filter((c) =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.cpf?.includes(search)
  );

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

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Nome</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Telefone</th>
              <th className="px-4 py-3 text-left">CPF</th>
              <th className="px-4 py-3 text-left">Cidade/UF</th>
              <th className="px-4 py-3 text-left">Cadastro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.full_name}</td>
                <td className="px-4 py-3 text-gray-500">{c.email}</td>
                <td className="px-4 py-3 text-gray-500">{c.phone || "—"}</td>
                <td className="px-4 py-3 text-gray-500">{c.cpf || "—"}</td>
                <td className="px-4 py-3 text-gray-500">
                  {c.address_city && c.address_state ? `${c.address_city}/${c.address_state}` : "—"}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(c.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Nenhum cliente encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
