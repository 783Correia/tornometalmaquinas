import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

export default function ContatoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-2">Fale Conosco</h1>
        <p className="text-gray-500">
          Entre em contato para tirar dúvidas ou fazer orçamentos
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {[
            {
              icon: Phone,
              title: "Telefone / WhatsApp",
              desc: "Consulte nosso site",
            },
            {
              icon: Mail,
              title: "E-mail",
              desc: "Consulte nosso site",
            },
            {
              icon: MapPin,
              title: "Localização",
              desc: "Consulte nosso site",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 bg-dark-800 border border-dark-600 rounded-xl p-4"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <item.icon className="text-primary" size={20} />
              </div>
              <div>
                <p className="font-medium text-white text-sm">{item.title}</p>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}

          <a
            href="https://wa.me/5500000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-3 rounded-xl hover:bg-green-600 transition w-full"
          >
            <MessageCircle size={20} /> Chamar no WhatsApp
          </a>
        </div>

        <form className="bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Nome
            </label>
            <input
              type="text"
              className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary transition"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary transition"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Mensagem
            </label>
            <textarea
              rows={5}
              className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary transition resize-none"
              placeholder="Sua mensagem..."
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-black font-semibold py-3 rounded-xl hover:bg-primary-light transition"
          >
            Enviar Mensagem
          </button>
        </form>
      </div>
    </div>
  );
}
