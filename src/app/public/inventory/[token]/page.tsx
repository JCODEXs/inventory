/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { db } from "~/server/db";

export default async function PublicInventoryPage({
  params,
}: {
  params: Promise<{ token: string }> ;
}) {
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
      <div className="p-10 text-center">
        Inventario no encontrado
      </div>
    );
  }

  // agrupar por área
  const grouped: Record<string, any[]> = {};

  inventory.areas.forEach((a) => {
    grouped[a.id] = [];
  });

  grouped["no-area"] = [];

  inventory.items.forEach((item) => {
    if (item.areaId && grouped[item.areaId]) {
      grouped?.[item.areaId]?.push(item);
    } else {
      grouped?.["no-area"]?.push(item);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">
          {inventory.name}
        </h1>

        {inventory.areas.map((area) => (
          <div key={area.id}>
            <h2 className="text-sm text-gray-500 mb-2">
              {area.name}
            </h2>

            <div className="space-y-2">
              {grouped?.[area.id]?.map((item) => (
                <ItemPublic key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}

        {/* Sin área */}
        {grouped["no-area"].length > 0 && (
          <div>
            <h2 className="text-sm text-gray-500 mb-2">
              Otros
            </h2>

            <div className="space-y-2">
              {grouped["no-area"].map((item) => (
                <ItemPublic key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemPublic({ item }: any) {
  const activeLoan = item.loans?.[0];

  return (
    <div className="bg-white rounded p-4 border flex justify-between">
      <div>
        <p className="font-medium">{item.name}</p>

        {activeLoan && (
          <p className="text-xs text-red-500">
            Prestado a {activeLoan.borrowerName}
          </p>
        )}
      </div>

      <span
        className={`text-xs ${
          activeLoan ? "text-red-500" : "text-green-500"
        }`}
      >
        {activeLoan ? "Prestado" : "Disponible"}
      </span>
    </div>
  );
}