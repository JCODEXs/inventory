import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { itemService } from "~/server/services/item.service";

export const itemRouter = createTRPCRouter({

  create: protectedProcedure
    .input(z.object({
      inventoryId: z.string(),
      name: z.string(),
      description: z.string().optional(),
      manualUrl: z.string().optional(),
      amount: z.number().optional(),
      areaId: z.string().optional()
    }))
    .mutation(({ ctx, input }) => {
      return itemService.create(ctx.session.user.id, input);
    }),

  getByInventory: protectedProcedure
    .input(z.object({
      inventoryId: z.string()
    }))
    .query(({ ctx, input }) => {
      return itemService.getByInventory(
        ctx.session.user.id,
        input.inventoryId
      );
    }),

  getStatus: protectedProcedure
    .input(z.object({
      inventoryId: z.string()
    }))
    .query(({ ctx, input }) => {
      return itemService.getStatus(
        ctx.session.user.id,
        input.inventoryId
      );
    }),
    
      delete: protectedProcedure
    .input(z.object({ itemId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await itemService.delete(ctx.session.user.id, input.itemId)
        return { success: true }
      } catch (e) {
        throw new TRPCError({ code: "NOT_FOUND", message: (e as Error).message })
      }
    }),

});