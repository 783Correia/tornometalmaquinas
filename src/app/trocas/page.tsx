import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Trocas e Devoluções | TornoMetal",
  description: "Política de trocas e devoluções da TornoMetal Everton Lopes.",
};

export default function TrocasPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Trocas e Devoluções</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 prose max-w-none text-gray-600">
          <p className="text-sm text-gray-400 mb-6">Última atualização: Março de 2026</p>

          <p>A TornoMetal Everton Lopes segue o Código de Defesa do Consumidor (Lei nº 8.078/1990) para todas as trocas e devoluções.</p>

          <h2>1. Direito de Arrependimento</h2>
          <p>Conforme o Art. 49 do CDC, você pode desistir da compra em até <strong>7 dias corridos</strong> após o recebimento do produto, sem necessidade de justificativa. O produto deve estar em sua embalagem original, sem sinais de uso.</p>

          <h2>2. Produtos com Defeito</h2>
          <p>Se o produto apresentar defeito de fabricação:</p>
          <ul>
            <li><strong>Prazo para reclamação:</strong> até 30 dias após o recebimento para produtos não duráveis; até 90 dias para produtos duráveis (peças metálicas)</li>
            <li>A TornoMetal poderá reparar, substituir ou reembolsar o valor pago, conforme o caso</li>
            <li>O prazo para resolução é de até 30 dias úteis</li>
          </ul>

          <h2>3. Como Solicitar Troca ou Devolução</h2>
          <ol>
            <li>Entre em contato pelo telefone <strong>(54) 3315-3969</strong> ou WhatsApp informando o número do pedido</li>
            <li>Descreva o motivo da troca/devolução</li>
            <li>Envie fotos do produto (em caso de defeito)</li>
            <li>Aguarde a aprovação e as instruções de envio</li>
          </ol>

          <h2>4. Envio do Produto para Troca/Devolução</h2>
          <ul>
            <li>Em caso de <strong>defeito de fabricação</strong> ou <strong>erro no envio</strong>, o frete de devolução é por conta da TornoMetal</li>
            <li>Em caso de <strong>arrependimento</strong>, o frete de devolução é por conta do cliente</li>
            <li>O produto deve ser enviado na embalagem original com todos os acessórios</li>
          </ul>

          <h2>5. Reembolso</h2>
          <ul>
            <li>O reembolso será processado em até <strong>10 dias úteis</strong> após o recebimento e análise do produto devolvido</li>
            <li>O valor será estornado pela mesma forma de pagamento utilizada na compra</li>
            <li>Para pagamentos em boleto ou Pix, o reembolso será feito via transferência bancária</li>
          </ul>

          <h2>6. Produtos Não Elegíveis para Troca</h2>
          <ul>
            <li>Produtos com sinais de uso, desgaste ou mau uso</li>
            <li>Produtos sem embalagem original</li>
            <li>Peças que sofreram modificação ou instalação inadequada</li>
          </ul>

          <h2>7. Produto Incorreto</h2>
          <p>Se você recebeu um produto diferente do pedido, entre em contato imediatamente. A TornoMetal fará a troca sem custos adicionais.</p>

          <h2>8. Contato</h2>
          <p>Telefone: (54) 3315-3969<br />WhatsApp: (54) 3315-3969<br />Horário: Segunda a Sexta, 8h às 18h</p>
        </div>

        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-gray-700 font-medium mb-4">Precisa solicitar uma troca ou devolução?</p>
          <a
            href="https://wa.me/555433153969?text=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20uma%20troca%2Fdevolu%C3%A7%C3%A3o.%20Meu%20n%C3%BAmero%20de%20pedido%20%C3%A9%3A%20"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-600 transition"
          >
            Solicitar pelo WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
