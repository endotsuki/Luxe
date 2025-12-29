export async function fixImageOrientation(file: File): Promise<File> {
  if (!file.type || !file.type.startsWith("image/")) return file

  const arrayBuffer = await file.arrayBuffer()
  const view = new DataView(arrayBuffer)

  // Try to read EXIF orientation for JPEGs
  let orientation: number | null = null
  if (file.type.includes("jpeg") || file.type.includes("jpg")) {
    try {
      if (view.getUint16(0) === 0xffd8) {
        let offset = 2
        const length = view.byteLength
        while (offset < length) {
          const marker = view.getUint16(offset)
          offset += 2
          if (marker === 0xffe1) {
            const app1Length = view.getUint16(offset)
            offset += 2
            const exifHeader = readString(view, offset, 4)
            if (exifHeader === "Exif") {
              const little = view.getUint16(offset + 6) === 0x4949
              const tiffOffset = offset + 6
              const firstIFD = getUint32(view, tiffOffset + 4, little)
              const entries = getUint16(view, tiffOffset + firstIFD, little)
              for (let i = 0; i < entries; i++) {
                const entryOffset = tiffOffset + firstIFD + 2 + i * 12
                const tag = getUint16(view, entryOffset, little)
                if (tag === 0x0112) {
                  orientation = getUint16(view, entryOffset + 8, little)
                  break
                }
              }
            }
            break
          } else if ((marker & 0xff00) !== 0xff00) {
            break
          } else {
            const size = view.getUint16(offset)
            offset += size
          }
        }
      }
    } catch {
      // If EXIF parsing fails for any reason, we'll fall back to re-encoding without transforms
      orientation = null
    }
  }

  // Re-encode via canvas to strip metadata and apply orientation when needed
  const dataUrl = await blobToDataURL(new Blob([arrayBuffer], { type: file.type }))
  const img = await loadImage(dataUrl)

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!

  let width = img.naturalWidth
  let height = img.naturalHeight

  if (orientation && orientation > 4) {
    canvas.width = height
    canvas.height = width
  } else {
    canvas.width = width
    canvas.height = height
  }

  if (orientation && orientation !== 1) {
    switch (orientation) {
      case 2:
        ctx.translate(width, 0)
        ctx.scale(-1, 1)
        break
      case 3:
        ctx.translate(width, height)
        ctx.rotate(Math.PI)
        break
      case 4:
        ctx.translate(0, height)
        ctx.scale(1, -1)
        break
      case 5:
        ctx.rotate(0.5 * Math.PI)
        ctx.scale(1, -1)
        break
      case 6:
        ctx.rotate(0.5 * Math.PI)
        ctx.translate(0, -height)
        break
      case 7:
        ctx.rotate(0.5 * Math.PI)
        ctx.translate(width, -height)
        ctx.scale(-1, 1)
        break
      case 8:
        ctx.rotate(-0.5 * Math.PI)
        ctx.translate(-width, 0)
        break
    }
  }

  ctx.drawImage(img, 0, 0)

  // Some browsers/devices produce HEIC which canvas can't output; fallback to JPEG.
  const outType = file.type === "image/heic" ? "image/jpeg" : file.type
  const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, outType))
  if (!blob) return file

  return new File([blob], file.name, { type: outType })
}

function readString(view: DataView, start: number, length: number) {
  let out = ""
  for (let i = 0; i < length; i++) out += String.fromCharCode(view.getUint8(start + i))
  return out
}

function getUint16(view: DataView, offset: number, little: boolean) {
  return little ? view.getUint16(offset, true) : view.getUint16(offset, false)
}

function getUint32(view: DataView, offset: number, little: boolean) {
  return little ? view.getUint32(offset, true) : view.getUint32(offset, false)
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.onload = () => res(reader.result as string)
    reader.onerror = rej
    reader.readAsDataURL(blob)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = rej
    img.src = src
  })
}
