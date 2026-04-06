/*
  Warnings:

  - You are about to drop the column `provider` on the `Item` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Item` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "provider",
ADD COLUMN     "providerNumber" TEXT,
ALTER COLUMN "price" SET DATA TYPE INTEGER;
