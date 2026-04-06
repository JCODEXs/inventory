/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
"use client";

import { useState, useRef } from "react";
import { api } from "~/trpc/react";
import {sileo} from "sileo";
import { motion, AnimatePresence } from "framer-motion";

// =========================
// Types (Mantenidos igual)
// =========================
type Loan = { id: string; borrowerName: string; borrowerContact?: string | null; startDate: Date; returned: boolean; };
type Area = { id: string; name: string; createdAt?: Date; inventoryId?: string; };
type ItemRaw = { id: string; name: string; description?: string | null; areaId?: string | null; loans: Loan[]; amount: number | null; price:number|null ; providerName: string|null; providerNumber: string|null ; };
type ItemVM = { id: string; name: string; description?: string | null; isLoaned: boolean; activeLoan?: Loan; statusLabel: "Disponible" | "Prestado"; areaId: string | null; amount: number; price:number|null; providerName: string|null; providerNumber: string|null ; };

// =========================
// Mapper (Mantenido igual)
// =========================
function mapItemToVM(item: ItemRaw): ItemVM {
  const activeLoan = item.loans.find((l) => !l.returned);
  return { id: item.id, name: item.name, description: item.description, areaId: item.areaId ?? null, isLoaned: !!activeLoan, activeLoan, statusLabel: activeLoan ? "Prestado" : "Disponible", amount: item.amount ?? 1, price:item.price, providerName:item.providerName, providerNumber:item.providerNumber  };
}

// =========================
// 2. MODAL WRAPPER ANIMADO
// =========================
function ModalWrapper({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Definimos las variantes de animación para reutilizar
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 }, // Empieza un poco más abajo y más pequeño
    visible: { 
      opacity: 1, 
     
    },
    exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } }, // Salida más rápida y sutil
   
    transition: { type: "spring", stiffness: 300, damping: 30 } // Animación tipo resorte suave
  };

  return (
    // Reemplazamos <div> por <motion.div> para el fondo (backdrop)
    <motion.div 
      ref={overlayRef}
      key="backdrop" // Importante para AnimatePresence
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      {/* Reemplazamos <div> por <motion.div> para el contenido del modal */}
      <motion.div 
        key="modal-content" // Importante para AnimatePresence
        variants={modalVariants}
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
// Main Page (Actualizada para AnimatePresence)
// =========================
export default function InventoryPage({ inventoryId }: { inventoryId: string }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "available" | "loaned">("all");

  const [createOpen, setCreateOpen] = useState(false);
  const [loanItemId, setLoanItemId] = useState<string | null>(null);
  const [openAreaModal, setOpenAreaModal] = useState(false);

  const { data: itemsData } = api.item.getByInventory.useQuery({ inventoryId });
  const { data: areasData } = api.area.getByInventory.useQuery({ inventoryId });

  const areas = areasData ?? [];
  const items = (itemsData ?? []).map(mapItemToVM);

  // Lógica de Filtrado combinada (Mantenida igual)
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" ? true : filter === "available" ? !item.isLoaned : item.isLoaned;
    return matchesSearch && matchesFilter;
  });

  // Agrupación de los items filtrados (Mantenida igual)
  const grouped: Record<string, ItemVM[]> = { "no-area": [] };
  areas.forEach(a => grouped[a.id] = []);
  filteredItems.forEach(item => {
    if (item.areaId && grouped[item.areaId]) grouped[item.areaId]!.push(item);
    else grouped["no-area"]!.push(item);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 bg-[#f9fafb] min-h-screen">
      {/* Header & Controls (Mantenidos igual) */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">Inventario</h1>
          <div className="flex gap-2">
            <button onClick={() => setCreateOpen(true)} className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-sm">+ Item</button>
            <button onClick={() => setOpenAreaModal(true)} className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 transition-all shadow-sm">+ Área</button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre..." className="flex-1 px-4 py-2.5 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400 text-sm shadow-sm" />
          <select value={filter} onChange={(e) => setFilter(e.target.value as "all" | "available" | "loaned")} className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-600 shadow-sm">
            <option value="all">Todos los estados</option>
            <option value="available">Solo Disponibles</option>
            <option value="loaned">Solo Prestados</option>
          </select>
        </div>
      </div>

      {/* Grid de Áreas (Mantenido igual) */}
      <div className="grid gap-10">
        {areas.map((area) => (
          <AreaSection key={area.id} title={area.name} items={grouped[area.id] ?? []} onLoan={setLoanItemId} />
        ))}
        {grouped["no-area"]!.length > 0 && (
          <AreaSection title="General / Sin Área" items={grouped["no-area"]!} onLoan={setLoanItemId} />
        )}
      </div>

      {/* 3. ENVOLVER MODALES CON ANIMATEPRESENCE */}
      <AnimatePresence>
        {createOpen && (
          <ModalWrapper title="Nuevo Item" onClose={() => setCreateOpen(false)}>
            <CreateItemContent inventoryId={inventoryId} areas={areas} onClose={() => setCreateOpen(false)} />
          </ModalWrapper>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {openAreaModal && (
          <ModalWrapper title="Nueva Área" onClose={() => setOpenAreaModal(false)}>
            <CreateAreaContent inventoryId={inventoryId} onClose={() => setOpenAreaModal(false)} />
          </ModalWrapper>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {loanItemId && (
          <ModalWrapper title="Registrar Préstamo" onClose={() => setLoanItemId(null)}>
            <LoanContent itemId={loanItemId} onClose={() => setLoanItemId(null)} inventoryId={inventoryId} />
          </ModalWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}

// =========================
// Componentes de UI y Contenidos (Mantenidos igual)
// =========================
function AreaSection({ title, items, onLoan }: { title: string; items: ItemVM[]; onLoan: (id: string) => void }) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (<ItemCard key={item.id} item={item} onLoan={onLoan} />))}
      </div>
    </section>
  );
}
sileo.info({ title: "Cargando inventario..." });


// sileo.error({
//   title: "Something went wrong",
//   description: "Please try again later.",
// });

// sileo.warning({ title: "Storage almost full" });

// sileo.info({ title: "New update available" });

function ItemCard({ item, onLoan }: { item: ItemVM; onLoan: (id: string) => void }) {
  const utils = api.useUtils();
  const deleteItem = api.item.delete.useMutation({ onSettled: () => utils.item.getByInventory.invalidate(), });
  const returnMutation = api.loan.returnItem.useMutation({ onSettled: () => utils.item.getByInventory.invalidate(), });

  
  return (
    <div className="bg-white border border-gray-100 p-5 rounded-2xl flex justify-between items-center shadow-sm hover:shadow-md transition-shadow group">
      <div className="space-y-1">
        <p className="font-medium text-gray-800">{item.name}</p>
        <div className="flex items-center gap-2">
         { item?.price && <span className="text-xs bg-gray-50 px-2 py-0.5 rounded text-gray-500"> $ {item?.price} </span>}
          <span className="text-xs bg-gray-50 px-2 py-0.5 rounded text-gray-500">{item.amount} und</span>
          {item.isLoaned && (<span className="text-xs text-blue-500 font-medium">👤 {item.activeLoan?.borrowerName}</span>)}
        </div>
        <div className="flex flex-col items-start gap-2 m-2">
         {item.providerName &&<span className="text-xs">Proveedor</span>}
          {item.providerName && (<span className="text-xs text-blue-500 font-medium">👤 {item.providerName} {item?.providerNumber}</span>)}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-tighter ${item.isLoaned ? "text-amber-500" : "text-emerald-500"}`}>{item.statusLabel}</span>
        {item.isLoaned ? (
          <button onClick={() => { sileo.success({ title: "Item Devuelto" }); returnMutation.mutate({ loanId: item.activeLoan!.id })}} className="text-xs text-red-500 hover:underline font-medium">Devolver</button>
        ) : (
          <button onClick={() => { sileo.success({ title: "Item Prestado" }); onLoan(item.id)}} className="text-xs text-blue-600 hover:underline font-medium">Prestar</button>
        )}

        <button onClick={() => {sileo.success({ title: "Item Eliminado" }); deleteItem.mutate({ itemId: item.id })}} className="text-xs text-red-500 hover:underline font-medium">Eliminar</button>
      </div>
    </div>
  );
}

function CreateItemContent({ inventoryId, areas, onClose }: { inventoryId: string, areas: Area[], onClose: () => void }) {
  const [name, setName] = useState(""); const [areaId, setAreaId] = useState(""); const [amount, setAmount] = useState(1); const utils = api.useUtils();
  const [price,setPrice]=useState(1)
  const [providerName,setProviderName]=useState("")
  const [providerNumber,setProviderNumber]=useState("")
  const create = api.item.create.useMutation({ onSettled: () => { utils.item.getByInventory.invalidate(); } });

  const handleSubmit = () => {
    
    sileo.success({ title: "Item Creado" });
    create.mutate({ name, inventoryId, areaId: areaId || undefined, amount, price, providerName, providerNumber  });
    onClose();
  };

  return (
    <div className="space-y-4">
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del objeto" className="w-full border-gray-100 border p-3 rounded-xl text-sm" />
      <span> Cantidad </span>
     
      <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} placeholder="Cantidad" className="w-full border-gray-100 border p-3 rounded-xl text-sm" />
     <span> Precio</span>
      <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="Precio" className="w-full border-gray-100 border p-3 rounded-xl text-sm" />
      <input type="text" value={providerName} onChange={(e) => setProviderName(e.target.value)} placeholder="Proveedor" className="w-full border-gray-100 border p-3 rounded-xl text-sm" />
      <input type="text" value={providerNumber} onChange={(e) => setProviderNumber(e.target.value)} placeholder="Telefono Proveedor" className="w-full border-gray-100 border p-3 rounded-xl text-sm" />
      <select value={areaId} onChange={(e) => setAreaId(e.target.value)} className="w-full border-gray-100 border p-3 rounded-xl text-sm text-gray-500">
        <option value="">Sin área específica</option>
        {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      <button onClick={handleSubmit} className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">Guardar Item</button>
    </div>
  );
}

function CreateAreaContent({ inventoryId, onClose }: { inventoryId: string, onClose: () => void }) {
  const [name, setName] = useState(""); const utils = api.useUtils();
  const create = api.area.create.useMutation({ onSettled: () => { utils.area.getByInventory.invalidate();} });
  const handleSubmit = () => {
    sileo.success({ title: "Área Creada" });
    create.mutate({ name, inventoryId });
    onClose();
  };
  return (
    <div className="space-y-4">
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Oficina, Almacén..." className="w-full border-gray-100 border p-3 rounded-xl text-sm" />
      <button onClick={handleSubmit} className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium">Crear Área</button>
    </div>
  );
}

function LoanContent({ itemId, onClose, inventoryId }: { itemId: string, onClose: () => void, inventoryId: string }) {
  const [name, setName] = useState(""); const utils = api.useUtils();
  const loan = api.loan.create.useMutation({ onSettled: () => { utils.item.getByInventory.invalidate() } });
  const handleSubmit = () => {
    loan.mutate({ itemId, borrowerName: name });
    sileo.success({ title: "Item Prestado" });
    onClose();
  };
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">Indica quién se lleva este recurso.</p>
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del responsable" className="w-full border-gray-100 border p-3 rounded-xl text-sm" />
      <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium">Confirmar Préstamo</button>
    </div>
  );
}