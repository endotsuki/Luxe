import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sizedImage(path: string | null | undefined, size: 1080 | 400 | 48) {
  if (!path) return "/placeholder.svg";
  // If path is an absolute http(s) URL, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // If path is a local path under /images, treat it as a stored filename
  // and map to Supabase public URL when available. This handles migrated
  // products that still reference /images/... but now live in Supabase Storage.
  if (path.startsWith("/images/")) {
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "product-images";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Extract filename from /images/<base>_SIZE.webp or /images/<filename>.webp
    const mLocal = path.match(/\/images\/(.+?)(?:_(1080|400|48))?(\.webp)$/i);
    if (mLocal) {
      const base = mLocal[1];
      if (supabaseUrl) {
        return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${base}.webp`;
      }
      return `/images/${base}_${size}.webp`;
    }

    // If it doesn't match expected pattern, return as-is
    return path;
  }

  // If path is a stored filename like: <id>.webp or <id>_1080.webp,
  // prefer returning a Supabase public URL when possible so images load
  // even after migrating to Supabase Storage.
  const m = path.match(/^(.+?)(?:_(1080|400|48))?(\.webp)$/i);
  if (m) {
    const base = m[1];
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "product-images";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (supabaseUrl) {
      // Use the public object URL pattern for Supabase Storage
      return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${base}.webp`;
    }

    // Fallback to the old local /images path if no SUPABASE URL is provided
    return `/images/${base}_${size}.webp`;
  }

  // Fallback to original
  return `/images/${path}`;
}
