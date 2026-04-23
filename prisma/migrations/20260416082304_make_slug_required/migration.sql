/*
  Warnings:

  - Made the column `slug` on table `Truyen` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Truyen" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tenTruyen" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tacGia" TEXT,
    "moTa" TEXT,
    "anhBia" TEXT,
    "trangThai" TEXT NOT NULL DEFAULT 'ĐANG_RA',
    "luotXem" INTEGER NOT NULL DEFAULT 0,
    "ngayTao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngayCapNhat" DATETIME NOT NULL
);
INSERT INTO "new_Truyen" ("anhBia", "id", "luotXem", "moTa", "ngayCapNhat", "ngayTao", "slug", "tacGia", "tenTruyen", "trangThai") SELECT "anhBia", "id", "luotXem", "moTa", "ngayCapNhat", "ngayTao", "slug", "tacGia", "tenTruyen", "trangThai" FROM "Truyen";
DROP TABLE "Truyen";
ALTER TABLE "new_Truyen" RENAME TO "Truyen";
CREATE UNIQUE INDEX "Truyen_slug_key" ON "Truyen"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
