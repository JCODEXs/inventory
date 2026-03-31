import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { Toaster } from "sileo";

export default async function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Si no hay sesión, mandamos al usuario al login de Auth.js
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/inventory");
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Aquí podrías añadir un Sidebar o Navbar minimalista solo para el inventario */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <span className="text-sm font-medium text-gray-500">Panel de Control</span>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">{session.user.email}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <Toaster position="top-center" />
        {children}
      </main>
    </div>
  );
}