import { Button } from '@/components/ui/button';
import { IconSend, IconShoppingBag } from '@tabler/icons-react';

interface ModeToggleButtonsProps {
  cartItemsLength: number;
  orderMode: boolean;
  loading: boolean;
  onSetOrderMode: (mode: boolean) => void;
  onLoadCartItems: () => void;
}

export function ModeToggleButtons({ cartItemsLength, orderMode, loading, onSetOrderMode, onLoadCartItems }: ModeToggleButtonsProps) {
  return (
    <div className='mb-8 flex flex-wrap justify-center gap-4'>
      {cartItemsLength > 0 ? (
        <>
          <Button variant={orderMode ? 'on-hold' : 'archived'} onClick={() => onSetOrderMode(true)}>
            <IconShoppingBag className='mr-2' />
            Place Order ({cartItemsLength} items)
          </Button>
          <Button variant={!orderMode ? 'on-hold' : 'archived'} onClick={() => onSetOrderMode(false)}>
            <IconSend className='mr-2' />
            Send Message
          </Button>
        </>
      ) : (
        <>
          <Button variant='outline' onClick={onLoadCartItems} disabled={loading}>
            <IconShoppingBag className='mr-2 h-4 w-4' />
            {loading ? 'Loading Cart...' : 'Load Cart to Order'}
          </Button>
          <Button variant='default' onClick={() => onSetOrderMode(false)}>
            <IconSend className='mr-2 h-4 w-4' />
            Send Message
          </Button>
        </>
      )}
    </div>
  );
}
