-- CreateEnum
CREATE TYPE "EarningType" AS ENUM ('DIRECT_EARNING', 'LEVEL_EARNING', 'UPGRADE_EARNING', 'AUTOPOOL_EARNING');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "regId" INTEGER,
    "registeredTime" INTEGER,
    "bn_id" TEXT,
    "wallet_address" TEXT NOT NULL,
    "sponser_address" TEXT,
    "directTeam_Count" INTEGER DEFAULT 0,
    "totalTeam_Count" INTEGER DEFAULT 0,
    "isRegistered" BOOLEAN DEFAULT false,
    "registrationTranxhash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastestPlanetName" TEXT,
    "currentUniversePlanet" INTEGER NOT NULL DEFAULT 0,
    "totalBNCoin" INTEGER,
    "directEarning" DOUBLE PRECISION DEFAULT 0.0,
    "levelEarning" DOUBLE PRECISION DEFAULT 0.0,
    "upgradeEarning" DOUBLE PRECISION DEFAULT 0.0,
    "myLaps" DOUBLE PRECISION DEFAULT 0.0,
    "universeDirectEarning" DOUBLE PRECISION DEFAULT 0.0,
    "universeUpgradeEarning" DOUBLE PRECISION DEFAULT 0.0,
    "universePlanetCount" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniverseUsersPlanet" (
    "id" TEXT NOT NULL,
    "planetNum" INTEGER NOT NULL,
    "planetName" TEXT NOT NULL,
    "planetPrice" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "planetId" TEXT NOT NULL,

    CONSTRAINT "UniverseUsersPlanet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversePlanets" (
    "id" TEXT NOT NULL,
    "planetNum" INTEGER NOT NULL,
    "planetName" TEXT NOT NULL,
    "planetPrice" INTEGER NOT NULL,
    "universalCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UniversePlanets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniverseEarningInfo" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "receiverAddress" TEXT NOT NULL,
    "senderAddress" TEXT NOT NULL,
    "planetName" TEXT NOT NULL,
    "earningType" "EarningType" NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UniverseEarningInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CosmosPlanet" (
    "id" TEXT NOT NULL,
    "planetNum" INTEGER NOT NULL,
    "planetName" TEXT NOT NULL,
    "planetPrice" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "planetId" TEXT NOT NULL,

    CONSTRAINT "CosmosPlanet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNFTs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenType" INTEGER NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "mintDate" TIMESTAMP(3) NOT NULL,
    "royaltNFTId" TEXT NOT NULL,

    CONSTRAINT "UserNFTs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CryptoLoginNonce" (
    "userId" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Planet" (
    "id" TEXT NOT NULL,
    "planetNum" INTEGER NOT NULL,
    "planetName" TEXT NOT NULL,
    "planetPrice" INTEGER NOT NULL,
    "universalCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Planet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectTeam" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DirectTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ancestors" (
    "id" TEXT NOT NULL,
    "ancestorsNumber" INTEGER NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ancestors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bnCoinEarned" (
    "id" TEXT NOT NULL,
    "bn_id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "coinEarnType" TEXT,
    "timeStamp" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "bnCoinEarned_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BNCoinConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "BNMaxRewardsCoins" INTEGER NOT NULL DEFAULT 50000,
    "BNMaxAirDropCoins" INTEGER NOT NULL DEFAULT 1000,
    "BNCoinDistributed" INTEGER,
    "BNAirDropCoinDistributed" INTEGER,

    CONSTRAINT "BNCoinConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EarningInfo" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "receiverAddress" TEXT NOT NULL,
    "senderAddress" TEXT NOT NULL,
    "planetName" TEXT NOT NULL,
    "earningType" "EarningType" NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "EarningInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutoPool" (
    "id" TEXT NOT NULL,
    "bn_id" TEXT NOT NULL,
    "planetName" TEXT NOT NULL,
    "reg_user_address" TEXT NOT NULL,
    "universeSlot" INTEGER,
    "parentId" TEXT,
    "currentRecycle" INTEGER,
    "currentLevel" INTEGER,
    "currentPosition" INTEGER,
    "autoPoolEarning" DOUBLE PRECISION,
    "isRoot" BOOLEAN NOT NULL DEFAULT false,
    "canHaveMoreChildren" BOOLEAN NOT NULL DEFAULT true,
    "childrenId" TEXT,

    CONSTRAINT "AutoPool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Children" (
    "id" TEXT NOT NULL,
    "childrenNumber" INTEGER,
    "wallet_address" TEXT NOT NULL,
    "planetName" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,

    CONSTRAINT "Children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecycleMapping" (
    "id" TEXT NOT NULL,
    "recycleCount" INTEGER NOT NULL DEFAULT 0,
    "autoPoolId" TEXT NOT NULL,

    CONSTRAINT "RecycleMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndexMapping" (
    "id" TEXT NOT NULL,
    "userLevel" INTEGER NOT NULL,
    "userPosition" INTEGER NOT NULL,
    "recycleMappingId" TEXT NOT NULL,

    CONSTRAINT "IndexMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EarningHistory" (
    "id" TEXT NOT NULL,
    "recycleNumber" INTEGER NOT NULL,
    "reg_user_address" TEXT NOT NULL,
    "bn_id" TEXT NOT NULL,
    "planetName" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currentPosition" INTEGER NOT NULL,
    "currentLevel" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "autoPoolId" TEXT NOT NULL,

    CONSTRAINT "EarningHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TempChild" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "childAddress" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "universalPlanetCount" INTEGER,
    "temporaryChildrenId" TEXT NOT NULL,

    CONSTRAINT "TempChild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemporaryChildrenSchema" (
    "id" TEXT NOT NULL,
    "panrentAddress" TEXT NOT NULL,
    "planetName" TEXT NOT NULL,

    CONSTRAINT "TemporaryChildrenSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NFTBonusHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "tokenType" INTEGER NOT NULL,
    "bonusAmount" DOUBLE PRECISION NOT NULL,
    "claminedDate" TIMESTAMP(3) NOT NULL,
    "bonusLaunchDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NFTBonusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoyaltyNFTs" (
    "id" TEXT NOT NULL,
    "tokenType" INTEGER NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "tokenCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RoyaltyNFTs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NFTTransferHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenType" INTEGER NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "receiver_wallet_address" TEXT NOT NULL,

    CONSTRAINT "NFTTransferHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniverseUpgradeEarningTree" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "upline_address" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "currentPlanet" INTEGER NOT NULL,

    CONSTRAINT "UniverseUpgradeEarningTree_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniverseUpgradeTreeChildren" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "universeUpgradeEarningTreeId" TEXT NOT NULL,
    "currentPlanet" TEXT NOT NULL,
    "childNumber" INTEGER NOT NULL,
    "upline_address" TEXT NOT NULL,

    CONSTRAINT "UniverseUpgradeTreeChildren_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpgradeUniverseEarningHistory" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "currentPlanet" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "level" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "universeUpgradeEarningTreeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UpgradeUniverseEarningHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniverseMatrixEarningTree" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "uplineAddress" TEXT NOT NULL,
    "planetName" TEXT NOT NULL,
    "currentChainId" INTEGER NOT NULL DEFAULT 1,
    "currentChainPosition" INTEGER NOT NULL,
    "currentChainLevel" INTEGER NOT NULL,
    "countChainId" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "UniverseMatrixEarningTree_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatrixChildren" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "universeMatrixEarningTreeId" TEXT NOT NULL,
    "upline_address" TEXT NOT NULL,
    "childNumber" INTEGER NOT NULL,
    "chainId" INTEGER NOT NULL,
    "planetName" TEXT NOT NULL,

    CONSTRAINT "MatrixChildren_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniverseMatrixEarningHistory" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "latestPlanet" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "chainId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "universeMatrixEarningTreeId" TEXT NOT NULL,

    CONSTRAINT "UniverseMatrixEarningHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_IndexMappingUserIds" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_regId_key" ON "User"("regId");

-- CreateIndex
CREATE UNIQUE INDEX "User_wallet_address_key" ON "User"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "UniversePlanets_planetNum_key" ON "UniversePlanets"("planetNum");

-- CreateIndex
CREATE UNIQUE INDEX "UniversePlanets_planetName_key" ON "UniversePlanets"("planetName");

-- CreateIndex
CREATE UNIQUE INDEX "CosmosPlanet_userId_planetNum_key" ON "CosmosPlanet"("userId", "planetNum");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "CryptoLoginNonce_userId_key" ON "CryptoLoginNonce"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Planet_planetNum_key" ON "Planet"("planetNum");

-- CreateIndex
CREATE UNIQUE INDEX "Planet_planetName_key" ON "Planet"("planetName");

-- CreateIndex
CREATE UNIQUE INDEX "Ancestors_userId_wallet_address_key" ON "Ancestors"("userId", "wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "BNCoinConfig_key_key" ON "BNCoinConfig"("key");

-- CreateIndex
CREATE UNIQUE INDEX "AutoPool_bn_id_planetName_key" ON "AutoPool"("bn_id", "planetName");

-- CreateIndex
CREATE INDEX "UniverseUpgradeEarningTree_wallet_address_idx" ON "UniverseUpgradeEarningTree"("wallet_address");

-- CreateIndex
CREATE INDEX "UniverseUpgradeTreeChildren_wallet_address_idx" ON "UniverseUpgradeTreeChildren"("wallet_address");

-- CreateIndex
CREATE INDEX "UpgradeUniverseEarningHistory_wallet_address_idx" ON "UpgradeUniverseEarningHistory"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "UniverseMatrixEarningTree_planetName_wallet_address_key" ON "UniverseMatrixEarningTree"("planetName", "wallet_address");

-- CreateIndex
CREATE INDEX "MatrixChildren_wallet_address_idx" ON "MatrixChildren"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "_IndexMappingUserIds_AB_unique" ON "_IndexMappingUserIds"("A", "B");

-- CreateIndex
CREATE INDEX "_IndexMappingUserIds_B_index" ON "_IndexMappingUserIds"("B");

-- AddForeignKey
ALTER TABLE "UniverseUsersPlanet" ADD CONSTRAINT "UniverseUsersPlanet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniverseUsersPlanet" ADD CONSTRAINT "UniverseUsersPlanet_planetId_fkey" FOREIGN KEY ("planetId") REFERENCES "UniversePlanets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniverseEarningInfo" ADD CONSTRAINT "UniverseEarningInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CosmosPlanet" ADD CONSTRAINT "CosmosPlanet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CosmosPlanet" ADD CONSTRAINT "CosmosPlanet_planetId_fkey" FOREIGN KEY ("planetId") REFERENCES "Planet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNFTs" ADD CONSTRAINT "UserNFTs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNFTs" ADD CONSTRAINT "UserNFTs_royaltNFTId_fkey" FOREIGN KEY ("royaltNFTId") REFERENCES "RoyaltyNFTs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoLoginNonce" ADD CONSTRAINT "CryptoLoginNonce_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectTeam" ADD CONSTRAINT "DirectTeam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ancestors" ADD CONSTRAINT "Ancestors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bnCoinEarned" ADD CONSTRAINT "bnCoinEarned_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarningInfo" ADD CONSTRAINT "EarningInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutoPool" ADD CONSTRAINT "AutoPool_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AutoPool"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Children" ADD CONSTRAINT "Children_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AutoPool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecycleMapping" ADD CONSTRAINT "RecycleMapping_autoPoolId_fkey" FOREIGN KEY ("autoPoolId") REFERENCES "AutoPool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndexMapping" ADD CONSTRAINT "IndexMapping_recycleMappingId_fkey" FOREIGN KEY ("recycleMappingId") REFERENCES "RecycleMapping"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarningHistory" ADD CONSTRAINT "EarningHistory_autoPoolId_fkey" FOREIGN KEY ("autoPoolId") REFERENCES "AutoPool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TempChild" ADD CONSTRAINT "TempChild_temporaryChildrenId_fkey" FOREIGN KEY ("temporaryChildrenId") REFERENCES "TemporaryChildrenSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NFTBonusHistory" ADD CONSTRAINT "NFTBonusHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NFTTransferHistory" ADD CONSTRAINT "NFTTransferHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniverseUpgradeTreeChildren" ADD CONSTRAINT "UniverseUpgradeTreeChildren_universeUpgradeEarningTreeId_fkey" FOREIGN KEY ("universeUpgradeEarningTreeId") REFERENCES "UniverseUpgradeEarningTree"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpgradeUniverseEarningHistory" ADD CONSTRAINT "UpgradeUniverseEarningHistory_universeUpgradeEarningTreeId_fkey" FOREIGN KEY ("universeUpgradeEarningTreeId") REFERENCES "UniverseUpgradeEarningTree"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatrixChildren" ADD CONSTRAINT "MatrixChildren_universeMatrixEarningTreeId_fkey" FOREIGN KEY ("universeMatrixEarningTreeId") REFERENCES "UniverseMatrixEarningTree"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniverseMatrixEarningHistory" ADD CONSTRAINT "UniverseMatrixEarningHistory_universeMatrixEarningTreeId_fkey" FOREIGN KEY ("universeMatrixEarningTreeId") REFERENCES "UniverseMatrixEarningTree"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IndexMappingUserIds" ADD CONSTRAINT "_IndexMappingUserIds_A_fkey" FOREIGN KEY ("A") REFERENCES "IndexMapping"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IndexMappingUserIds" ADD CONSTRAINT "_IndexMappingUserIds_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
