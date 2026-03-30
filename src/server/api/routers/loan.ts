import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { loanService } from "~/server/services/loan.service";

export const loanRouter = createTRPCRouter({

  create: protectedProcedure
    .input(z.object({
      itemId: z.string(),
      borrowerName: z.string(),
      borrowerContact: z.string().optional()
    }))
    .mutation(({ ctx, input }) => {
      return loanService.create(ctx.session.user.id, input);
    }),

  returnItem: protectedProcedure
    .input(z.object({
      loanId: z.string()
    }))
    .mutation(({ ctx, input }) => {
      return loanService.returnItem(
        ctx.session.user.id,
        input.loanId
      );
    })

});