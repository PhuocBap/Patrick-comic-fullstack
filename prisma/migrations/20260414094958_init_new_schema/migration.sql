/*
  Warnings:

  - You are about to alter the column `chuongId` on the `BinhLuan` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `Chuong` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Chuong` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `chuongId` on the `LichSuDoc` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `chuongId` on the `TrangTruyen` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BinhLuan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "noiDung" TEXT NOT NULL,
    "ngayBinhLuan" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nguoiDungId" TEXT NOT NULL,
    "truyenId" INTEGER NOT NULL,
    "chuongId" INTEGER,
    CONSTRAINT "BinhLuan_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "NguoiDung" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BinhLuan_truyenId_fkey" FOREIGN KEY ("truyenId") REFERENCES "Truyen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BinhLuan_chuongId_fkey" FOREIGN KEY ("chuongId") REFERENCES "Chuong" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BinhLuan" ("chuongId", "id", "ngayBinhLuan", "nguoiDungId", "noiDung", "truyenId") SELECT "chuongId", "id", "ngayBinhLuan", "nguoiDungId", "noiDung", "truyenId" FROM "BinhLuan";
DROP TABLE "BinhLuan";
ALTER TABLE "new_BinhLuan" RENAME TO "BinhLuan";
CREATE TABLE "new_Chuong" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tenChuong" TEXT NOT NULL,
    "soChuong" REAL NOT NULL,
    "noiDung" TEXT NOT NULL,
    "ngayCapNhat" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "truyenId" INTEGER NOT NULL,
    CONSTRAINT "Chuong_truyenId_fkey" FOREIGN KEY ("truyenId") REFERENCES "Truyen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Chuong" ("id", "ngayCapNhat", "noiDung", "soChuong", "tenChuong", "truyenId") SELECT "id", "ngayCapNhat", "noiDung", "soChuong", "tenChuong", "truyenId" FROM "Chuong";
DROP TABLE "Chuong";
ALTER TABLE "new_Chuong" RENAME TO "Chuong";
CREATE TABLE "new_LichSuDoc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "thoiGianDoc" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nguoiDungId" TEXT NOT NULL,
    "chuongId" INTEGER NOT NULL,
    CONSTRAINT "LichSuDoc_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "NguoiDung" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LichSuDoc_chuongId_fkey" FOREIGN KEY ("chuongId") REFERENCES "Chuong" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LichSuDoc" ("chuongId", "id", "nguoiDungId", "thoiGianDoc") SELECT "chuongId", "id", "nguoiDungId", "thoiGianDoc" FROM "LichSuDoc";
DROP TABLE "LichSuDoc";
ALTER TABLE "new_LichSuDoc" RENAME TO "LichSuDoc";
CREATE UNIQUE INDEX "LichSuDoc_nguoiDungId_chuongId_key" ON "LichSuDoc"("nguoiDungId", "chuongId");
CREATE TABLE "new_TrangTruyen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "urlAnh" TEXT NOT NULL,
    "soThuTu" INTEGER NOT NULL,
    "chuongId" INTEGER NOT NULL,
    CONSTRAINT "TrangTruyen_chuongId_fkey" FOREIGN KEY ("chuongId") REFERENCES "Chuong" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TrangTruyen" ("chuongId", "id", "soThuTu", "urlAnh") SELECT "chuongId", "id", "soThuTu", "urlAnh" FROM "TrangTruyen";
DROP TABLE "TrangTruyen";
ALTER TABLE "new_TrangTruyen" RENAME TO "TrangTruyen";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
