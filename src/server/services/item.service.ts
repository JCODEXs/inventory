/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { db } from "~/server/db";

export const itemService = {

  async create(userId: string, data: {
    inventoryId: string;
    name: string;
    description?: string;
    manualUrl?: string;
    areaId?: string;
    amount?: number;
  }) {

    // validar ownership del inventario
    const inventory = await db.inventory.findFirst({
      where: {
        id: data.inventoryId,
        userId
      }
    });

    if (!inventory) {
      throw new Error("Inventory not found or unauthorized");
    }

    return db.item.create({
      data
    });
  },

  async getByInventory(userId: string, inventoryId: string) {
    return db.item.findMany({
      where: {
        inventoryId,
        inventory: {
          userId
        }
      },
      include: {
        loans: {
          where: { returned: false }
        },
        area: true,
    
      }
    });
  },
  async delete(userId: string, itemId: string) {
    const item = await db.item.findFirst({
      where: {
        id: itemId,
        inventory: {
          userId
        }
      }
    });

    if (!item) {
      throw new Error("Item not found or unauthorized");
    }

    return db.item.delete({
      where: { id: itemId }
    });
  },

  async getStatus(userId: string, inventoryId: string) {
    const items = await this.getByInventory(userId, inventoryId);

    return items.map(item => ({
      id: item.id,
      name: item.name,
      isLoaned: item.loans.length > 0,
      loan: item.loans[0] ?? null
    }));
  }

};