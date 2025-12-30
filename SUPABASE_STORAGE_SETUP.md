# Supabase Storage Image Upload Migration Guide

## What Changed

Your project now uploads images directly to **Supabase Storage** instead of storing them locally in the `public/images` folder. This fixes the Vercel 250MB limit error and works in both development and production.

### Before (Local Storage - Won't work on Vercel):
```
Browser → API Route → Save to public/images → Save filename to DB
```

### After (Supabase Storage - Works everywhere):
```
Browser → API Route → Upload to Supabase Storage → Save public URL to DB
```

---

## Setup Steps

### 1. Create Supabase Storage Bucket

Go to **Supabase Dashboard** → **Storage** → **Create Bucket**:
- **Name**: `product-images`
- **Privacy**: `Public`
- Click **Create**

### 2. Enable CORS (if needed)

In Supabase → Storage → `product-images` → Settings:
- Allow public access (should be default for public bucket)

### 3. Verify Environment Variables

Your `.env.local` should already have:
```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Test Locally

```bash
# Install/update dependencies
pnpm install

# Start dev server
pnpm dev
```

Visit http://localhost:3000/admin → Add/Edit Product → Upload image
- Image should upload to Supabase Storage
- Product should save with image URL (not filename)

### 5. Deploy to Vercel

```bash
# Push to GitHub (Vercel auto-deploys)
git add .
git commit -m "Migrate images to Supabase Storage"
git push origin main
```

---

## Code Changes Made

### ✅ New Files
- **`lib/supabase-upload.ts`** - Upload utility with image resizing
  - `uploadImageToSupabase(file, supabase)` - Resize & upload to Supabase Storage
  - `deleteImageFromSupabase(filename, supabase)` - Delete from storage

### ✅ Updated Files

**`app/api/products/route.ts` (POST)**
- Removed: Local filesystem image saving
- Added: Supabase Storage upload for each image
- DB stores: Full public URLs (not filenames)

**`app/api/products/[id]/route.ts` (PUT & DELETE)**
- PUT: Uses Supabase Storage instead of local files
- DELETE: Extracts filename from URL and deletes from Supabase Storage

**`components/product-dialog.tsx`**
- No changes needed — already handles file upload correctly
- `fixImageOrientation()` still runs before upload (good for EXIF)

---

## Database Changes

Your `products` table columns should already support full URLs:

```sql
image_url TEXT           -- Now stores full Supabase URL
additional_images TEXT[] -- Now stores array of full Supabase URLs
```

If you need to migrate existing local image filenames to Supabase URLs, run this SQL:

```sql
-- WARNING: Backup your database first!
-- This is a template - modify based on your actual bucket name

UPDATE products
SET image_url = 'https://YOUR_SUPABASE_URL/storage/v1/object/public/product-images/' || image_url
WHERE image_url IS NOT NULL 
  AND image_url NOT LIKE 'https://%';

UPDATE products
SET additional_images = array_agg(
  'https://YOUR_SUPABASE_URL/storage/v1/object/public/product-images/' || elem
)
FROM (SELECT unnest(additional_images) AS elem) t
WHERE additional_images IS NOT NULL
GROUP BY id;
```

**Find your Supabase URL:**
- Supabase Dashboard → Project Settings → API → Project URL
- Format: `https://xxxxxxxxxxxx.supabase.co`

---

## Testing Checklist

- [ ] Admin page loads
- [ ] Can create product with 1+ images
- [ ] Images upload to Supabase (check Storage bucket)
- [ ] Product displays with correct image
- [ ] Can edit product and change images
- [ ] Can delete product (images removed from storage)
- [ ] Works on Vercel (no 250MB errors)
- [ ] Images serve from Supabase CDN (fast load)

---

## Troubleshooting

### "Upload failed: Bucket not found"
→ Create `product-images` bucket in Supabase Storage

### "CORS error when uploading"
→ Make sure bucket is set to `Public` privacy level

### "Images not showing in product page"
→ Check database `image_url` column — should be full URL like:
```
https://xxxxxxxxxxxx.supabase.co/storage/v1/object/public/product-images/uuid.webp
```

### "Still getting 250MB error on Vercel"
→ Check that you deleted `/public/images` folder from git:
```bash
git rm -r public/images
git commit -m "Remove local images"
git push
```

---

## Cleanup (Optional)

Once everything works, you can remove old local image files:

```bash
# Remove from filesystem
rm -r public/images

# Remove from git history
git rm -r public/images
git commit -m "Clean up local image storage"
```

---

## Performance Notes

✅ **Benefits of Supabase Storage:**
- Images served from global CDN (fast)
- Automatic HTTPS
- Scales to any size
- Works on serverless (Vercel, etc.)
- No more 250MB function limit issues

✅ **Image Processing:**
- Resized to 1080px max (sharp library)
- Converted to WebP (smaller, modern format)
- Quality: 80 (good balance)
- Still shows EXIF orientation before upload

---

## API Reference

### Create Product (POST /api/products)
```
FormData:
- name: string
- slug: string  
- description: string
- price: number
- compare_at_price?: number
- category_id?: string
- stock: number
- is_active: boolean
- images: File[] (1+ required)

Returns: { id, name, slug, image_url, additional_images, ... }
```

### Update Product (PUT /api/products/[id])
```
FormData:
- [all above fields]
- images?: File[] (optional - if provided, replaces all)
- existingImages?: JSON string (if no new images, keeps existing)

Returns: { success: true }
```

### Delete Product (DELETE /api/products/[id])
```
Removes product AND deletes all images from Supabase Storage

Returns: { success: true }
```

---

## Questions?

Check:
1. Supabase bucket exists and is public
2. Environment variables set
3. Browser console for upload errors
4. Supabase Storage tab to see if files are there
5. Database to check if URLs are stored correctly
