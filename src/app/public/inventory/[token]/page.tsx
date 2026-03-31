/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/app/public/inventory/[token]/page.tsx
import { db } from "~/server/db";
import { ItemPublic } from "~/app/_components/ItemPublic";

interface PublicPageProps {
  params: Promise<{ token: string }>;
}


export default async function PublicInventoryPage({ params }: PublicPageProps) {
  const { token } = await params;

  const inventory = await db.inventory.findFirst({
    where: { publicToken: token },
    include: {
      areas: true,
      items: {
        include: {
          loans: {
            where: { returned: false },
          },
        },
      },
    },
  });

  if (!inventory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-light text-gray-400">404</h1>
          <p className="text-sm text-gray-500">Este inventario ya no es público o no existe.</p>
        </div>
      </div>
    );
  }

  // Agrupación lógica
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const grouped: Record<string, any[]> = { "no-area": [] };
  inventory.areas.forEach((a) => (grouped[a.id] = []));
  
  inventory.items.forEach((item) => {
    if (item.areaId && grouped[item.areaId]) {
      grouped[item.areaId]!.push(item);
    } else {
      grouped["no-area"]!.push(item);
    }
  });

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#1f2937] pb-20">
      {/* Header Público */}
      <header className="bg-white border-b border-gray-100 py-10 px-6 mb-12">
        <div className="max-w-3xl mx-auto space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
            Inventario Público
          </span>
          <h1 className="text-4xl font-light tracking-tight text-gray-900">
            {inventory.name}
          </h1>
          <p className="text-sm text-gray-500 font-light max-w-md">
            Consulta la disponibilidad de los recursos en tiempo real.
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 space-y-16">
        {/* Renderizado de Áreas */}
        {inventory.areas.map((area) => (
          grouped[area.id]!.length > 0 && (
            <section key={area.id} className="space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">
                {area.name}
              </h2>
              <div className="grid gap-4">
                {grouped[area.id]!.map((item) => (
                  <ItemPublic key={item.id} item={item} />
                ))}
              </div>
            </section>
          )
        ))}

        {/* Sección General */}
        {grouped["no-area"]!.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">
              General / Sin área
            </h2>
            <div className="grid gap-4">
              {grouped["no-area"]!.map((item) => (
                <ItemPublic key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="mt-20 text-center">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
          Powered by Your Inventory App
        </p>
      </footer>
    </div>
  );
}

