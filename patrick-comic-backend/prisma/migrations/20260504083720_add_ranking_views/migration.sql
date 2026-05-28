-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Truyen" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tenTruyen" TEXT NOT NULL,
    "tenKhongDau" TEXT,
    "slug" TEXT NOT NULL,
    "tacGia" TEXT,
    "moTa" TEXT,
    "thumbnail" TEXT,
    "trangThai" TEXT NOT NULL DEFAULT 'ĐANG_RA',
    "luotXem" INTEGER NOT NULL DEFAULT 0,
    "luotXemNgay" INTEGER NOT NULL DEFAULT 0,
    "luotXemTuan" INTEGER NOT NULL DEFAULT 0,
    "luotXemThang" INTEGER NOT NULL DEFAULT 0,
    "ngayTao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngayCapNhat" DATETIME NOT NULL
);
INSERT INTO "new_Truyen" ("id", "luotXem", "moTa", "ngayCapNhat", "ngayTao", "slug", "tacGia", "tenKhongDau", "tenTruyen", "thumbnail", "trangThai") SELECT "id", "luotXem", "moTa", "ngayCapNhat", "ngayTao", "slug", "tacGia", "tenKhongDau", "tenTruyen", "thumbnail", "trangThai" FROM "Truyen";
DROP TABLE "Truyen";
ALTER TABLE "new_Truyen" RENAME TO "Truyen";
CREATE UNIQUE INDEX "Truyen_slug_key" ON "Truyen"("slug");
CREATE INDEX "Truyen_tenKhongDau_idx" ON "Truyen"("tenKhongDau");
CREATE INDEX "Truyen_tenTruyen_idx" ON "Truyen"("tenTruyen");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
