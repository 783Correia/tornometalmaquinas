import { createClient } from "@supabase/supabase-js";

const OLD = createClient(
  "https://lozduuvplbfiduaigjth.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvemR1dXZwbGJmaWR1YWlnanRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQxNTg0NSwiZXhwIjoyMDg4OTkxODQ1fQ.XZJUkoJJYvYaSEAlRJwBIFbyt3A3nvJ7nUgQ59A5bwU"
);

const tables = ["categories","brands","products","product_images","customers","orders","order_items","leads","settings","admins","reviews"];

for (const table of tables) {
  const { data, error } = await OLD.from(table).select("*").limit(1);
  if (error) { console.log(`${table}: ERRO - ${error.message}`); continue; }
  if (!data || data.length === 0) { console.log(`${table}: (vazio)`); continue; }
  console.log(`${table}: ${Object.keys(data[0]).join(", ")}`);
}
