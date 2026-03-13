import { Phone, Mail, MapPin } from "lucide-react";

export default function ContatoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Fale Conosco</h1>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-semibold mb-6">
            Entre em contato
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Phone className="text-amber-500 mt-1" size={20} />
              <div>
                <p className="font-medium">Telefone / WhatsApp</p>
                <p className="text-gray-500">Consulte nosso site</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="text-amber-500 mt-1" size={20} />
              <div>
                <p className="font-medium">E-mail</p>
                <p className="text-gray-500">Consulte nosso site</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="text-amber-500 mt-1" size={20} />
              <div>
                <p className="font-medium">Localização</p>
                <p className="text-gray-500">Consulte nosso site</p>
              </div>
            </div>
          </div>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:border-amber-500"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <input
              type="email"
              className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:border-amber-500"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Mensagem
            </label>
            <textarea
              rows={5}
              className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:border-amber-500 resize-none"
              placeholder="Sua mensagem..."
            />
          </div>
          <button
            type="submit"
            className="w-full bg-amber-500 text-white font-semibold py-3 rounded-lg hover:bg-amber-600 transition"
          >
            Enviar Mensagem
          </button>
        </form>
      </div>
    </div>
  );
}
