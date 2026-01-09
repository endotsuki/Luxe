import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border px-2 py-0.5',
  {
    variants: {
      variant: {
        default: 'bg-primary/20 text-primary-foreground border-primary/40 backdrop-blur-sm hover:bg-primary/30 hover:border-primary/60',
        destructive:
          'bg-destructive/20 text-destructive-foreground border-destructive/40 backdrop-blur-sm hover:bg-destructive/30 hover:border-destructive/60',
        outline: 'border-2 border-border/40 backdrop-blur-sm hover:bg-accent/10 hover:border-border/60',
        'in-active': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 backdrop-blur-sm hover:bg-yellow/30 hover:border-yellow/60',
        accent: 'bg-accent/20 text-accent-foreground border-accent/40 backdrop-blur-sm hover:bg-accent/30 hover:border-accent/60',
        secondary:
          'bg-secondary/20 text-secondary-foreground border-secondary/40 backdrop-blur-sm hover:bg-secondary/30 hover:border-secondary/60',
        ghost: 'border-transparent hover:bg-accent/10',
        discount: 'border-transparent bg-black text-white px-2 py-1 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return <Comp data-slot='badge' className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
