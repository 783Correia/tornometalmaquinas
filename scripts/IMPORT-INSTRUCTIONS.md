# Bling CSV Import - SQL Approach

## Summary
- **Total products in CSV**: 178
- **Already in database**: 139
- **New products to import**: 39
- **New brands to create**: 2

## Files Generated
- SQL file: `/Users/onetech/tornometalmaquinas/scripts/import-products.sql`
- Contains 1,218 lines of SQL statements

## How to Import

### Option 1: Supabase SQL Editor (Recommended)
1. Go to: https://lozduuvplbfiduaigjth.supabase.co
2. Navigate to SQL Editor
3. Open the file: `scripts/import-products.sql`
4. Copy all content
5. Paste into SQL Editor
6. Click "Run"

### Option 2: Using Supabase CLI
```bash
cd /Users/onetech/tornometalmaquinas
supabase db execute --file scripts/import-products.sql
```

## What the SQL Does

1. **Inserts 2 new brands**:
   - AGCO - Massey - Valtra
   - Juhmil

2. **Inserts 39 new products** with:
   - Product details (name, slug, description, price, dimensions, stock)
   - Category and brand relationships (via subqueries)
   - Product images (where URLs are provided)

## Why This Approach?

The previous REST API approach failed due to Row Level Security (RLS) policies. By running SQL directly in the SQL Editor, you bypass RLS since you're executing as the database owner.

## Verification

After running the SQL, verify the import:

```sql
-- Count products
SELECT COUNT(*) FROM products;

-- Count brands
SELECT COUNT(*) FROM brands;

-- Check the newest products
SELECT name, price, created_at
FROM products
ORDER BY created_at DESC
LIMIT 10;
```

## Rollback (if needed)

If something goes wrong, you can delete the newly imported products:

```sql
-- Delete products created in the last hour
DELETE FROM products
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Delete brands created in the last hour
DELETE FROM brands
WHERE created_at > NOW() - INTERVAL '1 hour';
```
