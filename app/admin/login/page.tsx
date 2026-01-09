import { AdminLoginForm } from "@/components/admin-login-form";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login | CCD Jewelry",
  description: "Sign in to the admin dashboard",
};

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-svh items-center justify-center p-6 md:p-10">
      <BackgroundRippleEffect />
      <div className="w-full max-w-sm z-10">
        <AdminLoginForm />
      </div>
    </div>
  );
}
