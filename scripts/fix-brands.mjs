import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lozduuvplbfiduaigjth.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // 1. Fix Juhmil -> Jumil
  const { data: juhmil } = await supabase.from('brands').select('id').eq('name', 'Juhmil').single();
  const { data: jumil } = await supabase.from('brands').select('id').eq('name', 'Jumil').single();

  if (juhmil && jumil) {
    // Move products from Juhmil to Jumil
    await supabase.from('products').update({ brand_id: jumil.id }).eq('brand_id', juhmil.id);
    // Delete Juhmil
    await supabase.from('brands').delete().eq('id', juhmil.id);
    console.log('Merged Juhmil into Jumil');
  } else if (juhmil && !jumil) {
    // Just rename
    await supabase.from('brands').update({ name: 'Jumil', slug: 'jumil' }).eq('id', juhmil.id);
    console.log('Renamed Juhmil to Jumil');
  } else {
    console.log('Juhmil not found or already fixed');
  }

  // 2. Remove brands with no products
  const { data: brands } = await supabase.from('brands').select('id, name');
  for (const brand of brands || []) {
    const { count } = await supabase.from('products').select('id', { count: 'exact', head: true }).eq('brand_id', brand.id);
    if (count === 0) {
      await supabase.from('brands').delete().eq('id', brand.id);
      console.log(`Removed empty brand: ${brand.name}`);
    } else {
      console.log(`Keeping brand: ${brand.name} (${count} products)`);
    }
  }
}

main();
