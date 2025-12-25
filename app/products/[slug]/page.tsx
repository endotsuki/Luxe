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

  const productImageUrl = product.image_url
    ? `${process.env.NEXT_PUBLIC_SITE_URL || "https://luxe-roan-three.vercel.app"}/images/${product.image_url}`
    : `${process.env.NEXT_PUBLIC_SITE_URL || "https://luxe-roan-three.vercel.app"}/icon.svg`

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
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
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
