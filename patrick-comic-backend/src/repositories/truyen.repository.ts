import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TruyenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findLatestComics(skip: number, limit: number, where: any) {
    return this.prisma.truyen.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { ngayCapNhat: 'desc' },
        { id: 'desc' }
      ],
      include: {
        chuongs: { take: 1, orderBy: { soChuong: 'desc' }, select: { soChuong: true } },
        theLoais: true,
      },
    });
  }

  async countComics(where: any) {
    return this.prisma.truyen.count({ where });
  }

  async findComicsOrderBy(orderByField: any, limit: number) {
    return this.prisma.truyen.findMany({
      orderBy: orderByField,
      take: limit,
      include: {
        chuongs: { 
          take: 1, 
          orderBy: { soChuong: 'desc' }, 
          select: { soChuong: true } 
        },
        theLoais: true,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.truyen.findUnique({
      where: { id },
      include: {
        theLoais: true,
        chuongs: { orderBy: { soChuong: 'asc' } }
      }
    });
  }

  async findByIdForViewIncrement(id: number) {
    return this.prisma.truyen.findUnique({
      where: { id },
      select: { ngayCapNhat: true }
    });
  }

  async create(data: any) {
    const tenKhongDau = data.tenKhongDau || this.removeVietnameseTones(data.tenTruyen);
    
    const theLoaiConnection = data.theLoaiNames ? {
      connectOrCreate: data.theLoaiNames.map((name: string) => ({
        where: { ten: name.trim() },
        create: { ten: name.trim() } // Đã sửa: Bỏ trường slug thừa không có trong Schema
      }))
    } : undefined;

    return this.prisma.truyen.create({
      data: {
        tenTruyen: data.tenTruyen,
        tenKhongDau: tenKhongDau,
        slug: data.slug,
        thumbnail: data.thumbnail,
        trangThai: data.trangThai || 'Đang ra',
        tacGia: data.tacGia || "Đang cập nhật",
        moTa: data.moTa || "",
        luotXem: 0,
        ngayCapNhat: new Date(),
        theLoais: theLoaiConnection
      }
    });
  }

  async update(id: number, data: any) {
    const tenKhongDau = data.tenKhongDau || (data.tenTruyen ? this.removeVietnameseTones(data.tenTruyen) : undefined);
    
    let theLoaiUpdate: any = undefined;

    // Xử lý lưu thể loại thủ công bằng ID từ Giao diện Admin gửi lên
    if (data.theLoaiIds && Array.isArray(data.theLoaiIds)) {
      const cleanIds = data.theLoaiIds
        .map((tid: any) => tid?.toString().trim())
        .filter((tid: string) => tid !== "" && tid !== "null" && tid !== "undefined");

      theLoaiUpdate = { 
        set: cleanIds.map((tid: string) => ({ id: tid })) 
      };
    } 
    // Xử lý map từ mảng chuỗi string theLoaiNames khi cào tự động
    else if (data.theLoaiNames && Array.isArray(data.theLoaiNames)) {
      theLoaiUpdate = {
        connectOrCreate: data.theLoaiNames.map((name: string) => ({
          where: { ten: name.trim() }, 
          create: { ten: name.trim() } // Đã sửa: Bỏ trường slug thừa không có trong Schema
        }))
      };
    }

    return this.prisma.truyen.update({
      where: { id: Number(id) },
      data: {
        tenTruyen: data.tenTruyen,
        tenKhongDau: tenKhongDau,
        tacGia: data.tacGia,
        moTa: data.moTa,
        thumbnail: data.thumbnail,
        trangThai: data.trangThai,
        theLoais: theLoaiUpdate,
      },
    });
  }

  async updateViews(id: number, ngayCapNhatCu: Date) {
    return this.prisma.truyen.update({
      where: { id },
      data: {
        luotXem: { increment: 1 },
        luotXemNgay: { increment: 1 },
        luotXemTuan: { increment: 1 },
        luotXemThang: { increment: 1 },
        ngayCapNhat: ngayCapNhatCu,
      },
    });
  }

  async delete(id: number) {
    return this.prisma.truyen.delete({
      where: { id },
    });
  }

  async search(query: string) {
    const searchSlug = this.removeVietnameseTones(query);
    return this.prisma.truyen.findMany({
      where: {
        OR: [
          { tenTruyen: { contains: query } },
          { tenKhongDau: { contains: searchSlug } },
          { tacGia: { contains: query } }
        ]
      },
      take: 10,
      select: { id: true, tenTruyen: true, thumbnail: true, tacGia: true }
    });
  }

  async findAllGenres() {
    return this.prisma.theLoai.findMany();
  }

  public removeVietnameseTones(str: string): string {
    if (!str) return "";
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }
}