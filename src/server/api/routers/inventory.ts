import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { inventoryService } from "~/server/services/inventory.service";

export const inventoryRouter = createTRPCRouter({

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional()
    }))
    .mutation(({ ctx, input }) => {
      return inventoryService.create(ctx.session.user.id, input);
    }),

  getAll: protectedProcedure
    .query(({ ctx }) => {
      return inventoryService.getAll(ctx.session.user.id);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return inventoryService.getById(
        ctx.session.user.id,
        input.id
      );
    }),

  enablePublicAccess: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return inventoryService.enablePublicAccess(
        input.id,
        ctx.session.user.id
      );
    })

});