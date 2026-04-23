import { createClient } from "@supabase/supabase-js";

const OLD = createClient(
  "https://lozduuvplbfiduaigjth.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvemR1dXZwbGJmaWR1YWlnanRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQxNTg0NSwiZXhwIjoyMDg4OTkxODQ1fQ.XZJUkoJJYvYaSEAlRJwBIFbyt3A3nvJ7nUgQ59A5bwU"
);

const NEW = createClient(
  "https://xebskockruobeovmqlhq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlYnNrb2NrcnVvYmVvdm1xbGhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk4MTY5NSwiZXhwIjoyMDkwNTU3Njk1fQ.umAq0gnvuFEuyhgM9XHjw9y5NKEceH200PBr1gWGNqA"
);

// Primeiro remove o FK de orders.customer_id temporariamente via SQL direto não é possível via REST
// Então vamos inserir com customer_id = null para preservar o histórico
const { data: orders } = await OLD.from("orders").select("*").order("id");
console.log(`${orders?.length || 0} pedidos encontrados`);

if (orders && orders.length > 0) {
  // Insere sem customer_id (null) para não quebrar FK
  const sanitized = orders.map(o => ({ ...o, customer_id: null }));
  const { error } = await NEW.from("orders").insert(sanitized);
  if (error) console.error("Erro orders:", error.message);
  else console.log(`✓ ${orders.length} pedidos migrados`);
}

const { data: items } = await OLD.from("order_items").select("*").order("id");
console.log(`${items?.length || 0} itens de pedido encontrados`);

if (items && items.length > 0) {
  const { error } = await NEW.from("order_items").insert(items);
  if (error) console.error("Erro order_items:", error.message);
  else console.log(`✓ ${items.length} itens migrados`);
}

console.log("\nFim.");
