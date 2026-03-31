"use client"
type Item = {
  id: string;
  name: string;
  description?: string | null;
  areaId?: string | null;
  loans: Loan[];
  amount: number | null;
};

type Loan = {
  id: string;
  borrowerName: string;
  borrowerContact?: string | null;
  startDate: Date;
  returned: boolean;
};


import { useState } from "react";
import { InventoryQR } from "~/app/_components/InventoryQR"; 
import { motion, AnimatePresence } from "framer-motion";

export function ItemPublic({ item }: { item: Item  }) {
  const [showQR, setShowQR] = useState(false);
  const activeLoan = item.loans?.[0];
  const isLoaned = !!activeLoan;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="font-medium text-gray-800">{item.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-gray-50 px-2 py-0.5 rounded text-gray-500">
              {item.amount ?? 1} unidades
            </span>
            {isLoaned && (
              <span className="text-[10px] font-bold uppercase tracking-tight text-amber-500">
                Prestado a {activeLoan.borrowerName}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isLoaned ? "text-red-400" : "text-emerald-500"}`}>
            {isLoaned ? "No disponible" : "Disponible"}
          </span>
          
          <button 
            onClick={() => setShowQR(!showQR)}
            className="text-[10px] text-gray-400 hover:text-blue-600 transition-colors uppercase font-semibold tracking-tighter"
          >
            {showQR ? "Ocultar QR" : "Ver Código QR"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-6 flex justify-center border-t border-gray-50 mt-4">
              {/* Usamos el componente QR pasándole el ID del ítem o el token */}
              <InventoryQR token={item.id} /> 
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}