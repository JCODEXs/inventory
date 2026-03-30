/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { db } from "~/server/db";

export const loanService = {

  async create(userId: string, data: {
    itemId: string;
    borrowerName: string;
    borrowerContact?: string;
  }) {

    // validar que el item pertenece al usuario
    const item = await db.item.findFirst({
      where: {
        id: data.itemId,
        inventory: {
          userId
        }
      }
    });

    if (!item) {
      throw new Error("Unauthorized");
    }

    // evitar doble préstamo
    const activeLoan = await db.loan.findFirst({
      where: {
        itemId: data.itemId,
        returned: false
      }
    });

    if (activeLoan) {
      throw new Error("Item already loaned");
    }

    return db.loan.create({
      data
    });
  },

  async returnItem(userId: string, loanId: string) {

    const loan = await db.loan.findFirst({
      where: {
        id: loanId,
        item: {
          inventory: {
            userId
          }
        }
      }
    });

    if (!loan) {
      throw new Error("Unauthorized");
    }

    return db.loan.update({
      where: { id: loanId },
      data: {
        returned: true,
        endDate: new Date()
      }
    });
  }

};