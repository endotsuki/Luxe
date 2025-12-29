import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProductDetails } from "@/components/product-details"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import fs from "fs"
import path from "path"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase.from("products").select("*").eq("slug", slug).single()

  if (!product) {
    return {
      title: "Product Not Found",
    }
  }

  // let productImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://luxe-roan-three.vercel.app"}/icon.png`
  let productImageUrl: string;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://luxe-roan-three.vercel.app"

  // In your generateMetadata function, simplify the logic:

  if (product.image_url && !product.image_url.includes("placeholder")) {
    if (product.image_url.startsWith("http")) {
      // External URL
      productImageUrl = product.image_url;
    } else {
      // Local image - use the _1080 variant
      const imageName = product.image_url.replace(/(_1080|_400|_48)?\.webp$/, "_1080.webp");
      productImageUrl = `${siteUrl}/images/${imageName}`;
    }
  } else {
    productImageUrl = `${siteUrl}/icon.png`;
  }

  const fallbackImage = `${siteUrl}/icon.png`

  return {
    title: `${product.name} | LuxeAccessories`,
    description: product.description || `Shop ${product.name} at LuxeAccessories`,
    openGraph: {
      title: product.name,
      description: product.description || `Shop ${product.name} at LuxeAccessories`,
      url: `${siteUrl}/products/${slug}`,
      type: "website",
      images: [
        {
          url: productImageUrl,
          width: 1200,
          height: 630, // Changed from 1200 - better aspect ratio for OG
          alt: product.name,
          // Remove type: "image/webp" - let the platform detect it
        },
      ],
    },
    twitter: {
      card: "summary_large_image", // Changed from "summary" for better image display
      title: product.name,
      description: product.description || `Shop ${product.name} at LuxeAccessories`,
      images: [productImageUrl],
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
