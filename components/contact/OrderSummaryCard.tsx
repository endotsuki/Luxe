import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { IconShoppingBag } from "@tabler/icons-react";
import type { CartItem } from "@/lib/types";
import { sizedImage } from "@/lib/utils";

interface OrderSummaryCardProps {
  cartItems: CartItem[];
  total: number;
}

const normalizeImageSrc = (url?: string) => {
  if (!url) return "/placeholder.svg";
  const path = url.split("?")[0];
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("//")
  )
    return path;
  return path.startsWith("/") ? path : `/images/${path}`;
};

export function OrderSummaryCard({ cartItems, total }: OrderSummaryCardProps) {
  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <IconShoppingBag className="w-8 h-8 text-primary" />
          Order Summary
        </h2>

        <div className="space-y-4">
          {cartItems.map((item, index) => (
            <div
              key={item.id}
              className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
            >
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted shrink-0 border">
                <Image
                  src={
                    item.product?.image_url
                      ? sizedImage(item.product.image_url, 400)
                      : "/placeholder.svg"
                  }
                  alt={item.product?.name || "Product"}
                  fill
                  objectFit="cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-semibold text-lg">
                    {index + 1}. {item.product?.name}
                  </h3>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">Unit Price</p>
                    <h6 className="font-semibold">
                      ${(item.product?.price || 0).toFixed(2)}
                    </h6>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Quantity:{" "}
                      <span className="font-medium text-foreground">
                        {item.quantity}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Subtotal</p>
                    <h6 className="text-xl font-bold text-primary">
                      ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        <div className="space-y-3 bg-muted/50 rounded-lg p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Items Total</span>
            <h6 className="font-medium">{cartItems.length} item(s)</h6>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <h6 className="font-medium">${total.toFixed(2)}</h6>
          </div>
          <Separator />
          <div className="flex justify-between text-2xl font-bold">
            <h6>Total Amount</h6>
            <h6 className="text-primary">${total.toFixed(2)}</h6>
          </div>
        </div>

        <div className="mt-6 p-4 bg-accent/10 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Need to make changes?{" "}
            <a
              href="/cart"
              className="text-primary hover:underline font-medium"
            >
              Edit your cart
            </a>{" "}
            before placing your order.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
