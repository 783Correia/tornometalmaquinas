import fs from 'fs';
import { parse } from 'csv-parse/sync';

const SUPABASE_URL = 'https://lozduuvplbfiduaigjth.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvemR1dXZwbGJmaWR1YWlnanRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTU4NDUsImV4cCI6MjA4ODk5MTg0NX0.J7i39lHSeWdC1y9G1o7cW4UKpfOcVdZ3IRFjhoSX1Tw';
const CSV_PATH = '/Users/onetech/Downloads/produtos_2026-03-16-11-23-41.csv';

// Helper function to create slug
function createSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to parse Brazilian price format
function parsePrice(priceStr) {
  if (!priceStr) return null;
  const cleanPrice = priceStr.replace('.', '').replace(',', '.');
  const parsed = parseFloat(cleanPrice);
  return isNaN(parsed) ? null : parsed;
}

// Supabase REST API helper
async function supabaseRequest(endpoint, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase error: ${response.status} ${error}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Get or create category
async function getOrCreateCategory(name) {
  if (!name || name.trim() === '') return null;

  const slug = createSlug(name);

  // Check if exists
  const existing = await supabaseRequest(
    `categories?slug=eq.${encodeURIComponent(slug)}&select=id,name`,
    { method: 'GET' }
  );

  if (existing && existing.length > 0) {
    return existing[0].id;
  }

  // Create new
  const created = await supabaseRequest('categories', {
    method: 'POST',
    body: JSON.stringify({ name, slug })
  });

  return created[0].id;
}

// Get or create brand
async function getOrCreateBrand(name) {
  if (!name || name.trim() === '') return null;

  const slug = createSlug(name);

  // Check if exists
  const existing = await supabaseRequest(
    `brands?slug=eq.${encodeURIComponent(slug)}&select=id,name`,
    { method: 'GET' }
  );

  if (existing && existing.length > 0) {
    return existing[0].id;
  }

  // Create new
  const created = await supabaseRequest('brands', {
    method: 'POST',
    body: JSON.stringify({ name, slug })
  });

  return created[0].id;
}

// Check if product exists
async function productExists(sku, name) {
  // Check by SKU if available
  if (sku && sku.trim() !== '') {
    const bySku = await supabaseRequest(
      `products?sku=eq.${encodeURIComponent(sku.trim())}&select=id`,
      { method: 'GET' }
    );
    if (bySku && bySku.length > 0) return true;
  }

  // Check by name
  if (name && name.trim() !== '') {
    const byName = await supabaseRequest(
      `products?name=eq.${encodeURIComponent(name.trim())}&select=id`,
      { method: 'GET' }
    );
    if (byName && byName.length > 0) return true;
  }

  return false;
}

// Create product
async function createProduct(productData) {
  const created = await supabaseRequest('products', {
    method: 'POST',
    body: JSON.stringify(productData)
  });

  return created[0];
}

// Create product images
async function createProductImages(productId, imageUrls) {
  if (!imageUrls || imageUrls.trim() === '') return;

  const urls = imageUrls.split(',').map(url => url.trim()).filter(url => url);

  for (let i = 0; i < urls.length; i++) {
    try {
      await supabaseRequest('product_images', {
        method: 'POST',
        body: JSON.stringify({
          product_id: productId,
          src: urls[i],
          alt: '',
          position: i
        })
      });
    } catch (error) {
      console.warn(`Failed to add image ${urls[i]}:`, error.message);
    }
  }
}

// Main import function
async function importProducts() {
  console.log('Reading CSV file...');

  const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');

  // Parse CSV with proper handling of multiline fields
  const records = parse(fileContent, {
    columns: true,
    delimiter: ';',
    quote: '"',
    relax_quotes: true,
    relax_column_count: true,
    skip_empty_lines: true,
    trim: true,
    bom: true
  });

  console.log(`Found ${records.length} products in CSV`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const record of records) {
    try {
      // Only import active products
      if (record['Situação'] !== 'Ativo') {
        skipped++;
        continue;
      }

      const name = record['Descrição'];
      const sku = record['Código'] ? record['Código'].trim() : '';

      // Skip if product already exists
      if (await productExists(sku, name)) {
        console.log(`Skipping duplicate: ${name}`);
        skipped++;
        continue;
      }

      // Parse data
      const price = parsePrice(record['Preço']);
      const weight = parseFloat(record['Peso líquido (Kg)']) || null;
      const width = parseFloat(record['Largura do produto']) || null;
      const height = parseFloat(record['Altura do Produto']) || null;
      const length = parseFloat(record['Profundidade do produto']) || null;
      const stockQuantity = parseFloat(record['Estoque']) || 0;

      // Get or create category and brand
      const categoryId = await getOrCreateCategory(record['Categoria do produto']);
      const brandId = await getOrCreateBrand(record['Marca']);

      // Prepare product data
      const productData = {
        name,
        slug: createSlug(name),
        description: record['Descrição Complementar'] || '',
        short_description: record['Descrição Curta'] || '',
        sku: sku || null,
        price,
        regular_price: price,
        sale_price: null,
        weight,
        length,
        width,
        height,
        stock_quantity: stockQuantity,
        manage_stock: true,
        status: 'publish',
        featured: false,
        category_id: categoryId,
        brand_id: brandId,
        woo_id: null
      };

      // Create product
      console.log(`Importing: ${name}`);
      const product = await createProduct(productData);

      // Add images
      if (record['URL Imagens Externas']) {
        await createProductImages(product.id, record['URL Imagens Externas']);
      }

      imported++;

      // Add small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`Error importing product ${record['Descrição']}:`, error.message);
      errors++;
    }
  }

  console.log('\n=== Import Summary ===');
  console.log(`Total products in CSV: ${records.length}`);
  console.log(`Successfully imported: ${imported}`);
  console.log(`Skipped (duplicates/inactive): ${skipped}`);
  console.log(`Errors: ${errors}`);
}

// Run import
importProducts().catch(console.error);
