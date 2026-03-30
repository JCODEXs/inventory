/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function InventoryQR({ token }: { token: string }) {
  const [qr, setQr] = useState<string>("");

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/public/inventory/${token}`;

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    QRCode.toDataURL(url).then(setQr);
  }, [url]);

  return (
    <div className="flex flex-col items-center gap-2">
      {qr && <img src={qr} alt="QR" className="w-40 h-40" />}
      <p className="text-xs text-gray-500 text-center">
        Escanea para ver inventario
      </p>
      <a href={qr} download="inventory-qr.png">
  Descargar QR
</a>
    </div>
  );
}