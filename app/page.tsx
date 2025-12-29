import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { ProductRow } from "@/components/ProductRow";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  // Load slideshow products from slideshow table (preserves admin selection)
  const { data: slideshowRows } = await supabase
    .from("slideshow")
    .select("product_id, position")
    .order("position", { ascending: true });

  let slideshowProducts = [];
  const ids = (slideshowRows || []).map((r: any) => r.product_id);
  if (ids.length > 0) {
    const { data: productsById } = await supabase
      .from("products")
      .select("*")
      .in("id", ids)
      .eq("is_active", true);

    const byId = new Map((productsById || []).map((p: any) => [p.id, p]));
    slideshowProducts = ids.map((id: string) => byId.get(id)).filter(Boolean);
  }

  const { data: featured } = await supabase
    .from("products")
    .select("*")
    .eq("is_featured", true)
    .eq("is_active", true);

  const { data: trending } = await supabase
    .from("products")
    .select("*")
    .eq("is_trending", true)
    .eq("is_active", true);

  const { data: newArrivals } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const { data: forYou } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .limit(10);

  const { data: discountedRaw } = await supabase
    .from("products")
    .select("*")
    .not("compare_at_price", "is", null)
    .eq("is_active", true);

  const discounted = discountedRaw || [];

  return (
    <>
      <SiteHeader />
      <main>
        <HeroSlideshow products={slideshowProducts || []} />

        <ProductRow title="New Arrivals" products={newArrivals} />
        <ProductRow title="For You" products={forYou} />
        <ProductRow title="Featured Products" products={featured} />
        <ProductRow title="Discount" products={discounted} />
        <ProductRow title="Trending Now" products={trending} />
      </main>
      <SiteFooter />
    </>
  );
}
