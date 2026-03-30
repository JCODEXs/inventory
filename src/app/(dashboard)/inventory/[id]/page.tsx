"use client"
import { useParams } from "next/navigation";
import InventoryPage from "~/app/_components/InventoryPage";

export default  function Page() {
    const params = useParams()
  const inventoryId = params.id as string
if(!inventoryId) {
    return <div>Not found</div>;
  } else {
    return <InventoryPage inventoryId={inventoryId} />;
  }
}

