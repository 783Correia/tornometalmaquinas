import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | TornoMetal",
  description: "Termos e condições de uso do site TornoMetal Everton Lopes.",
};

export default function TermosPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Termos de Uso</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 prose max-w-none text-gray-600">
          <p className="text-sm text-gray-400 mb-6">Última atualização: Março de 2026</p>

          <h2>1. Aceitação dos Termos</h2>
          <p>Ao acessar e utilizar o site TornoMetal Everton Lopes, você concorda com estes Termos de Uso. Se não concordar, por favor, não utilize nosso site.</p>

          <h2>2. Sobre a Empresa</h2>
          <p>A TornoMetal Everton Lopes é uma fábrica de peças para plantadeiras e máquinas agrícolas, localizada em Passo Fundo/RS. Comercializamos peças para diversas marcas como Semeato, Jumil, John Deere, Massey Ferguson, Case e outras.</p>

          <h2>3. Produtos e Preços</h2>
          <p>Os preços exibidos no site são em Reais (R$) e podem ser alterados sem aviso prévio. Nos reservamos o direito de corrigir erros de preços ou informações a qualquer momento. A disponibilidade dos produtos está sujeita ao estoque.</p>

          <h2>4. Cadastro e Conta</h2>
          <p>Para realizar compras, é necessário criar uma conta com informações verdadeiras e atualizadas. O usuário é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas em sua conta.</p>

          <h2>5. Processo de Compra</h2>
          <p>A confirmação do pedido está sujeita à aprovação do pagamento e disponibilidade de estoque. A TornoMetal reserva-se o direito de cancelar pedidos em caso de erro de preço, fraude ou indisponibilidade de produto.</p>

          <h2>6. Pagamento</h2>
          <p>Os pagamentos são processados através do Mercado Pago, que garante a segurança das transações. Aceitamos cartão de crédito, débito, boleto bancário e Pix.</p>

          <h2>7. Frete e Entrega</h2>
          <p>O prazo de entrega é contado a partir da confirmação do pagamento. Os prazos são estimativas e podem variar conforme a região e a transportadora. O cálculo do frete é feito automaticamente com base no CEP de entrega.</p>

          <h2>8. Propriedade Intelectual</h2>
          <p>Todo o conteúdo do site (textos, imagens, logos, marcas) é de propriedade da TornoMetal Everton Lopes e protegido por leis de propriedade intelectual. É proibida a reprodução sem autorização.</p>

          <h2>9. Limitação de Responsabilidade</h2>
          <p>A TornoMetal não se responsabiliza por danos indiretos decorrentes do uso do site, interrupções de serviço ou erros técnicos temporários.</p>

          <h2>10. Contato</h2>
          <p>Em caso de dúvidas sobre estes termos, entre em contato pelo telefone (54) 3315-3969 ou pela página de contato do site.</p>
        </div>
      </div>
    </div>
  );
}
