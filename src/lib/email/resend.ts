import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || "");
  return _resend;
}

const FROM_EMAIL = "TornoMetal <noreply@tornometalevertonlopes.com.br>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "tornometal.maquina@hotmail.com";

type OrderItem = {
  product_name: string;
  quantity: number;
  price: number;
};

type OrderEmailData = {
  orderId: number;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  shippingCost: number;
  shippingMethod?: string;
  address?: string;
  trackingCode?: string;
};

function formatCurrency(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

function escapeHtml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function itemsTable(items: OrderItem[]) {
  return items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee">${item.product_name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${formatCurrency(item.price * item.quantity)}</td>
        </tr>`
    )
    .join("");
}

function emailLayout(content: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff">
      <div style="background:#0d1b3e;padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">TORNOMETAL</h1>
        <p style="color:#7b9cc7;margin:4px 0 0;font-size:12px">Everton Lopes</p>
      </div>
      <div style="padding:24px">
        ${content}
      </div>
      <div style="background:#f5f5f5;padding:16px 24px;text-align:center;font-size:12px;color:#999">
        <p>TornoMetal Everton Lopes | Passo Fundo/RS</p>
        <p>Tel: (54) 3315-3969</p>
        <p><a href="https://tornometalevertonlopes.com.br" style="color:#0264A5">tornometalevertonlopes.com.br</a></p>
      </div>
    </div>
  `;
}

// Email 1: Order confirmation for customer
export async function sendOrderConfirmation(data: OrderEmailData) {
  const subtotal = data.total - data.shippingCost;

  const html = emailLayout(`
    <h2 style="color:#333;margin-top:0">Pedido confirmado!</h2>
    <p style="color:#666">Olá <strong>${data.customerName}</strong>, recebemos seu pedido e estamos aguardando a confirmação do pagamento.</p>

    <div style="background:#f8f9fa;border-radius:8px;padding:16px;margin:16px 0">
      <p style="margin:0;font-weight:bold;color:#333">Pedido #${data.orderId}</p>
    </div>

    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <thead>
        <tr style="background:#f8f9fa">
          <th style="padding:8px 12px;text-align:left;font-size:13px;color:#666">Produto</th>
          <th style="padding:8px 12px;text-align:center;font-size:13px;color:#666">Qtd</th>
          <th style="padding:8px 12px;text-align:right;font-size:13px;color:#666">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsTable(data.items)}
      </tbody>
    </table>

    <div style="border-top:2px solid #eee;padding-top:12px;margin-top:12px">
      <p style="margin:4px 0;color:#666">Subtotal: <strong>${formatCurrency(subtotal)}</strong></p>
      <p style="margin:4px 0;color:#666">Frete: <strong>${formatCurrency(data.shippingCost)}</strong></p>
      <p style="margin:8px 0;font-size:18px;color:#0264A5"><strong>Total: ${formatCurrency(data.total)}</strong></p>
    </div>

    ${data.address ? `<div style="background:#f8f9fa;border-radius:8px;padding:16px;margin:16px 0">
      <p style="margin:0 0 4px;font-weight:bold;color:#333;font-size:13px">Endereço de entrega</p>
      <p style="margin:0;color:#666;font-size:13px">${data.address}</p>
    </div>` : ""}

    <p style="color:#666;font-size:13px">Você receberá um email quando o pagamento for confirmado e outro quando o pedido for enviado.</p>

    <p style="color:#666;font-size:13px">Acompanhe seu pedido em <a href="https://tornometalevertonlopes.com.br/minha-conta" style="color:#0264A5">Minha Conta</a>.</p>
  `);

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Pedido #${data.orderId} confirmado - TornoMetal`,
      html,
    });
  } catch (err) {
    console.error("Error sending order confirmation:", err);
  }
}

// Email 2: Payment approved notification
export async function sendPaymentApproved(data: OrderEmailData) {
  const html = emailLayout(`
    <h2 style="color:#333;margin-top:0">Pagamento aprovado!</h2>
    <p style="color:#666">Olá <strong>${data.customerName}</strong>, o pagamento do seu pedido <strong>#${data.orderId}</strong> foi aprovado!</p>

    <div style="background:#e8f5e9;border-radius:8px;padding:16px;margin:16px 0;text-align:center">
      <p style="margin:0;color:#2e7d32;font-size:16px;font-weight:bold">Pagamento confirmado</p>
      <p style="margin:4px 0 0;color:#4caf50">${formatCurrency(data.total)}</p>
    </div>

    <p style="color:#666">Seu pedido está sendo preparado para envio. Você receberá o código de rastreio assim que for despachado.</p>

    <p style="color:#666;font-size:13px">Acompanhe em <a href="https://tornometalevertonlopes.com.br/minha-conta" style="color:#0264A5">Minha Conta</a>.</p>
  `);

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Pagamento aprovado - Pedido #${data.orderId} - TornoMetal`,
      html,
    });
  } catch (err) {
    console.error("Error sending payment approved:", err);
  }
}

// Email 3: Shipping notification with tracking
export async function sendShippingNotification(data: OrderEmailData) {
  const html = emailLayout(`
    <h2 style="color:#333;margin-top:0">Pedido enviado!</h2>
    <p style="color:#666">Olá <strong>${data.customerName}</strong>, seu pedido <strong>#${data.orderId}</strong> foi enviado!</p>

    ${data.trackingCode ? `
    <div style="background:#e3f2fd;border-radius:8px;padding:16px;margin:16px 0;text-align:center">
      <p style="margin:0;color:#1565c0;font-size:13px">Código de rastreio</p>
      <p style="margin:4px 0 0;color:#0d47a1;font-size:20px;font-weight:bold;letter-spacing:2px">${data.trackingCode}</p>
    </div>
    ` : ""}

    ${data.shippingMethod ? `<p style="color:#666">Transportadora: <strong>${data.shippingMethod}</strong></p>` : ""}

    <p style="color:#666">Acompanhe a entrega pelo site da transportadora ou em <a href="https://tornometalevertonlopes.com.br/minha-conta" style="color:#0264A5">Minha Conta</a>.</p>
  `);

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Pedido #${data.orderId} enviado - TornoMetal`,
      html,
    });
  } catch (err) {
    console.error("Error sending shipping notification:", err);
  }
}

// Email 4: Contact form message
export async function sendContactMessage(data: { name: string; email: string; message: string }) {
  const html = emailLayout(`
    <h2 style="color:#333;margin-top:0">Nova mensagem de contato</h2>

    <div style="background:#f8f9fa;border-radius:8px;padding:16px;margin:16px 0">
      <p style="margin:0 0 4px;color:#666;font-size:13px"><strong>Nome:</strong> ${escapeHtml(data.name)}</p>
      <p style="margin:0 0 4px;color:#666;font-size:13px"><strong>E-mail:</strong> ${escapeHtml(data.email)}</p>
    </div>

    <div style="background:#f8f9fa;border-radius:8px;padding:16px;margin:16px 0">
      <p style="margin:0 0 4px;font-weight:bold;color:#333;font-size:13px">Mensagem:</p>
      <p style="margin:0;color:#666;font-size:13px;white-space:pre-wrap">${escapeHtml(data.message)}</p>
    </div>

    <p style="color:#666;font-size:13px">Responda diretamente para: <a href="mailto:${data.email}" style="color:#0264A5">${data.email}</a></p>
  `);

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      replyTo: data.email,
      subject: `Contato via site - ${data.name}`,
      html,
    });
  } catch (err) {
    console.error("Error sending contact message:", err);
    throw err;
  }
}

// Email 5: New order notification for admin
export async function sendAdminNewOrder(data: OrderEmailData) {
  const html = emailLayout(`
    <h2 style="color:#333;margin-top:0">Novo pedido recebido!</h2>

    <div style="background:#fff3e0;border-radius:8px;padding:16px;margin:16px 0">
      <p style="margin:0"><strong>Pedido #${data.orderId}</strong></p>
      <p style="margin:4px 0 0;color:#666">Cliente: ${data.customerName} (${data.customerEmail})</p>
      <p style="margin:4px 0 0;color:#e65100;font-size:18px;font-weight:bold">${formatCurrency(data.total)}</p>
    </div>

    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <thead>
        <tr style="background:#f8f9fa">
          <th style="padding:8px 12px;text-align:left;font-size:13px;color:#666">Produto</th>
          <th style="padding:8px 12px;text-align:center;font-size:13px;color:#666">Qtd</th>
          <th style="padding:8px 12px;text-align:right;font-size:13px;color:#666">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsTable(data.items)}
      </tbody>
    </table>

    <p style="color:#666">Frete: ${formatCurrency(data.shippingCost)}</p>

    <a href="https://tornometalevertonlopes.com.br/admin/pedidos"
       style="display:inline-block;background:#0264A5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">
      Ver no painel admin
    </a>
  `);

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Novo pedido #${data.orderId} - ${formatCurrency(data.total)}`,
      html,
    });
  } catch (err) {
    console.error("Error sending admin notification:", err);
  }
}
