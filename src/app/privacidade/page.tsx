import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | TornoMetal",
  description: "Política de privacidade e proteção de dados do site TornoMetal Everton Lopes.",
};

export default function PrivacidadePage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Privacidade</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 prose max-w-none text-gray-600">
          <p className="text-sm text-gray-400 mb-6">Última atualização: Março de 2026</p>

          <p>A TornoMetal Everton Lopes está comprometida com a proteção de seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).</p>

          <h2>1. Dados que Coletamos</h2>
          <p>Coletamos os seguintes dados pessoais:</p>
          <ul>
            <li><strong>Dados de cadastro:</strong> nome completo, e-mail, telefone, CPF/CNPJ, inscrição estadual</li>
            <li><strong>Dados de entrega:</strong> endereço completo (rua, número, complemento, bairro, cidade, estado, CEP)</li>
            <li><strong>Dados de navegação:</strong> cookies essenciais para funcionamento do site</li>
          </ul>

          <h2>2. Finalidade do Uso dos Dados</h2>
          <p>Seus dados são utilizados para:</p>
          <ul>
            <li>Processar e entregar seus pedidos</li>
            <li>Emitir notas fiscais</li>
            <li>Calcular frete e prazo de entrega</li>
            <li>Comunicar sobre o status de seus pedidos</li>
            <li>Atendimento ao cliente</li>
            <li>Cumprimento de obrigações legais e fiscais</li>
          </ul>

          <h2>3. Compartilhamento de Dados</h2>
          <p>Seus dados podem ser compartilhados com:</p>
          <ul>
            <li><strong>Transportadoras:</strong> para entrega dos pedidos (nome, endereço, telefone)</li>
            <li><strong>Mercado Pago:</strong> para processamento de pagamentos (dados necessários para a transação)</li>
            <li><strong>Bling ERP:</strong> para emissão de notas fiscais</li>
          </ul>
          <p>Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins de marketing.</p>

          <h2>4. Armazenamento e Segurança</h2>
          <p>Seus dados são armazenados em servidores seguros com criptografia. Utilizamos o Supabase como plataforma de banco de dados, que segue padrões internacionais de segurança (SOC2, ISO 27001).</p>

          <h2>5. Seus Direitos (LGPD)</h2>
          <p>Conforme a LGPD, você tem direito a:</p>
          <ul>
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir dados incompletos ou desatualizados</li>
            <li>Solicitar a exclusão de seus dados</li>
            <li>Revogar o consentimento a qualquer momento</li>
            <li>Solicitar a portabilidade dos dados</li>
          </ul>
          <p>Para exercer seus direitos, entre em contato pelo telefone (54) 3315-3969 ou pela página de contato.</p>

          <h2>6. Cookies</h2>
          <p>Utilizamos cookies essenciais para:</p>
          <ul>
            <li>Manter sua sessão de login</li>
            <li>Salvar itens do carrinho de compras</li>
          </ul>
          <p>Não utilizamos cookies de rastreamento ou publicidade.</p>

          <h2>7. Retenção de Dados</h2>
          <p>Seus dados são mantidos enquanto sua conta estiver ativa ou pelo período necessário para cumprir obrigações legais e fiscais (mínimo de 5 anos para documentos fiscais).</p>

          <h2>8. Alterações</h2>
          <p>Esta política pode ser atualizada periodicamente. Recomendamos que a consulte regularmente.</p>

          <h2>9. Contato</h2>
          <p>Para questões sobre privacidade e proteção de dados, entre em contato pelo telefone (54) 3315-3969.</p>
        </div>
      </div>
    </div>
  );
}
