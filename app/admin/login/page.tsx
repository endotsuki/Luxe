import { AdminLoginForm } from "@/components/admin-login-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Login | LuxeAccessories",
  description: "Sign in to the admin dashboard",
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6 md:p-10 bg-muted/30">
      <div className="w-full max-w-sm">
        <AdminLoginForm />
      </div>
    </div>
  )
}
