import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CheckoutForm } from "@/components/checkout-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | CCD Jewelry",
  description: "Complete your order",
};

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Checkout</h1>
          <CheckoutForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
