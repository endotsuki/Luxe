import Image from "next/image"
import { Label } from "@/components/ui/label"
import { sizedImage } from "@/lib/utils"

interface ImagePreviewProps {
  existingImages: string[]
  newImages: File[]
  onRemoveExisting: (index: number) => void
  onRemoveNew: (index: number) => void
  isPreviewMode?: boolean
}

export function ImagePreview({ existingImages, newImages, onRemoveExisting, onRemoveNew, isPreviewMode = false }: ImagePreviewProps) {
  return (
    <>
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <Label>Current Images</Label>
          <div className="grid grid-cols-4 gap-2">
            {existingImages.map((img, i) => (
              <div key={i} className="relative group w-full h-20 overflow-hidden rounded-md border">
                <Image src={sizedImage(img, 400)} alt={`Existing ${i}`} fill style={{ objectFit: "cover", imageOrientation: "from-image" }} className="rounded-md" />
                {!isPreviewMode && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-md flex items-center justify-center transition-opacity">
                    <button type="button" onClick={() => onRemoveExisting(i)} className="text-white text-xs bg-red-500/60 backdrop-blur-sm px-2 py-1 rounded-sm">Remove</button>
                  </div>
                )}
                {i === 0 && newImages.length === 0 && <div className="absolute top-1 left-1 bg-blue-500/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-sm">Main</div>}
              </div>
            ))}
          </div>
          {!isPreviewMode && <p className="text-xs text-muted-foreground">Click Remove to delete specific images.</p>}
        </div>
      )}

      {newImages.length > 0 && (
        <div className="space-y-2">
          <Label>New Images to Upload</Label>
          <div className="grid grid-cols-4 gap-2">
            {newImages.map((file, i) => (
              <div key={i} className="relative group w-full h-20 overflow-hidden rounded-md border">
                <Image src={URL.createObjectURL(file)} alt={`Preview ${i}`} fill style={{ objectFit: "cover" }} className="rounded-md" />
                {!isPreviewMode && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-md flex items-center justify-center transition-opacity">
                    <button type="button" onClick={() => onRemoveNew(i)} className="text-white text-xs bg-red-500/60 backdrop-blur-sm px-2 py-1 rounded">Remove</button>
                  </div>
                )}
                {i === 0 && existingImages.length === 0 && <div className="absolute top-1 left-1 bg-blue-500/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-sm">Main</div>}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">These images will be added to your product.</p>
        </div>
      )}
    </>
  )
}