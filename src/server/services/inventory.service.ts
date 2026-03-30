/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { db } from "~/server/db";
import { randomUUID } from "crypto";
export const inventoryService = {

  async create(userId: string, data: {
    name: string;
    description?: string;
  }) {
    return db.inventory.create({
      data: {
        ...data,
        userId
      }
    });
  },

  async getAll(userId: string) {
    return db.inventory.findMany({
      where: { userId }
    });
  },

  async getById(userId: string, id: string) {
    return db.inventory.findFirst({
      where: {
        id,
        userId
      },
      include: {
        items: true
      }
    });
  },

async getOrCreateDefaultInventory(userId: string) {
  let inventory = await db.inventory.findFirst({
    where: { userId }
  });

  if (!inventory) {
    inventory = await db.inventory.create({
      data: {
        userId,
        name: "Mi Inventario",
        description: "Inventario principal"
      }
    });
  }

  return inventory;
},


async enablePublicAccess(inventoryId: string, userId: string) {
  return db.inventory.update({
    where: {
      id: inventoryId,
      userId,
    },
    data: {
      publicToken: randomUUID(),
    },
  });
},
};