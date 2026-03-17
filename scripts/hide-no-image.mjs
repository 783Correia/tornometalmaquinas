import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lozduuvplbfiduaigjth.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data } = await supabase
    .from('products')
    .select('id, name, sku, product_images(id)')
    .eq('status', 'publish');

  const noImg = data.filter(p => !p.product_images || p.product_images.length === 0);

  console.log(`Found ${noImg.length} products without images:`);
  for (const p of noImg) {
    console.log(`  - ${p.name} (SKU: ${p.sku})`);
  }

  if (noImg.length > 0) {
    const ids = noImg.map(p => p.id);
    await supabase.from('products').update({ status: 'draft' }).in('id', ids);
    console.log(`\nSet ${ids.length} products to draft.`);
  }
}

main();
