import { prisma } from "@/lib/prisma";
import { iyzico } from "@/lib/iyzico";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const token = formData.get("token") as string;
    const conversationId = formData.get("conversationId") as string;

    if (!token) {
      return NextResponse.json({ error: "Token yok" }, { status: 400 });
    }

    // DÜZELTME: Promise'in dönüş tipini <NextResponse> olarak belirttik.
    return new Promise<NextResponse>((resolve) => {
      // @ts-ignore
      iyzico.checkoutForm.retrieve({
        locale: "tr",
        conversationId: conversationId,
        token: token,
      }, async (err: any, result: any) => {
        
        // 1. Ödeme Başarısızsa
        if (err || result.status !== "success" || result.paymentStatus !== "SUCCESS") {
           // Başarısız sayfasına yönlendir
           resolve(NextResponse.redirect(new URL("/?status=payment-failed", request.url)));
           return;
        }

        // --- ÖDEME BAŞARILI: HESAPLAMA ZAMANI ---

        const parts = conversationId.split("-");
        const productId = parts[0];
        const userId = parts[1];

        // Ürünü ve Satıcıyı (Özel komisyon oranı için) çek
        const product = await prisma.product.findUnique({ 
            where: { id: productId },
            include: { seller: true } 
        });

        if (!product) {
            resolve(NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 })); 
            return;
        }

        // --- FİNANSAL HESAPLAMALAR ---
        const price = product.price;

        // A. iyzico Kesintisi (Tahmini: %2.99 + 0.25 TL)
        const iyzicoRate = 0.0299; 
        const iyzicoFixed = 0.25;
        const paymentProviderFee = (price * iyzicoRate) + iyzicoFixed;

        // B. Platform Komisyonu
        const standardRate = 10; 
        const appliedRate = product.seller.commissionRate !== null ? product.seller.commissionRate : standardRate;
        const platformFee = price * (appliedRate / 100);

        // C. Satıcıya Kalan NET Tutar
        const netEarnings = price - paymentProviderFee - platformFee;

        // 2. Siparişi Tüm Detaylarıyla Kaydet
        const order = await prisma.order.create({
          data: {
            userId: userId,
            productId: productId,
            productTitle: product.title,
            
            // Finansal Veriler
            pricePaid: price,
            paymentProviderFee: parseFloat(paymentProviderFee.toFixed(2)),
            platformFee: parseFloat(platformFee.toFixed(2)),
            netEarnings: parseFloat(netEarnings.toFixed(2)),
            
            status: "SUCCESS",
            paymentId: result.paymentId,
            sellerId: product.sellerId,
          },
        });

        // 3. Satıcının Bakiyesini Artır
        await prisma.sellerProfile.update({
          where: { userId: product.sellerId },
          data: {
            balance: { increment: parseFloat(netEarnings.toFixed(2)) }
          }
        });

        // 4. Başarılı Sayfasına Yönlendir
        resolve(NextResponse.redirect(new URL(`/orders/${order.id}`, request.url)));
      });
    });

  } catch (error) {
    console.error("Callback hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}