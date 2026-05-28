/*
  Warnings:

  - A unique constraint covering the columns `[truyenId,soChuong]` on the table `Chuong` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Truyen` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Truyen" ADD COLUMN "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Chuong_truyenId_soChuong_key" ON "Chuong"("truyenId", "soChuong");

-- CreateIndex
CREATE UNIQUE INDEX "Truyen_slug_key" ON "Truyen"("slug");
