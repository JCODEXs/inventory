

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { areaService } from "~/server/services/area.service";
export const areaRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      inventoryId: z.string(),
    }))
    .mutation(({ ctx, input }) =>
      areaService.create(ctx.session.user.id, input)
    ),

  getByInventory: protectedProcedure
    .input(z.object({ inventoryId: z.string() }))
    .query(({ ctx, input }) =>
      areaService.getByInventory(
        ctx.session.user.id,
        input.inventoryId
      )
    ),
});