"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product } from "@/lib/types";
import { IconTrash, IconPlus } from "@tabler/icons-react";

interface SlideshowManagerProps {
  products: Product[];
}

interface SlideshowItem {
  id: string;
  product_id: string;
  product?: Product;
  position: number;
}

export function SlideshowManager({ products }: SlideshowManagerProps) {
  const [slideshowItems, setSlideshowItems] = useState<SlideshowItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSlideshow();
  }, []);

  const fetchSlideshow = async () => {
    try {
      const res = await fetch("/api/admin/slideshow");
      if (!res.ok) return;
      const json = await res.json();
      const items = (json.products || []).map((p: Product, index: number) => ({
        product_id: p.id,
        product: p,
        position: index,
        id: `${p.id}-${index}`,
      }));
      setSlideshowItems(items);
    } catch (e) {
      console.error(e);
    }
  };

  const addProductToSlideshow = async () => {
    if (!selectedProductId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/slideshow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProductId }),
      });
      if (res.ok) {
        setSelectedProductId("");
        await fetchSlideshow();
      } else {
        alert("Failed to add product");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const removeFromSlideshow = async (productId: string) => {
    try {
      const res = await fetch(`/api/admin/slideshow?productId=${encodeURIComponent(productId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchSlideshow();
      } else {
        alert("Failed to remove product");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to remove product");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Slideshow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Product Section */}
        <div className="space-y-2 pb-4 border-b">
          <label className="text-sm font-medium">Add Product to Slideshow</label>
          <div className="flex gap-2">
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addProductToSlideshow} disabled={!selectedProductId || loading}>
              <IconPlus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* Current Slideshow Items */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Current Slideshow ({slideshowItems.length})</label>
          {slideshowItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products in slideshow</p>
          ) : (
            <div className="space-y-2">
              {slideshowItems.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div className="flex items-center gap-3 flex-1">
                    <Badge variant="outline">{index + 1}</Badge>
                    <div>
                      <p className="font-medium text-sm">{item.product?.name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{item.product?.slug}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromSlideshow(item.product_id)}
                    className="h-8 w-8"
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground pt-2">
          Products are displayed in the order shown above. To change the order, remove and re-add products in the desired sequence.
        </p>
      </CardContent>
    </Card>
  );
}
