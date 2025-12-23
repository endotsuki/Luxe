"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { IconCopy, IconBrandTelegram, IconBrandX } from "@tabler/icons-react"
import { useToast } from "@/hooks/use-toast"

interface ShareModalProps {
    url: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ShareModal({ url, open, onOpenChange }: ShareModalProps) {
    const { toast } = useToast()
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            toast({ title: "Copied", description: "Link copied to clipboard." })
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast({ title: "Error", description: "Failed to copy link.", variant: "destructive" })
        }
    }

    const encodedUrl = encodeURIComponent(url)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Share this product</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* URL + Copy */}
                    <div className="flex items-center space-x-2 border rounded-xl px-3 py-2">
                        <input
                            readOnly
                            className="flex-1 bg-transparent outline-none truncate"
                            value={url}
                            onFocus={e => e.target.select()}
                        />
                        <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy link">
                            <IconCopy className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Share buttons */}
                    <div className="flex space-x-4">
                        <a
                            href={`https://t.me/share/url?url=${encodedUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-blue-100/20"
                        >
                            <IconBrandTelegram className="w-5 h-5 text-blue-500" />
                            Telegram
                        </a>

                        <a
                            href={`https://twitter.com/intent/tweet?url=${encodedUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-blue-100/20"
                        >
                            <IconBrandX className="w-5 h-5 text-blue-600" />
                            X
                        </a>

                    </div>
                </div>

                <DialogClose asChild>
                    <Button variant="outline" className="mt-6 w-full">Close</Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    )
}
