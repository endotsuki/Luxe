'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ProductDialog } from '@/components/product-dialog';
import type { Product } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { sizedImage } from '@/lib/utils';
import { IconArrowUpRight, IconPencil, IconCategoryPlus, IconTrash, IconSlideshow } from '@tabler/icons-react';

interface ProductsTableProps {
  products: Product[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const [slideshow, setSlideshow] = useState<Record<string, boolean>>({});

  const perPage = 10;
  const sorted = [...products].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const total = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const openDialog = (prod: Product | null, preview: boolean) => {
    setSelected(prod);
    setPreviewMode(preview);
    setDialogOpen(true);
  };

  const openDelete = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setToDelete(prod);
      setDeleteOpen(true);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/admin/slideshow`);
        if (!res.ok) return;
        const json = await res.json();
        if (mounted) {
          const map: Record<string, boolean> = {};
          (json.products || []).forEach((p: any) => (map[p.id] = true));
          setSlideshow(map);
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleSlideshow = async (id: string, add: boolean) => {
    try {
      const res = await fetch(add ? `/api/admin/slideshow` : `/api/admin/slideshow?productId=${encodeURIComponent(id)}`, {
        method: add ? 'POST' : 'DELETE',
        ...(add && { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: id }) }),
      });
      if (res.ok) {
        setSlideshow((s) => (add ? { ...s, [id]: true } : Object.fromEntries(Object.entries(s).filter(([k]) => k !== id))));
      } else {
        const body = await res.json().catch(() => null);
        alert(body?.error || body?.message || 'Failed');
      }
    } catch (e) {
      console.error(e);
      alert('Failed');
    }
  };
  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(toDelete.id);
    setDeleteOpen(false);
    try {
      const res = await fetch(`/api/products/${toDelete.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
        // Optional: show success toast
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to delete product');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to delete product');
    } finally {
      setDeleting(null);
      setToDelete(null);
    }
  };

  const closeDialog = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelected(null);
      router.refresh();
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <Button variant={'on-hold'} onClick={() => openDialog(null, false)}>
          <IconCategoryPlus className='h-4 w-4' />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className='text-muted-foreground py-8 text-center'>No products yet. Click "Add Product" to create your first product.</div>
      ) : (
        <div className='rounded-md border p-5'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <h6>Product</h6>
                </TableHead>
                <TableHead>
                  <h6>Price</h6>
                </TableHead>
                <TableHead>
                  <h6>Stock</h6>
                </TableHead>
                <TableHead>
                  <h6>Status</h6>
                </TableHead>
                <TableHead className='text-right'>
                  <h6>Actions</h6>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div
                      className='flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-75'
                      onClick={() => openDialog(p, true)}
                    >
                      <div className='bg-muted relative h-12 w-12 overflow-hidden rounded-md'>
                        <Image
                          src={p.image_url ? sizedImage(p.image_url, 48) : '/placeholder.svg'}
                          alt={p.name}
                          fill
                          sizes='32'
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div className='flex-1'>
                        <h6 className='font-medium'>{p.name}</h6>
                        <div className='text-muted-foreground text-xs'>{p.slug}</div>
                        {p.additional_images?.length > 0 && (
                          <div className='text-muted-foreground mt-1 text-xs'>
                            +{p.additional_images.length} more image{p.additional_images.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <h6 className='font-medium'>${p.price}</h6>
                      {p.compare_at_price && <h6 className='text-muted-foreground text-sm line-through'>${p.compare_at_price}</h6>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.stock > 10 ? 'outline' : p.stock > 0 ? 'in-active' : 'destructive'}>{p.stock} units</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.is_active ? 'outline' : 'in-active'}>{p.is_active ? 'Active' : 'Inactive'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center justify-end gap-2'>
                      <Button variant='outline' size='icon' className='h-9 w-9'>
                        <Link href={`/products/${p.slug}`} target='_blank'>
                          <IconArrowUpRight stroke={1.5} className='h-5 w-5' />
                        </Link>
                      </Button>
                      <Button variant='outline' size='icon' onClick={() => openDialog(p, false)} className='h-9 w-9'>
                        <IconPencil stroke={1.5} className='h-5 w-5' />
                      </Button>
                      <Button
                        variant={slideshow[p.id] ? 'default' : 'outline'}
                        size='icon'
                        onClick={() => toggleSlideshow(p.id, !slideshow[p.id])}
                        className='h-9 w-9'
                        aria-label={slideshow[p.id] ? 'Remove from slideshow' : 'Add to slideshow'}
                      >
                        <IconSlideshow stroke={1.5} className='h-5 w-5' />
                      </Button>
                      <Button
                        variant='destructive'
                        size='icon'
                        onClick={() => openDelete(p.id)}
                        disabled={deleting === p.id}
                        className='h-9 w-9'
                      >
                        <IconTrash stroke={1.5} className='h-5 w-5' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className='mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-muted-foreground text-sm'>
              Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, sorted.length)} of {sorted.length} products
            </p>
            {total > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href='#'
                      onClick={(e) => (e.preventDefault(), page > 1 && setPage(page - 1))}
                      className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: total }, (_, i) => i + 1).map((pg) => (
                    <PaginationItem key={pg}>
                      <PaginationLink
                        href='#'
                        size='default'
                        isActive={pg === page}
                        onClick={(e) => (e.preventDefault(), setPage(pg))}
                        className='cursor-pointer'
                      >
                        {pg}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href='#'
                      onClick={(e) => (e.preventDefault(), page < total && setPage(page + 1))}
                      className={page === total ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      )}

      <ProductDialog product={selected} open={dialogOpen} onOpenChange={closeDialog} isPreviewMode={previewMode} />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{toDelete?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button type='button' variant='destructive' onClick={confirmDelete} disabled={deleting === toDelete?.id}>
              {deleting === toDelete?.id ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
