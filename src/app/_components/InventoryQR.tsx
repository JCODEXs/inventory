/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function InventoryQR({ token }: { token: string }) {
  const [qr, setQr] = useState<string>("");

  // Construimos la URL. Asegúrate de que NEXT_PUBLIC_APP_URL esté en tu .env
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/public/inventory/${token}`;

  useEffect(() => {
    if (token) {
      QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: "#1f2937", // Gris oscuro casi negro
          light: "#ffffff",
        },
      })
        .then(setQr)
        .catch((err) => console.error("Error generando QR:", err));
    }
  }, [url, token]);

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="bg-gray-50 p-2 rounded-xl border border-gray-50">
        {qr ? (
          <img src={qr} alt="Código QR de Inventario" className="w-40 h-40 rounded-lg" />
        ) : (
          <div className="w-40 h-40 flex items-center justify-center text-gray-300 text-xs italic">
            Generando...
          </div>
        )}
      </div>
      
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-gray-700">Acceso Público</p>
        <p className="text-[10px] text-gray-400 max-w-[150px] leading-tight">
          Cualquier persona con este código podrá ver el stock.
        </p>
      </div>

      <a 
        href={qr} 
        download={`qr-inventario-${token.slice(0, 5)}.png`}
        className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-full transition-colors"
      >
        Descargar imagen
      </a>
    </div>
  );
}