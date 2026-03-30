/*
  Warnings:

  - A unique constraint covering the columns `[publicToken]` on the table `Inventory` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Inventory" ADD COLUMN     "publicToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_publicToken_key" ON "Inventory"("publicToken");
