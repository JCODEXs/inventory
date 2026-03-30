import Link from "next/link";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f9fafb] text-[#1f2937]">
        <div className="container flex flex-col items-center justify-center gap-16 px-4 py-16">
          
          {/* Header con Estilo Minimalista */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-light tracking-tight text-gray-900 sm:text-6xl">
              Gestión de <span className="font-semibold text-blue-600">Inventario</span>
            </h1>
            <p className="text-gray-500 text-lg font-light">
              Limpio, eficiente y organizado.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 max-w-md w-full">
            {/* Ruta Protegida: Inventario */}
            {session ? (
              <Link
                className="group flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-blue-100"
                href="/inventory"
              >
                <h3 className="text-xl font-medium group-hover:text-blue-600 transition-colors">
                  Acceder al Inventario →
                </h3>
                <p className="text-gray-500 text-sm">
                  Gestiona tus productos, áreas y préstamos de forma centralizada.
                </p>
              </Link>
            ) : (
              <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 opacity-60">
                <h3 className="text-xl font-medium text-gray-400">
                  Inventario Bloqueado
                </h3>
                <p className="text-gray-400 text-sm">
                  Inicia sesión para visualizar y gestionar tus existencias.
                </p>
              </div>
            )}
          </div>

          {/* Sección de Autenticación */}
          <div className="flex flex-col items-center gap-6">
            {session && (
              <p className="text-sm font-light text-gray-600">
                Conectado como <span className="font-medium text-gray-900">{session.user?.name}</span>
              </p>
            )}
            
            <Link
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
              className="rounded-full border border-gray-200 bg-white px-12 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 shadow-sm"
            >
              {session ? "Cerrar sesión" : "Iniciar sesión"}
            </Link>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}