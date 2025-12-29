import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabase } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: rows, error } = await supabase
      .from("slideshow")
      .select("product_id, position")
      .order("position", { ascending: true });

    if (error) {
      // If table doesn't exist yet, return empty list instead of 500 to avoid breaking clients
      const msg = String(error.message || "").toLowerCase();
      if (msg.includes("does not exist") || msg.includes("could not find the table")) {
        return NextResponse.json({ products: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const ids = rows?.map((r: any) => r.product_id) || [];
    if (ids.length === 0) return NextResponse.json({ products: [] });

    const { data: products, error: pErr } = await supabase
      .from("products")
      .select("*")
      .in("id", ids)
      .eq("is_active", true);

    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

    const byId = new Map((products || []).map((p: any) => [p.id, p]));
    const ordered = ids.map((id: string) => byId.get(id)).filter(Boolean);

    return NextResponse.json({ products: ordered });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId } = body;
    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

    // prefer using a server-side service role key for write operations to bypass RLS
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const admin = serviceKey && process.env.NEXT_PUBLIC_SUPABASE_URL
      ? createSupabase(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey)
      : null;
    const supabase = admin ?? (await createClient());

    // avoid duplicates: check whether already present
    const { data: exists } = await supabase.from("slideshow").select("id").eq("product_id", productId).limit(1);
    if (exists && exists.length > 0) return NextResponse.json({ success: true });

    // compute next position
    const { data: maxRow } = await supabase
      .from("slideshow")
      .select("position")
      .order("position", { ascending: false })
      .limit(1);

    const nextPos = (maxRow && maxRow[0] && (maxRow[0].position ?? 0) + 1) || 0;

    const { error } = await supabase.from("slideshow").insert({ product_id: productId, position: nextPos });
    if (error) {
      const msg = String(error.message || "").toLowerCase();
      if (msg.includes("does not exist") || msg.includes("could not find the table")) {
        return NextResponse.json({ error: "slideshow table not found; run migration scripts/005_create_slideshow_table.sql" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("productId");
    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

    // use service role client when possible for delete
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const admin = serviceKey && process.env.NEXT_PUBLIC_SUPABASE_URL
      ? createSupabase(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey)
      : null;
    const supabase = admin ?? (await createClient());

    const { error } = await supabase.from("slideshow").delete().eq("product_id", productId);
    if (error) {
      if (String(error.message).toLowerCase().includes("does not exist")) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
