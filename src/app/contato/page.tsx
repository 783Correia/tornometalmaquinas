import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

export default function ContatoPage() {
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
              { icon: Phone, title: "Telefone / WhatsApp", desc: "Consulte nosso site" },
              { icon: Mail, title: "E-mail", desc: "Consulte nosso site" },
              { icon: MapPin, title: "Localização", desc: "Consulte nosso site" },
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
            <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-3 rounded-xl hover:bg-green-600 transition w-full">
              <MessageCircle size={20} /> Chamar no WhatsApp
            </a>
          </div>

          <form className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome</label>
              <input type="text" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition" placeholder="Seu nome" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
              <input type="email" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition" placeholder="seu@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mensagem</label>
              <textarea rows={5} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition resize-none" placeholder="Sua mensagem..." />
            </div>
            <button type="submit" className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition">
              Enviar Mensagem
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
