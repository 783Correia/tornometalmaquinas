import fs from 'fs';
import { parse } from 'csv-parse/sync';

const SUPABASE_URL = 'https://lozduuvplbfiduaigjth.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvemR1dXZwbGJmaWR1YWlnanRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTU4NDUsImV4cCI6MjA4ODk5MTg0NX0.J7i39lHSeWdC1y9G1o7cW4UKpfOcVdZ3IRFjhoSX1Tw';
const CSV_PATH = '/Users/onetech/Downloads/produtos_2026-03-16-11-23-41.csv';
const OUTPUT_SQL_PATH = '/Users/onetech/tornometalmaquinas/scripts/import-products.sql';

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

// Escape SQL strings
function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

// Supabase REST API helper (only for reading existing data)
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

// Get existing products
async function getExistingProducts() {
  console.log('Fetching existing products...');
  const products = await supabaseRequest('products?select=sku,name', { method: 'GET' });

  const skuSet = new Set();
  const nameSet = new Set();

  products.forEach(p => {
    if (p.sku) skuSet.add(p.sku.trim());
    if (p.name) nameSet.add(p.name.trim());
  });

  return { skuSet, nameSet };
}

// Get existing categories
async function getExistingCategories() {
  console.log('Fetching existing categories...');
  const categories = await supabaseRequest('categories?select=id,slug,name', { method: 'GET' });
  const map = new Map();
  categories.forEach(c => map.set(c.slug, { id: c.id, name: c.name }));
  return map;
}

// Get existing brands
async function getExistingBrands() {
  console.log('Fetching existing brands...');
  const brands = await supabaseRequest('brands?select=id,slug,name', { method: 'GET' });
  const map = new Map();
  brands.forEach(b => map.set(b.slug, { id: b.id, name: b.name }));
  return map;
}

// Main function
async function generateImportSQL() {
  console.log('Reading CSV file...');
  const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');

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

  // Get existing data
  const { skuSet, nameSet } = await getExistingProducts();
  const categoriesMap = await getExistingCategories();
  const brandsMap = await getExistingBrands();

  // Track new categories and brands
  const newCategories = new Map();
  const newBrands = new Map();

  // SQL statements
  let sqlStatements = [];

  // Header comment
  sqlStatements.push('-- Product Import SQL');
  sqlStatements.push('-- Generated: ' + new Date().toISOString());
  sqlStatements.push('-- Total records in CSV: ' + records.length);
  sqlStatements.push('');

  let newProductCount = 0;
  let skippedCount = 0;

  // First pass: collect new categories and brands
  for (const record of records) {
    if (record['Situação'] !== 'Ativo') continue;

    const name = record['Descrição'];
    const sku = record['Código'] ? record['Código'].trim() : '';

    // Skip if already exists
    if ((sku && skuSet.has(sku)) || nameSet.has(name)) {
      skippedCount++;
      continue;
    }

    // Check category
    const categoryName = record['Categoria do produto'];
    if (categoryName && categoryName.trim() !== '') {
      const categorySlug = createSlug(categoryName);
      if (!categoriesMap.has(categorySlug) && !newCategories.has(categorySlug)) {
        newCategories.set(categorySlug, categoryName);
      }
    }

    // Check brand
    const brandName = record['Marca'];
    if (brandName && brandName.trim() !== '') {
      const brandSlug = createSlug(brandName);
      if (!brandsMap.has(brandSlug) && !newBrands.has(brandSlug)) {
        newBrands.set(brandSlug, brandName);
      }
    }
  }

  // Generate category inserts
  if (newCategories.size > 0) {
    sqlStatements.push('-- Insert new categories');
    for (const [slug, name] of newCategories) {
      sqlStatements.push(
        `INSERT INTO categories (name, slug, created_at, updated_at) VALUES (${escapeSql(name)}, ${escapeSql(slug)}, NOW(), NOW());`
      );
    }
    sqlStatements.push('');
  }

  // Generate brand inserts
  if (newBrands.size > 0) {
    sqlStatements.push('-- Insert new brands');
    for (const [slug, name] of newBrands) {
      sqlStatements.push(
        `INSERT INTO brands (name, slug, created_at, updated_at) VALUES (${escapeSql(name)}, ${escapeSql(slug)}, NOW(), NOW());`
      );
    }
    sqlStatements.push('');
  }

  // Second pass: generate product inserts
  sqlStatements.push('-- Insert new products');
  sqlStatements.push('');

  for (const record of records) {
    if (record['Situação'] !== 'Ativo') continue;

    const name = record['Descrição'];
    const sku = record['Código'] ? record['Código'].trim() : '';

    // Skip if already exists
    if ((sku && skuSet.has(sku)) || nameSet.has(name)) {
      continue;
    }

    // Parse data
    const price = parsePrice(record['Preço']);
    const weight = parseFloat(record['Peso líquido (Kg)']) || null;
    const width = parseFloat(record['Largura do produto']) || null;
    const height = parseFloat(record['Altura do Produto']) || null;
    const length = parseFloat(record['Profundidade do produto']) || null;
    const stockQuantity = parseFloat(record['Estoque']) || 0;
    const description = record['Descrição Complementar'] || '';
    const shortDescription = record['Descrição Curta'] || '';

    // Get category and brand references
    const categoryName = record['Categoria do produto'];
    const brandName = record['Marca'];

    const categorySlug = categoryName ? createSlug(categoryName) : null;
    const brandSlug = brandName ? createSlug(brandName) : null;

    // Build INSERT statement
    const slug = createSlug(name);

    sqlStatements.push(`-- ${name}`);
    sqlStatements.push(`INSERT INTO products (`);
    sqlStatements.push(`  name, slug, description, short_description, sku,`);
    sqlStatements.push(`  price, regular_price, sale_price,`);
    sqlStatements.push(`  weight, length, width, height,`);
    sqlStatements.push(`  stock_quantity, manage_stock, status, featured,`);
    sqlStatements.push(`  category_id, brand_id,`);
    sqlStatements.push(`  created_at, updated_at`);
    sqlStatements.push(`) VALUES (`);
    sqlStatements.push(`  ${escapeSql(name)},`);
    sqlStatements.push(`  ${escapeSql(slug)},`);
    sqlStatements.push(`  ${escapeSql(description)},`);
    sqlStatements.push(`  ${escapeSql(shortDescription)},`);
    sqlStatements.push(`  ${sku ? escapeSql(sku) : 'NULL'},`);
    sqlStatements.push(`  ${price !== null ? price : 'NULL'},`);
    sqlStatements.push(`  ${price !== null ? price : 'NULL'},`);
    sqlStatements.push(`  NULL,`); // sale_price
    sqlStatements.push(`  ${weight !== null ? weight : 'NULL'},`);
    sqlStatements.push(`  ${length !== null ? length : 'NULL'},`);
    sqlStatements.push(`  ${width !== null ? width : 'NULL'},`);
    sqlStatements.push(`  ${height !== null ? height : 'NULL'},`);
    sqlStatements.push(`  ${stockQuantity},`);
    sqlStatements.push(`  true,`); // manage_stock
    sqlStatements.push(`  'publish',`);
    sqlStatements.push(`  false,`); // featured

    if (categorySlug) {
      sqlStatements.push(`  (SELECT id FROM categories WHERE slug = ${escapeSql(categorySlug)} LIMIT 1),`);
    } else {
      sqlStatements.push(`  NULL,`);
    }

    if (brandSlug) {
      sqlStatements.push(`  (SELECT id FROM brands WHERE slug = ${escapeSql(brandSlug)} LIMIT 1),`);
    } else {
      sqlStatements.push(`  NULL,`);
    }

    sqlStatements.push(`  NOW(),`);
    sqlStatements.push(`  NOW()`);
    sqlStatements.push(`);`);

    // Handle images if present
    const imageUrls = record['URL Imagens Externas'];
    if (imageUrls && imageUrls.trim() !== '') {
      const urls = imageUrls.split(',').map(url => url.trim()).filter(url => url);
      for (let i = 0; i < urls.length; i++) {
        sqlStatements.push(`INSERT INTO product_images (product_id, src, alt, position, created_at, updated_at)`);
        sqlStatements.push(`VALUES (`);
        sqlStatements.push(`  (SELECT id FROM products WHERE slug = ${escapeSql(slug)} LIMIT 1),`);
        sqlStatements.push(`  ${escapeSql(urls[i])},`);
        sqlStatements.push(`  '',`);
        sqlStatements.push(`  ${i},`);
        sqlStatements.push(`  NOW(),`);
        sqlStatements.push(`  NOW()`);
        sqlStatements.push(`);`);
      }
    }

    sqlStatements.push('');
    newProductCount++;
  }

  // Write SQL file
  const sqlContent = sqlStatements.join('\n');
  fs.writeFileSync(OUTPUT_SQL_PATH, sqlContent, 'utf-8');

  console.log('\n=== SQL Generation Summary ===');
  console.log(`Total products in CSV: ${records.length}`);
  console.log(`Skipped (already exist): ${skippedCount}`);
  console.log(`New products to import: ${newProductCount}`);
  console.log(`New categories: ${newCategories.size}`);
  console.log(`New brands: ${newBrands.size}`);
  console.log(`\nSQL file generated: ${OUTPUT_SQL_PATH}`);
  console.log('\nNext steps:');
  console.log('1. Open Supabase SQL Editor');
  console.log('2. Copy and paste the content of import-products.sql');
  console.log('3. Run the SQL statements');
}

// Run
generateImportSQL().catch(console.error);
