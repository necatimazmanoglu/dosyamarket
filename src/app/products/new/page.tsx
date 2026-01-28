import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Store, ShieldCheck } from "lucide-react";
import NewProductForm from "@/components/NewProductForm";

export default async function NewProductPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const ADMIN_EMAIL = "necatimazmanoglu@gmail.com";
  const isAdmin = user.emailAddresses[0]?.emailAddress === ADMIN_EMAIL;

  let sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: user.id },
  });

  // --- DÜZELTME BURADA: Admin için otomatik profil oluşturma ---
  if (isAdmin && !sellerProfile) {
    try {
      sellerProfile = await prisma.sellerProfile.create({
        data: {
          userId: user.id,
          name: user.firstName || "Admin",
          email: user.emailAddresses[0]?.emailAddress || "",
          shopName: "Admin Mağazası", // <--- BU SATIR EKSİKTİ, EKLENDİ
          description: "Sistem yöneticisi hesabı.",
          iban: "TR00 0000 0000 0000 0000 0000 00", // Zorunlu alanlar için dummy veri
          address: "Sistem Merkezi",
          city: "İstanbul",
        },
      });
    } catch (error) {
      console.error("Admin profili oluşturulamadı:", error);
      // Hata olsa bile aşağıda 'isAdmin' kontrolüyle geçişe izin vereceğiz
    }
  }
  // -------------------------------------------------------------

  // Erişim İzni: Satıcıysa VEYA Adminsen
  const canAccess = sellerProfile || isAdmin;
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Üst Başlık */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Ürün Satışa Çıkar</h1>
            <p className="text-gray-500 mt-2 flex items-center gap-2">
              Dijital ürününü yükle, fiyatını belirle ve kazanmaya başla.
              {isAdmin && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded flex items-center gap-1"><ShieldCheck size={12}/> Admin Modu</span>}
            </p>
          </div>
          <Link href="/" className="flex items-center gap-1 text-gray-500 hover:text-black font-medium transition">
             <ArrowLeft size={16} /> İptal
          </Link>
        </div>

        {/* KONTROL ALANI */}
        {canAccess ? (
            /* Erişim Varsa Formu Göster */
            <NewProductForm />
        ) : (
            /* Erişim Yoksa Uyarı */
            <div className="bg-white p-10 rounded-2xl shadow-sm text-center border border-gray-200">
                <div className="flex justify-center mb-4">
                    <div className="bg-blue-50 p-4 rounded-full">
                        <Store size={40} className="text-blue-600" />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Satıcı Hesabı Gerekli</h2>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Ürün ekleyebilmek için önce satıcı olmanız gerekmektedir. İşlem sadece 1 dakika sürer.
                </p>
                <Link 
                    href="/become-seller"
                    className="inline-block bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg"
                >
                    Şimdi Satıcı Ol
                </Link>
            </div>
        )}
        
      </div>
    </div>
  );
}