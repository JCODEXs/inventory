"use client";

import { motion } from "framer-motion";
import { 
  PlusCircle, 
  LayoutGrid, 
  QrCode, 
  Share2, 
  ArrowRightLeft, 
  Code2 
} from "lucide-react";

export default function UserGuide() {
  const steps = [
    {
      title: "Estructura",
      desc: "Crea un inventario y divídelo en áreas (Oficina, Taller, Almacén) para mantener el orden visual.",
      icon: <LayoutGrid className="w-5 h-5 text-blue-600" />,
    },
    {
      title: "Gestión de Items",
      desc: "Añade artículos con stock, descripción y fotos. Todo queda centralizado y rastreable.",
      icon: <PlusCircle className="w-5 h-5 text-blue-600" />,
    },
    {
      title: "Préstamos",
      desc: "Registra salidas con un clic. Sabrás quién tiene cada objeto y cuándo debe volver.",
      icon: <ArrowRightLeft className="w-5 h-5 text-blue-600" />,
    },
    {
      title: "Acceso Público",
      desc: "Genera un token y obtén un QR. Otros podrán ver la disponibilidad sin necesidad de login.",
      icon: <QrCode className="w-5 h-5 text-blue-600" />,
    },
  ];

  return (
    <section className="py-12 space-y-10">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <h2 className="text-2xl font-light tracking-tight text-gray-900">
          Cómo funciona tu inventario
        </h2>
        <p className="text-sm text-gray-500 font-light">
          Cuatro pasos para dominar el control total de tus recursos.
        </p>
      </div>

      {/* Grid de Pasos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="w-10 h-10 mb-4 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              {step.icon}
            </div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">{step.title}</h3>
            <p className="text-xs leading-relaxed text-gray-500 font-light">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* API Section - Technical Highlight */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-8 bg-gray-900 rounded-[2rem] p-8 text-white overflow-hidden relative"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-2 text-blue-400">
              <Code2 className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Developer API</span>
            </div>
            <h3 className="text-xl font-light tracking-tight">Conecta tus propias apps</h3>
            <p className="text-sm text-gray-400 font-light leading-relaxed">
              Consume tus inventarios públicos mediante nuestra API REST. Ideal para integrar en sitios web externos, dashboards o sistemas ERP.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 font-mono text-[11px] text-blue-300 w-full md:w-auto">
            <div className="flex gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500/50" />
              <div className="w-2 h-2 rounded-full bg-amber-500/50" />
              <div className="w-2 h-2 rounded-full bg-green-500/50" />
            </div>
            <p className="text-gray-500 mb-1">/ GET /api/public/inventory/[token]</p>
            <span className="text-pink-400">fetch</span>
            <span className="text-white">(`inventory-rho-two.vercel.app/api/...`)</span>
          </div>
        </div>
        
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      </motion.div>
    </section>
  );
}