-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "provider" TEXT,
ADD COLUMN     "providerName" TEXT;

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
