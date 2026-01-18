import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Başlığında "(SİLİNDİ)" geçen veya "(silindi)" geçen tüm ürünleri bul
    // ve isDeleted değerini true yap.
    const result = await prisma.product.updateMany({
      where: {
        title: {
          contains: "SİLİNDİ", // Büyük/küçük harf duyarlılığı olabilir, ikisini de kapsayalım
        },
      },
      data: {
        isDeleted: true,
        isActive: false,
        isApproved: false,
      },
    });

    return NextResponse.json({ 
      message: "Temizlik Tamamlandı!", 
      duzeltilen_urun_sayisi: result.count 
    });

  } catch (error) {
    return NextResponse.json({ error: "Hata oluştu: " + error }, { status: 500 });
  }
}