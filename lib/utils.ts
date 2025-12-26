import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sizedImage(path: string | null | undefined, size: 1080 | 400 | 48) {
  if (!path) return "/placeholder.svg";
  // If path already looks like an absolute or placeholder URL, return as-is
  if (path.startsWith("/") || path.startsWith("http://") || path.startsWith("https://")) return path;

  // Expect filenames like: <id>.webp or <id>_1080.webp
  const m = path.match(/^(.+?)(?:_(1080|400|48))?(\.webp)$/i);
  if (m) {
    const base = m[1];
    return `/images/${base}_${size}.webp`;
  }

  // Fallback to original
  return `/images/${path}`;
}
