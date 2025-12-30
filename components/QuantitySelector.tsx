"use client"

import { Button } from "@/components/ui/button"
import { IconMinus, IconPlus } from "@tabler/icons-react"

interface QuantitySelectorProps {
    quantity: number
    onQuantityChange: (quantity: number) => void
    stock: number
    showLabel?: boolean
    showStock?: boolean
    className?: string
}

export function QuantitySelector({
    quantity,
    onQuantityChange,
    stock,
    showLabel = true,
    showStock = true,
    className = "",
}: QuantitySelectorProps) {
    const handleDecrease = () => {
        if (quantity > 1) {
            onQuantityChange(quantity - 1)
        }
    }

    const handleIncrease = () => {
        if (quantity < stock) {
            onQuantityChange(quantity + 1)
        }
    }

    return (
        <div className={`space-y-2 ${className}`}>
            {showLabel && (
                <h6 className="text-base font-semibold block">Quantity</h6>
            )}

            <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <div className="flex items-center border border-border rounded-lg p-0.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 md:h-10 md:w-10"
                        onClick={handleDecrease}
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                    >
                        <IconMinus className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>

                    <span className="px-3 md:px-4 select-none py-2 min-w-10 md:min-w-12 text-center text-sm md:text-base">
                        {quantity}
                    </span>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 md:h-10 md:w-10"
                        onClick={handleIncrease}
                        disabled={quantity >= stock}
                        aria-label="Increase quantity"
                    >
                        <IconPlus className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                </div>

                {showStock && (
                    <span className="text-xs sm:text-sm select-none text-muted-foreground">
                        {stock > 0 ? `${stock} available` : "Out of stock"}
                    </span>
                )}
            </div>
        </div>
    )
}

// Alternative compact version without label
export function QuantitySelectorCompact({
    quantity,
    onQuantityChange,
    stock,
    className = "",
}: Omit<QuantitySelectorProps, 'showLabel' | 'showStock'>) {
    return (
        <div className={`flex items-center border border-border rounded-lg p-0.5 ${className}`}>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
            >
                <IconMinus className="h-3 w-3" />
            </Button>

            <span className="px-3 py-2 min-w-10 text-center text-sm">
                {quantity}
            </span>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onQuantityChange(Math.min(stock, quantity + 1))}
                disabled={quantity >= stock}
                aria-label="Increase quantity"
            >
                <IconPlus className="h-3 w-3" />
            </Button>
        </div>
    )
}

// Usage Example:
/*
import { QuantitySelector, QuantitySelectorCompact } from "@/components/QuantitySelector"

// Full version with label and stock display
<QuantitySelector
  quantity={quantity}
  onQuantityChange={setQuantity}
  stock={product.stock}
/>

// Without label
<QuantitySelector
  quantity={quantity}
  onQuantityChange={setQuantity}
  stock={product.stock}
  showLabel={false}
/>

// Without stock display
<QuantitySelector
  quantity={quantity}
  onQuantityChange={setQuantity}
  stock={product.stock}
  showStock={false}
/>

//Compact version (no label, no stock text)
<QuantitySelectorCompact
  quantity={quantity}
  onQuantityChange={setQuantity}
  stock={product.stock}
/>
*/