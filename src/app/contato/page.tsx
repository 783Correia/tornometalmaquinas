"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle } from "lucide-react";

export default function ContatoPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "contact", data: form }),
      });

      if (!res.ok) throw new Error("Erro ao enviar");
      setSent(true);
      setForm({ name: "", email: "", message: "" });
    } catch {
      setError("Erro ao enviar mensagem. Tente novamente ou entre em contato pelo WhatsApp.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Fale Conosco</h1>
          <p className="text-gray-500">Entre em contato para tirar dúvidas ou fazer orçamentos</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {[
              { icon: Phone, title: "Telefone / WhatsApp", desc: "(54) 3315-3969" },
              { icon: Mail, title: "E-mail", desc: "contato@tornometalevertonlopes.com.br" },
              { icon: MapPin, title: "Localização", desc: "Passo Fundo/RS" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <item.icon className="text-primary" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
            <a href="https://wa.me/555433153969?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-3 rounded-xl hover:bg-green-600 transition w-full">
              <MessageCircle size={20} /> Chamar no WhatsApp
            </a>
          </div>

          {sent ? (
            <div className="bg-white border border-green-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
              <CheckCircle className="text-green-500 mb-4" size={48} />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Mensagem enviada!</h3>
              <p className="text-gray-500 text-sm mb-4">Responderemos em breve pelo e-mail informado.</p>
              <button onClick={() => setSent(false)} className="text-primary text-sm font-medium hover:underline">
                Enviar outra mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition" placeholder="Seu nome" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition" placeholder="seu@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mensagem</label>
                <textarea rows={5} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition resize-none" placeholder="Sua mensagem..." />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button type="submit" disabled={sending}
                className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2">
                <Send size={16} />
                {sending ? "Enviando..." : "Enviar Mensagem"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
