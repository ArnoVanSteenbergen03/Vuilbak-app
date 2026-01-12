-- CreateTable
CREATE TABLE "trash_cans" (
    "id" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'empty',
    "lastUpdated" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "trash_cans_pkey" PRIMARY KEY ("id")
);
