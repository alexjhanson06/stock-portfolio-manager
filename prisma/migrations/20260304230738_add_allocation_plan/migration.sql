-- CreateTable
CREATE TABLE "allocation_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "goal" TEXT NOT NULL,
    "riskTolerance" TEXT NOT NULL,
    "equityFraction" DOUBLE PRECISION NOT NULL,
    "targets" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allocation_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "allocation_plans_userId_key" ON "allocation_plans"("userId");

-- AddForeignKey
ALTER TABLE "allocation_plans" ADD CONSTRAINT "allocation_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
