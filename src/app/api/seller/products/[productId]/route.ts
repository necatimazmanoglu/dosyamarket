import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// 1. GÜNCELLEME (PATCH) - (Burası aynen kalıyor)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });

    const body = await request.json();
    const { title, description, price } = body;

    // Ürün bu satıcının mı?
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product || product.sellerId !== userId) {
      return NextResponse.json({ error: "Bu ürünü düzenleme yetkiniz yok" }, { status: 403 });
    }

    // Güncelle
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        title,
        description,
        price: parseFloat(price),
      }
    });

    return NextResponse.json({ success: true, product: updatedProduct });

  } catch (error) {
    console.error("Güncelleme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// 2. SİLME (DELETE) - (Mantık Düzeltildi)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });

    // Ürünü ve SİPARİŞ GEÇMİŞİNİ kontrol et
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        _count: { select: { orders: true } } // <--- Kritik Ekleme: Satış sayısını çekiyoruz
      }
    });

    if (!product || product.sellerId !== userId) {
      return NextResponse.json({ error: "Bu ürünü silme yetkiniz yok" }, { status: 403 });
    }

    // --- MANTIK DEĞİŞİKLİĞİ BURADA ---
    if (product._count.orders > 0) {
      // DURUM A: Ürün satılmışsa SİLME, sadece PASİFE AL (Soft Delete)
      // Böylece veritabanı hatası almazsın ve eski müşteriler etkilenmez.
      await prisma.product.update({
        where: { id: productId },
        data: { isActive: false } 
      });
    } else {
      // DURUM B: Ürün hiç satılmamışsa TAMAMEN SİL (Hard Delete)
      // Veritabanını kirletmemek için direkt siliyoruz.
      await prisma.product.delete({
        where: { id: productId }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Silme hatası:", error);
    // Prisma hatası detayını loglayalım
    return NextResponse.json({ error: "İşlem sırasında sunucu hatası oluştu." }, { status: 500 });
  }
}