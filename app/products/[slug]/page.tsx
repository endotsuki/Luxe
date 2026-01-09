import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductDetails } from "@/components/product-details";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  let productImageUrl: string;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://ccdjewelry.vercel.app/";

  if (product.image_url && !product.image_url.includes("placeholder")) {
    if (product.image_url.startsWith("http")) {
      productImageUrl = product.image_url;
    } else {
      const imageName = product.image_url.replace(
        /(_1080|_400|_48)?\.webp$/,
        "_1080.webp"
      );
      productImageUrl = `${siteUrl}/images/${imageName}`;
    }
  } else {
    productImageUrl = `${siteUrl}/icon.png`;
  }

  const fallbackImage = `${siteUrl}/icon.png`;

  return {
    title: `${product.name} | CCD Jewelry`,
    description: product.description || `Shop ${product.name} at CCD Jewelry`,
    openGraph: {
      title: product.name,
      description: product.description || `Shop ${product.name} at CCD Jewelry`,
      url: `${siteUrl}/products/${slug}`,
      type: "website",
      images: [
        {
          url: productImageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: product.name,
      description: product.description || `Shop ${product.name} at CCD Jewelry`,
      images: [productImageUrl],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .single();

  if (!product) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1  pt-16">
        <ProductDetails product={product} />
      </main>
      <SiteFooter />
    </>
  );
}
