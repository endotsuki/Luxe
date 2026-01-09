import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";
import { Metadata } from "next";
import { sizedImage } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Categories | CCD Jewelry",
  description: "Browse our product categories",
};

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*");

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Shop by Category
            </h1>
            <p className="text-muted-foreground">
              Explore our curated collections
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories?.map((category: Category) => (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                  <CardContent className="p-0">
                    <div className="relative aspect-4/3 overflow-hidden">
                      <Image
                        src={
                          category.image_url
                            ? sizedImage(category.image_url, 400)
                            : "/placeholder.svg"
                        }
                        alt={category.name}
                        fill
                        priority
                        loading="eager"
                        style={{ objectFit: "cover" }}
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end p-6">
                        <div>
                          <h2 className="text-white text-2xl font-bold mb-2">
                            {category.name}
                          </h2>
                          <p className="text-white/90 text-sm">
                            {category.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
