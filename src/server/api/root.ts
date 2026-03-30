import { inventoryRouter } from "./routers/inventory";
import { itemRouter } from "./routers/item";
import { loanRouter } from "./routers/loan";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { areaRouter } from "./routers/area";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  inventory: inventoryRouter,
  item: itemRouter,
  loan: loanRouter,
  area: areaRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
