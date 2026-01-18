import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

// UploadThing Dosya Yönetimi
const utapi = new UTApi();

type Props = {
  params: Promise<{ productId: string }>;
};

// 1. GET
export async function GET(req: NextRequest, props: Props) {
  try {
    const params = await props.params;
    const productId = params.productId;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// 2. PATCH
export async function PATCH(req: NextRequest, props: Props) {
  try {
    const params = await props.params;
    const productId = params.productId;
    const { userId } = await auth();

    if (!userId) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const body = await req.json();

    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct || existingProduct.sellerId !== userId) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
    }

    const priceValue = (body.price !== undefined && body.price !== null) 
        ? parseFloat(body.price) 
        : existingProduct.price;

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        title: body.title,
        description: body.description,
        price: priceValue,
        category: body.category,
        tags: body.tags,
        pdfUrl: body.pdfUrl,
        fileName: body.fileName,
        fileSize: body.fileSize ? parseInt(body.fileSize) : undefined,
        imageUrl: body.imageUrl,
        isApproved: false, 
      },
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    return NextResponse.json({ error: "Güncelleme hatası: " + error.message }, { status: 500 });
  }
}

// 3. DELETE (YENİ: isDeleted Destekli)
export async function DELETE(req: NextRequest, props: Props) {
  try {
    const params = await props.params;
    const productId = params.productId;
    const { userId } = await auth();

    if (!userId) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { 
        orders: true 
      }
    });

    if (!product || product.sellerId !== userId) {
        return NextResponse.json({ error: "Bu ürünü silme yetkiniz yok." }, { status: 403 });
    }

    // --- SENARYO 1: Ürünün Satış Geçmişi Var ---
    if (product.orders.length > 0) {
        // Ürün satılmışsa fiziksel olarak silmiyoruz, isDeleted işaretliyoruz.
        await prisma.product.update({
            where: { id: productId },
            data: {
                isDeleted: true,       // Keşfet'te gizle (Yeni eklediğimiz alan)
                isActive: false,        // Satışa kapat
                isApproved: false,      // Vitrinden kaldır
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: "Ürün geçmiş siparişleri olduğu için arşive kaldırıldı." 
        });
    }

    // --- SENARYO 2: Ürün Hiç Satılmamış ---
    // Dosyaları UploadThing'den sil
    if (product.pdfUrl) {
        const fileKey = product.pdfUrl.split("/").pop();
        if (fileKey) await utapi.deleteFiles(fileKey).catch(e => console.log("Dosya silme hatası:", e));
    }
    if (product.imageUrl) {
        const imageKey = product.imageUrl.split("/").pop();
        if (imageKey) await utapi.deleteFiles(imageKey).catch(e => console.log("Resim silme hatası:", e));
    }

    // Veritabanından tamamen sil
    await prisma.product.delete({ where: { id: productId } });

    return NextResponse.json({ success: true, message: "Ürün tamamen silindi." });

  } catch (error: any) {
    console.error("DELETE Hatası:", error);
    return NextResponse.json({ error: "Silme işlemi sırasında hata oluştu: " + error.message }, { status: 500 });
  }
}