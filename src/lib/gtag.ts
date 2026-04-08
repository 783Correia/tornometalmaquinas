declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

type GtagItem = {
  item_id: string
  item_name: string
  price: number
  quantity: number
  item_category?: string
  item_brand?: string
}

export type PurchaseData = {
  transaction_id: string
  value: number
  shipping: number
  items: GtagItem[]
}

function gtag(...args: unknown[]) {
  if (typeof window === "undefined" || !window.gtag) return
  window.gtag(...args)
}

export function trackViewItem(p: {
  id: number | string
  name: string
  price: number
  sku?: string
  category?: string
  brand?: string
}) {
  gtag("event", "view_item", {
    currency: "BRL",
    value: p.price,
    items: [{
      item_id: p.sku || String(p.id),
      item_name: p.name,
      price: p.price,
      quantity: 1,
      item_category: p.category,
      item_brand: p.brand,
    }],
  })
}

export function trackAddToCart(p: {
  id: number | string
  name: string
  price: number
  quantity: number
  sku?: string
  category?: string
  brand?: string
}) {
  gtag("event", "add_to_cart", {
    currency: "BRL",
    value: p.price * p.quantity,
    items: [{
      item_id: p.sku || String(p.id),
      item_name: p.name,
      price: p.price,
      quantity: p.quantity,
      item_category: p.category,
      item_brand: p.brand,
    }],
  })
}

export function trackBeginCheckout(
  items: { id: number; name: string; price: number; quantity: number; sku: string }[],
  total: number
) {
  gtag("event", "begin_checkout", {
    currency: "BRL",
    value: total,
    items: items.map((i) => ({
      item_id: i.sku || String(i.id),
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  })
}

export function storePurchaseData(data: PurchaseData) {
  if (typeof window === "undefined") return
  sessionStorage.setItem("gtag_purchase", JSON.stringify(data))
}

export function firePendingPurchase() {
  if (typeof window === "undefined") return
  const raw = sessionStorage.getItem("gtag_purchase")
  if (!raw) return
  sessionStorage.removeItem("gtag_purchase")
  try {
    const data: PurchaseData = JSON.parse(raw)
    gtag("event", "purchase", {
      transaction_id: data.transaction_id,
      currency: "BRL",
      value: data.value,
      shipping: data.shipping,
      items: data.items,
    })
  } catch {
    // silently ignore malformed data
  }
}
