import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Frete | TornoMetal Everton Lopes",
  description: "Informações sobre prazos, custos e condições de entrega da TornoMetal Everton Lopes.",
};

export default function FretePage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Frete</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 prose max-w-none text-gray-600">
          <p className="text-sm text-gray-400 mb-6">Última atualização: Abril de 2026</p>

          <h2>1. Área de Entrega</h2>
          <p>Realizamos entregas para todo o território nacional brasileiro. Os produtos são enviados a partir de <strong>Passo Fundo, RS</strong>.</p>

          <h2>2. Cálculo do Frete</h2>
          <p>O valor do frete é calculado automaticamente no carrinho com base no CEP de destino, peso e dimensões dos produtos. O cálculo é realizado em tempo real através das transportadoras disponíveis.</p>

          <h2>3. Transportadoras e Modalidades</h2>
          <ul>
            <li><strong>Correios (PAC):</strong> entrega econômica, prazo maior</li>
            <li><strong>Correios (SEDEX):</strong> entrega expressa</li>
            <li><strong>Transportadoras parceiras:</strong> disponíveis conforme região e peso</li>
          </ul>

          <h2>4. Prazos de Entrega</h2>
          <p>Os prazos são contados em dias úteis a partir da <strong>confirmação do pagamento</strong>:</p>
          <ul>
            <li><strong>Sul e Sudeste:</strong> 3 a 7 dias úteis</li>
            <li><strong>Centro-Oeste e Nordeste:</strong> 5 a 10 dias úteis</li>
            <li><strong>Norte:</strong> 7 a 15 dias úteis</li>
          </ul>
          <p>Os prazos são estimativas e podem variar conforme a transportadora e a localidade.</p>

          <h2>5. Processamento do Pedido</h2>
          <p>Pedidos com pagamento confirmado até as <strong>14h</strong> em dias úteis são despachados no mesmo dia. Pedidos confirmados após esse horário ou em fins de semana e feriados são despachados no próximo dia útil.</p>

          <h2>6. Rastreamento</h2>
          <p>Após o despacho, o código de rastreamento é enviado por e-mail. O rastreamento pode ser consultado diretamente no site dos Correios ou da transportadora responsável.</p>

          <h2>7. Frete Grátis</h2>
          <p>Eventualmente oferecemos frete grátis em promoções específicas. As condições são informadas na página do produto ou no carrinho.</p>

          <h2>8. Avaria ou Extravio</h2>
          <p>Em caso de produto avariado no transporte ou extravio, entre em contato em até <strong>3 dias úteis</strong> após o recebimento (ou a data prevista de entrega) pelo telefone <strong>(54) 3315-3969</strong>. Providenciaremos a solução sem custo adicional.</p>

          <h2>9. Endereço de Despacho</h2>
          <p>
            TornoMetal Everton Lopes<br />
            R. Goiás, 304, Vila Santa Maria<br />
            Passo Fundo, RS — CEP 99070-250<br />
            Tel: (54) 3315-3969
          </p>

          <h2>10. Contato</h2>
          <p>Dúvidas sobre frete ou entrega: <strong>(54) 3315-3969</strong> — Segunda a Sexta, 8h às 18h.</p>
        </div>
      </div>
    </div>
  );
}
