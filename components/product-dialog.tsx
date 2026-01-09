'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { Product } from '@/lib/types';
import { ImagePreview } from './image-preview';
import { fixImageOrientation } from '@/lib/image-utils';
import { useProductForm } from '@/hooks/useProductForm';

interface ProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPreviewMode?: boolean;
}

export function ProductDialog({ product, open, onOpenChange, isPreviewMode = false }: ProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const { formData, existingImages, setFormData, setExistingImages, handleNameChange, resetForm } = useProductForm(product, open);
  const typedExistingImages = existingImages as (string | { url: string })[];

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  /**
   * Compresses and converts image to WebP format with fixed 1080x1080 dimensions
   * @param file - The image file to convert
   * @returns Promise resolving to a compressed WebP Blob
   */
  const compressToWebP = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Set fixed dimensions to 1080x1080
          canvas.width = 1080;
          canvas.height = 1080;

          const ctx = canvas.getContext('2d')!;
          const imgWidth = img.naturalWidth;
          const imgHeight = img.naturalHeight;
          const imgRatio = imgWidth / imgHeight;
          const canvasRatio = 1; // 1080/1080 = 1

          let drawWidth = 1080;
          let drawHeight = 1080;
          let drawX = 0;
          let drawY = 0;

          // Calculate dimensions to fill canvas while maintaining aspect ratio (cover fit)
          if (imgRatio > canvasRatio) {
            drawWidth = 1080 * (imgRatio / canvasRatio);
            drawX = -(drawWidth - 1080) / 2;
          } else {
            drawHeight = 1080 / (imgRatio / canvasRatio);
            drawY = -(drawHeight - 1080) / 2;
          }

          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

          // Convert to WebP with compression quality 0.8 (80%)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to convert image to WebP'));
              }
            },
            'image/webp',
            0.8
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  /**
   * Uploads a compressed WebP image to Cloudinary using an unsigned upload preset
   * @param file - The image file to upload
   * @returns Promise resolving to { url, filename }
   */
  const uploadImageToCloudinary = async (file: File): Promise<{ url: string; filename: string }> => {
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!uploadPreset) {
      throw new Error('Cloudinary upload preset not configured');
    }

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

    // Compress to WebP before uploading
    const compressedBlob = await compressToWebP(file);
    const compressedFile = new File([compressedBlob], `${file.name.split('.')[0]}.webp`, {
      type: 'image/webp',
    });

    const data = new FormData();
    data.append('file', compressedFile);
    data.append('upload_preset', uploadPreset);

    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: data,
    });

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      url: result.secure_url,
      filename: result.public_id,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Upload new images to Cloudinary
      let image_urls: string[] = [];

      const files = formData.image_files as File[];
      if (files.length > 0) {
        // Fix orientation for each file before upload
        const corrected = await Promise.all(files.map((f) => fixImageOrientation(f)));
        // Upload each file to Cloudinary
        const uploadResults = await Promise.all(corrected.map((f) => uploadImageToCloudinary(f)));
        image_urls = uploadResults.map((result) => result.url);
      }

      // Include existing images if product is being updated and no new images are provided
      if (image_urls.length === 0 && existingImages.length > 0 && product) {
        image_urls = typedExistingImages.map((img) => (typeof img === 'string' ? img : img.url));
      }

      // Build JSON payload with image URLs and other form data
      const payload = {
        ...formData,
        image_files: undefined, // Remove file objects, not needed in JSON
        image_urls, // Add array of Cloudinary URLs
      };

      // Remove undefined values
      Object.keys(payload).forEach((key) => {
        if (payload[key as keyof typeof payload] === undefined) {
          delete payload[key as keyof typeof payload];
        }
      });

      const url = product ? `/api/products/${product.id}` : '/api/products';
      const res = await fetch(url, {
        method: product ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const txt = await res.text();

      if (!res.ok) {
        try {
          const err = JSON.parse(txt);
          throw new Error(err?.error || `Server error: ${res.status}`);
        } catch {
          throw new Error(`Server error: ${res.status} - ${txt}`);
        }
      }

      resetForm();
      onOpenChange(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='scrollbar-hide max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>{product ? 'Update product information' : 'Create a new product for your store'}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Product Name</Label>
              <Input value={formData.name} onChange={(e) => handleNameChange(e.target.value)} disabled={isPreviewMode} required />
            </div>
            <div className='space-y-2'>
              <Label>Slug</Label>
              <Input value={formData.slug} disabled={isPreviewMode} readOnly required />
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isPreviewMode}
              rows={3}
            />
          </div>

          <div className='grid grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <Label>Price</Label>
              <Input
                type='number'
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                disabled={isPreviewMode}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label>Compare At Price</Label>
              <Input
                type='number'
                value={formData.compare_at_price}
                onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                disabled={isPreviewMode}
              />
            </div>
            <div className='space-y-2'>
              <Label>Stock</Label>
              <Input
                type='number'
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                disabled={isPreviewMode}
                required
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(v) => setFormData({ ...formData, category_id: v })}
              disabled={isPreviewMode}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select category' />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>Product Images</Label>
            <Input
              type='file'
              accept='image/*'
              multiple
              disabled={isPreviewMode}
              onChange={(e) => setFormData({ ...formData, image_files: Array.from(e.target.files || []) })}
            />
            <p className='text-muted-foreground text-xs'>Upload one or more images. First image will be the main product image.</p>
          </div>

          <ImagePreview
            existingImages={existingImages}
            newImages={formData.image_files}
            onRemoveExisting={(idx) => setExistingImages(existingImages.filter((_, i) => i !== idx))}
            onRemoveNew={(idx) => setFormData({ ...formData, image_files: formData.image_files.filter((_, i) => i !== idx) })}
            isPreviewMode={isPreviewMode}
          />

          <div className='flex items-center space-x-2'>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              disabled={isPreviewMode}
            />
            <Label>Active</Label>
          </div>

          <DialogFooter>
            <Button type='button' variant='destructive' onClick={() => onOpenChange(false)}>
              {isPreviewMode ? 'Close' : 'Cancel'}
            </Button>
            {!isPreviewMode && (
              <Button type='submit' disabled={loading}>
                {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
