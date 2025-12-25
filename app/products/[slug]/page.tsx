import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProductDetails } from "@/components/product-details"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase.from("products").select("*").eq("slug", slug).single()

  if (!product) {
    return {
      title: "Product Not Found",
    }
  }

  let productImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://luxe-roan-three.vercel.app"}/icon.svg`
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://luxe-roan-three.vercel.app"

  if (product.image_url && !product.image_url.includes("placeholder")) {
    // Images uploaded to Supabase Storage use this format
    if (product.image_url.startsWith("http")) {
      productImageUrl = product.image_url
    } else {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
      productImageUrl = `${supabaseUrl}/storage/v1/object/public/images/${product.image_url}`
    }
  }

  const imageExt = productImageUrl.split("?")[0].split(".").pop()?.toLowerCase() || ""
  const imageType = imageExt === "webp" ? "image/webp" : imageExt === "png" ? "image/png" : imageExt === "jpg" || imageExt === "jpeg" ? "image/jpeg" : "image/*"

  const fallbackImage = `${siteUrl}/icon.png`

  return {
    title: `${product.name} | LuxeAccessories`,
    description: product.description || `Shop ${product.name} at LuxeAccessories`,
    openGraph: {
      title: product.name,
      description: product.description || `Shop ${product.name} at LuxeAccessories`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://luxe-roan-three.vercel.app"}/products/${slug}`,
      type: "website",
      images: [
        {
          url: productImageUrl,
          alt: product.name,
          type: imageType,
        },
        {
          url: fallbackImage,
          width: 1200,
          height: 630,
          alt: "LuxeAccessories Logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description || `Shop ${product.name} at LuxeAccessories`,
      images: [productImageUrl, fallbackImage],
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .single()

  if (!product) {
    notFound()
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1  pt-16">
        <ProductDetails product={product} />
      </main>
      <SiteFooter />
    </>
  )
}
