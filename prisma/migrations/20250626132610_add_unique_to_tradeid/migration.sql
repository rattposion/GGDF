-- CreateTable
CREATE TABLE "SteamTrade" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "steamItemId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "botInventorySlot" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SteamTrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SteamTrade_tradeId_key" ON "SteamTrade"("tradeId");
