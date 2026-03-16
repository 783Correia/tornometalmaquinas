import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lozduuvplbfiduaigjth.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvemR1dXZwbGJmaWR1YWlnanRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTU4NDUsImV4cCI6MjA4ODk5MTg0NX0.J7i39lHSeWdC1y9G1o7cW4UKpfOcVdZ3IRFjhoSX1Tw';
const BUCKET = 'product-images';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  // Get all product images
  const { data: images, error } = await supabase
    .from('product_images')
    .select('id, product_id, src')
    .order('id');

  if (error) {
    console.error('Error fetching images:', error);
    return;
  }

  console.log(`Found ${images.length} images to migrate\n`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const img of images) {
    const oldUrl = img.src;

    // Skip if already migrated (Supabase URL)
    if (oldUrl.includes('supabase.co')) {
      skipped++;
      continue;
    }

    // Skip if not a valid URL
    if (!oldUrl.startsWith('http')) {
      console.warn(`Skipping invalid URL: ${oldUrl}`);
      skipped++;
      continue;
    }

    try {
      // Download image
      const response = await fetch(oldUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        redirect: 'follow',
      });

      if (!response.ok) {
        console.error(`Failed to download ${oldUrl}: ${response.status}`);
        errors++;
        continue;
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      // Generate filename
      const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
      const filename = `product-${img.product_id}/${img.id}.${ext}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filename, buffer, {
          contentType,
          upsert: true,
        });

      if (uploadError) {
        console.error(`Upload error for ${filename}:`, uploadError.message);
        errors++;
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);
      const newUrl = urlData.publicUrl;

      // Update database
      const { error: updateError } = await supabase
        .from('product_images')
        .update({ src: newUrl })
        .eq('id', img.id);

      if (updateError) {
        console.error(`DB update error for image ${img.id}:`, updateError.message);
        errors++;
        continue;
      }

      migrated++;
      console.log(`[${migrated}/${images.length}] Migrated: ${filename}`);

      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 200));

    } catch (err) {
      console.error(`Error processing ${oldUrl}:`, err.message);
      errors++;
    }
  }

  console.log('\n=== Migration Summary ===');
  console.log(`Total images: ${images.length}`);
  console.log(`Migrated: ${migrated}`);
  console.log(`Skipped (already migrated): ${skipped}`);
  console.log(`Errors: ${errors}`);
}

main();
