import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartContent } from "@/components/cart-content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart | CCD Jewelry",
  description: "View your shopping cart",
};

export default function CartPage() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 pt-16">
          <div className="container mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
            <CartContent />
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
