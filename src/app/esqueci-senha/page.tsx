"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Mail, ArrowLeft } from "lucide-react";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    if (error) {
      setError("Erro ao enviar email. Verifique o endereço e tente novamente.");
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50">
        <div className="w-full max-w-md text-center">
          <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email enviado!</h1>
          <p className="text-gray-500 mb-6">
            Enviamos um link de recuperação para <strong>{email}</strong>. Verifique sua caixa de entrada e spam.
          </p>
          <Link href="/login" className="text-primary font-medium hover:underline">
            Voltar para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Recuperar senha</h1>
          <p className="text-gray-500 mt-2">Informe seu e-mail para receber o link de recuperação</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition"
              placeholder="seu@email.com" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition disabled:opacity-50">
            {loading ? "Enviando..." : "Enviar link de recuperação"}
          </button>
          <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-primary transition">
            <ArrowLeft size={16} /> Voltar para o login
          </Link>
        </form>
      </div>
    </div>
  );
}
