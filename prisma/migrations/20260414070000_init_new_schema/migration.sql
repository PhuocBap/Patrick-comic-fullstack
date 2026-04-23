-- CreateTable
CREATE TABLE "NguoiDung" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenDangNhap" TEXT NOT NULL,
    "matKhau" TEXT NOT NULL,
    "email" TEXT,
    "vaiTro" TEXT NOT NULL DEFAULT 'USER',
    "ngayTao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Truyen" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tenTruyen" TEXT NOT NULL,
    "tacGia" TEXT,
    "moTa" TEXT,
    "anhBia" TEXT,
    "trangThai" TEXT NOT NULL DEFAULT 'ĐANG_RA',
    "luotXem" INTEGER NOT NULL DEFAULT 0,
    "ngayTao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngayCapNhat" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TheLoai" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ten" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Chuong" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenChuong" TEXT NOT NULL,
    "soChuong" REAL NOT NULL,
    "noiDung" TEXT NOT NULL,
    "ngayCapNhat" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "truyenId" INTEGER NOT NULL,
    CONSTRAINT "Chuong_truyenId_fkey" FOREIGN KEY ("truyenId") REFERENCES "Truyen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrangTruyen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "urlAnh" TEXT NOT NULL,
    "soThuTu" INTEGER NOT NULL,
    "chuongId" TEXT NOT NULL,
    CONSTRAINT "TrangTruyen_chuongId_fkey" FOREIGN KEY ("chuongId") REFERENCES "Chuong" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BinhLuan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "noiDung" TEXT NOT NULL,
    "ngayBinhLuan" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nguoiDungId" TEXT NOT NULL,
    "truyenId" INTEGER NOT NULL,
    "chuongId" TEXT,
    CONSTRAINT "BinhLuan_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "NguoiDung" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BinhLuan_truyenId_fkey" FOREIGN KEY ("truyenId") REFERENCES "Truyen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BinhLuan_chuongId_fkey" FOREIGN KEY ("chuongId") REFERENCES "Chuong" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TheoDoi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ngayTheoDoi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nguoiDungId" TEXT NOT NULL,
    "truyenId" INTEGER NOT NULL,
    CONSTRAINT "TheoDoi_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "NguoiDung" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TheoDoi_truyenId_fkey" FOREIGN KEY ("truyenId") REFERENCES "Truyen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LichSuDoc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "thoiGianDoc" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nguoiDungId" TEXT NOT NULL,
    "chuongId" TEXT NOT NULL,
    CONSTRAINT "LichSuDoc_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "NguoiDung" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LichSuDoc_chuongId_fkey" FOREIGN KEY ("chuongId") REFERENCES "Chuong" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_TheLoaiToTruyen" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_TheLoaiToTruyen_A_fkey" FOREIGN KEY ("A") REFERENCES "TheLoai" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TheLoaiToTruyen_B_fkey" FOREIGN KEY ("B") REFERENCES "Truyen" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "NguoiDung_tenDangNhap_key" ON "NguoiDung"("tenDangNhap");

-- CreateIndex
CREATE UNIQUE INDEX "NguoiDung_email_key" ON "NguoiDung"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TheLoai_ten_key" ON "TheLoai"("ten");

-- CreateIndex
CREATE UNIQUE INDEX "TheoDoi_nguoiDungId_truyenId_key" ON "TheoDoi"("nguoiDungId", "truyenId");

-- CreateIndex
CREATE UNIQUE INDEX "LichSuDoc_nguoiDungId_chuongId_key" ON "LichSuDoc"("nguoiDungId", "chuongId");

-- CreateIndex
CREATE UNIQUE INDEX "_TheLoaiToTruyen_AB_unique" ON "_TheLoaiToTruyen"("A", "B");

-- CreateIndex
CREATE INDEX "_TheLoaiToTruyen_B_index" ON "_TheLoaiToTruyen"("B");
