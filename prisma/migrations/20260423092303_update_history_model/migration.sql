/*
  Warnings:

  - Added the required column `truyenId` to the `LichSuDoc` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LichSuDoc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "thoiGianDoc" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nguoiDungId" TEXT NOT NULL,
    "truyenId" INTEGER NOT NULL,
    "chuongId" INTEGER NOT NULL,
    CONSTRAINT "LichSuDoc_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "NguoiDung" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LichSuDoc_truyenId_fkey" FOREIGN KEY ("truyenId") REFERENCES "Truyen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LichSuDoc_chuongId_fkey" FOREIGN KEY ("chuongId") REFERENCES "Chuong" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LichSuDoc" ("chuongId", "id", "nguoiDungId", "thoiGianDoc") SELECT "chuongId", "id", "nguoiDungId", "thoiGianDoc" FROM "LichSuDoc";
DROP TABLE "LichSuDoc";
ALTER TABLE "new_LichSuDoc" RENAME TO "LichSuDoc";
CREATE UNIQUE INDEX "LichSuDoc_nguoiDungId_truyenId_key" ON "LichSuDoc"("nguoiDungId", "truyenId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
