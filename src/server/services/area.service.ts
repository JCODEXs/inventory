/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { db } from "~/server/db";

export const areaService = {
  async create(userId: string, data: {
    name: string;
    inventoryId: string;
  }) {
    const inventory = await db.inventory.findFirst({
      where: {
        id: data.inventoryId,
        userId,
      },
    });

    if (!inventory) throw new Error("Unauthorized");

    return db.area.create({
      data,
    });
  },

  async getByInventory(userId: string, inventoryId: string) {
    return db.area.findMany({
      where: {
        inventoryId,
        inventory: { userId },
      },
      orderBy: { createdAt: "asc" },
    });
  },
};