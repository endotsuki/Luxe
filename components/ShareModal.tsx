'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { IconCopy } from '@tabler/icons-react';
import { useToast } from '@/hooks/use-toast';
import { Icon } from 'iconza';
interface ShareModalProps {
  url: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareModal({ url, open, onOpenChange }: ShareModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: 'Copied', description: 'Link copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Error', description: 'Failed to copy link.', variant: 'destructive' });
    }
  };

  const encodedUrl = encodeURIComponent(url);

  const shareButtons = [
    { name: 'Telegram', url: `https://t.me/share/url?url=${encodedUrl}`, label: 'Share on Telegram', icon: 'Telegram' },
    { name: 'X', url: `https://twitter.com/intent/tweet?url=${encodedUrl}`, label: 'Share on X', icon: 'X Light' },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      label: 'Share on Facebook',
      icon: 'FacebookRound',
    },
    { name: 'Messenger', url: `https://www.messenger.com/t/?link=${encodedUrl}`, label: 'Share on Messenger', icon: 'MessengerColor' },
    { name: 'WhatsApp', url: `https://api.whatsapp.com/send?text=${encodedUrl}`, label: 'Share on WhatsApp', icon: 'WhatsApp' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-sm'>
        <DialogHeader>
          <DialogTitle>Share this product</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Share buttons */}
          <div className='flex space-x-6'>
            {shareButtons.map((button) => (
              <a
                key={button.name}
                href={button.url}
                target='_blank'
                rel='noopener noreferrer'
                aria-label={button.label}
                className='inline-flex items-center justify-center transition-transform duration-200 hover:scale-90'
              >
                <Icon name={button.icon} size={30} />
              </a>
            ))}
          </div>
          {/* URL + Copy */}
          <div className='flex items-center space-x-2 border-b px-3 py-1'>
            <input readOnly className='flex-1 truncate bg-transparent outline-none' value={url} onFocus={(e) => e.target.select()} />
            <Button variant='outline' size='icon' onClick={handleCopy} title='Copy link'>
              <IconCopy className='h-5 w-5' />
            </Button>
          </div>
        </div>

        <DialogClose asChild>
          <Button variant='outline' className='mt-6 w-full'>
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
