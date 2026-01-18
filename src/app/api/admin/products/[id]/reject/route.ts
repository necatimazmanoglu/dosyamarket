import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // --- DÜZELTME BURADA YAPILDI ---
    // Eski Kod: prisma.product.delete(...) -> Bu kod sipariş varsa patlıyordu.
    // Yeni Kod: prisma.product.update(...) -> Bu kod ürünü pasife çeker, hata vermez.

    await prisma.product.update({
      where: { id },
      data: {
        isApproved: false, // Onayını kaldır
        isActive: false,   // Yayından kaldır (Keşfet'te ve mağazada görünmez)
        isDeleted: true    // "Silindi" olarak işaretle (Admin panelinde kırmızı görünür)
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Silme işlemi başarısız:", error);
    // Hata olursa sessizce kalmasın, panele hata göndersin
    return NextResponse.json(
      { success: false, error: "Silme işlemi sırasında sunucu hatası oluştu." }, 
      { status: 500 }
    );
  }
}