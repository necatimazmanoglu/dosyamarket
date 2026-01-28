import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma"; 
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NewProductForm from "@/components/NewProductForm";

export default async function NewProductDashboardPage() {
  
  // 1. Kullanıcıyı al
  const user = await currentUser();

  // EĞER KULLANICI YOKSA: "Giriş Yapmalısın" uyarısı göster.
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Oturum Açmanız Gerekiyor</h2>
        <p className="text-gray-500 mb-6">Bu sayfayı görüntülemek için lütfen giriş yapın.</p>
        <Link href="/" className="bg-black text-white px-6 py-3 rounded-full font-bold">
          Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  // 2. Satıcı Kaydını Kontrol Et / Oluştur
  try {
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id }
    });

    if (!sellerProfile) {
      // --- DÜZELTME BURADA ---
      // Eksik olan shopName ve diğer zorunlu alanları ekledik.
      await prisma.sellerProfile.create({
        data: {
          userId: user.id,
          name: user.firstName || "Yeni Satıcı",
          email: user.emailAddresses[0]?.emailAddress || "no-email",
          shopName: (user.firstName || "Kullanıcı") + " Mağazası", // EKLENDİ
          iban: "TR000000000000000000000000", // EKLENDİ (Dummy data)
          address: "Henüz girilmedi",         // EKLENDİ
          city: "Belirtilmedi"                // EKLENDİ
        }
      });
    }
  } catch (error) {
    console.error("Satıcı profili oluşturulurken hata:", error);
    // Hata olsa bile formu göstermeye çalışalım, belki kullanıcı zaten vardır ama bağlantı kopmuştur.
  }

  // 3. Formu Göster
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-in fade-in duration-500">
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Doküman Yükle</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Satıcı panelinden yeni bir dijital ürün oluşturun.
          </p>
        </div>
        <Link 
          href="/dashboard/products" 
          className="flex items-center gap-2 text-gray-500 hover:text-black font-medium transition-colors p-2 hover:bg-gray-100 rounded-lg"
        >
           <ArrowLeft size={18} /> İptal
        </Link>
      </div>

      <NewProductForm />
      
    </div>
  );
}