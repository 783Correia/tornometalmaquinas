"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { UserPlus, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function CadastroPage() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", cpf: "", cnpj: "", inscricao_estadual: "", password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  function update(field: string, value: string) { setForm((prev) => ({ ...prev, [field]: value })); }

  function formatCPF(value: string) {
    const d = value.replace(/\D/g, "").slice(0, 11);
    return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  function formatCNPJ(value: string) {
    const d = value.replace(/\D/g, "").slice(0, 14);
    return d.replace(/(\d{2})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1/$2").replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  }

  function formatPhone(value: string) {
    const d = value.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 10) return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
    return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) { setError("As senhas não conferem."); return; }
    if (form.password.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return; }
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          phone: form.phone,
          cpf: form.cpf,
          cnpj: form.cnpj,
          inscricao_estadual: form.inscricao_estadual,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar conta. Tente novamente.");
        setLoading(false);
        return;
      }

      // Auto-login after registration
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (loginError) {
        // Account created but auto-login failed - redirect to login
        setSuccess(true);
        setLoading(false);
        setTimeout(() => router.push("/login"), 3000);
        return;
      }

      setSuccess(true);
      setLoading(false);
      setTimeout(() => router.push("/minha-conta"), 2000);
    } catch {
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Conta criada com sucesso!</h1>
          <p className="text-gray-500 mb-6">Bem-vindo à TornoMetal. Você será redirecionado em instantes...</p>
          <Link href="/minha-conta" className="text-primary font-medium hover:underline">
            Ir para Minha Conta
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Criar sua conta</h1>
          <p className="text-gray-500 mt-2">Cadastre-se para realizar suas compras</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome completo *</label>
            <input type="text" value={form.full_name} onChange={(e) => update("full_name", e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition" placeholder="Seu nome completo" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail *</label>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition" placeholder="seu@email.com" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone</label>
              <input type="text" value={form.phone} onChange={(e) => update("phone", formatPhone(e.target.value))}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition" placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">CPF</label>
              <input type="text" value={form.cpf} onChange={(e) => update("cpf", formatCPF(e.target.value))}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition" placeholder="000.000.000-00" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">CNPJ</label>
              <input type="text" value={form.cnpj} onChange={(e) => update("cnpj", formatCNPJ(e.target.value))}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition" placeholder="00.000.000/0000-00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Inscrição Estadual</label>
              <input type="text" value={form.inscricao_estadual} onChange={(e) => update("inscricao_estadual", e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition" placeholder="Inscrição estadual" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha *</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition pr-10" placeholder="Mínimo 6 caracteres" required />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar senha *</label>
            <input type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition" placeholder="Repita a senha" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition disabled:opacity-50">
            {loading ? "Criando conta..." : "Criar Conta"}
          </button>
          <p className="text-center text-sm text-gray-500">
            Já tem conta? <Link href="/login" className="text-primary font-medium hover:underline">Fazer login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
