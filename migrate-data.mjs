// Script de migração: copia todos os dados do Supabase antigo para o novo
// Rodar: node migrate-data.mjs

import { createClient } from "@supabase/supabase-js";

const OLD = createClient(
  "https://lozduuvplbfiduaigjth.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvemR1dXZwbGJmaWR1YWlnanRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQxNTg0NSwiZXhwIjoyMDg4OTkxODQ1fQ.XZJUkoJJYvYaSEAlRJwBIFbyt3A3nvJ7nUgQ59A5bwU"
);

const NEW = createClient(
  "https://xebskockruobeovmqlhq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlYnNrb2NrcnVvYmVvdm1xbGhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk4MTY5NSwiZXhwIjoyMDkwNTU3Njk1fQ.umAq0gnvuFEuyhgM9XHjw9y5NKEceH200PBr1gWGNqA"
);

async function migrate(table, opts = {}) {
  console.log(`\n→ Migrando ${table}...`);
  let query = OLD.from(table).select("*");
  if (opts.order) query = query.order(opts.order);
  const { data, error } = await query;
  if (error) { console.error(`  ERRO ao ler ${table}:`, error.message); return 0; }
  if (!data || data.length === 0) { console.log(`  (vazio)`); return 0; }

  // Inserir em lotes de 500
  const batchSize = 500;
  let inserted = 0;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const { error: insertErr } = await NEW.from(table).insert(batch);
    if (insertErr) { console.error(`  ERRO ao inserir lote em ${table}:`, insertErr.message); }
    else inserted += batch.length;
  }
  console.log(`  ✓ ${inserted} registros migrados`);
  return inserted;
}

async function main() {
  console.log("=== MIGRAÇÃO TORNOMETAL SUPABASE ===\n");
  console.log("Origem: lozduuvplbfiduaigjth");
  console.log("Destino: xebskockruobeovmqlhq\n");

  // Ordem importa por causa das foreign keys
  await migrate("categories", { order: "id" });
  await migrate("brands", { order: "id" });
  await migrate("products", { order: "id" });
  await migrate("product_images", { order: "id" });
  await migrate("settings");
  await migrate("leads", { order: "id" });
  await migrate("reviews", { order: "id" });
  await migrate("orders", { order: "id" });
  await migrate("order_items", { order: "id" });

  console.log("\n=== CONCLUÍDO ===");
  console.log("⚠️  customers e admins precisam ser migrados via Supabase Auth (usuários).");
  console.log("   Acesse o painel → Authentication → Users e crie o admin manualmente.");
}

main().catch(console.error);
