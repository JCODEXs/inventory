/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { api } from "~/trpc/react";
import { motion, AnimatePresence } from "framer-motion";
import { InventoryQR } from "./InventoryQR";
import { sileo } from "sileo";

// =========================
// Types
// =========================
type Inventory = {
  id: string;
  name: string;
  description?: string | null;
  publicToken?: string | null;
};

// =========================
// Modal Wrapper Animado
// =========================
function ModalWrapper({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div 
      ref={overlayRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 bg-gray-500/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm border border-gray-100 overflow-hidden"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50">
          <h2 className="font-medium text-gray-700">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
}

// =========================
// Main Page
// =========================
export default function InventoriesPage() {
  const [open, setOpen] = useState(false);
const { data, isLoading, isError, error,  } = api.inventory.getAll.useQuery();

useEffect(() => {
  if (isLoading) {
    // Muestra el estado de carga (si tu librería sileo tiene un método para ello)
    sileo.info({ title: "Cargando inventario..." });
  } else if (isError) {
    sileo.error({ title: "Error al cargar", description: error.message });
  } else if (data) {
    sileo.success({ title: "Inventario cargado correctamente" });
  }
}, [isLoading, isError, data, error]);
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-10 min-h-screen bg-[#f9fafb]">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-4xl font-light tracking-tight text-gray-900">Mis Inventarios</h1>
          <p className="text-gray-500 text-sm">Gestiona y comparte tus listas de recursos.</p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-sm"
        >
          + Nuevo
        </button>
      </div>

      {/* List / Skeleton */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <InventoryList inventories={data ?? []} />
      )}

      {/* Modal con AnimatePresence */}
      <AnimatePresence>
        {open && (
          <ModalWrapper title="Crear Inventario" onClose={() => setOpen(false)}>
            <CreateInventoryContent onClose={() => setOpen(false)} />
          </ModalWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}

// =========================
// List Component
// =========================
function InventoryList({ inventories }: { inventories: Inventory[] }) {
  const utils = api.useUtils();
  const enablePublic = api.inventory.enablePublicAccess.useMutation({
    onSettled: () => utils.inventory.getAll.invalidate()
  });

  if (inventories.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl">
        <p className="text-sm text-gray-400 font-light">No tienes inventarios aún. Empieza creando uno.</p>
      </div>
    );
  }

  const realInventories = inventories.filter((inv) => !inv.id.startsWith("temp"));

  return (
    <div className="grid gap-4">
      {realInventories.map((inv) => (
        <div 
          key={inv.id}
          className="group bg-white border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all"
        >
          <Link href={`/inventory/${inv.id}`} className="flex-1 space-y-1">
            <h3 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">{inv.name}</h3>
            {inv.description && (
              <p className="text-sm text-gray-500 line-clamp-1 font-light">{inv.description}</p>
            )}
          </Link>

          <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-gray-50 pt-4 sm:pt-0 sm:pl-6">
           {inv?.publicToken ? (
  <InventoryQR token={inv.publicToken} />
) : (
              <button
                onClick={() => enablePublic.mutate({ id: inv.id })}
                className="text-xs text-gray-400 hover:text-blue-600 font-medium transition-colors"
              >
                Generar QR
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// =========================
// Content for Modal
// =========================
function CreateInventoryContent({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();
  const utils = api.useUtils();

  const create = api.inventory.create.useMutation({
    onSuccess: (data) => {
      router.push(`/inventory/${data.id}`);
    },
    onSettled: () => 

      utils.inventory.getAll.invalidate() 

    ,
  });

  const handleCreate = () => {
    if (!name.trim()) return;
    create.mutate({ name, description: description || undefined });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <input
          autoFocus
          placeholder="Nombre del inventario"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border-gray-100 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
        />
        <textarea
          placeholder="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border-gray-100 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all min-h-[100px] resize-none"
        />
      </div>

      <button
        onClick={handleCreate}
        disabled={create.isPending || !name.trim()}
        className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-all shadow-sm"
      >
        {create.isPending ? "Creando..." : "Crear Inventario"}
      </button>
    </div>
  );
}