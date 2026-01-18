import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Edit, Eye, Plus, FileText, Trash2, AlertCircle, CheckCircle, Archive } from "lucide-react";
import { revalidatePath } from "next/cache";

// --- SİLME / ARŞİVLEME İŞLEMİ ---
async function deleteProduct(formData: FormData) {
  "use server";

  const productId = formData.get("productId") as string;
  const { userId } = await auth();

  if (!userId || !productId) return;

  // 1. Ürünü ve sipariş geçmişini kontrol et
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      _count: { select: { orders: true } }
    }
  });

  if (!product || product.sellerId !== userId) return;

  // 2. MANTIK: İsim Değiştirme YOK. Sadece Durum Değişiyor.
  if (product._count.orders > 0) {
    // A) Ürün Satılmışsa: Sadece "Pasif" yap.
    // Başlık (title) değişmediği için eski alıcılar kütüphanelerinde orijinal ismi görür.
    // isActive: false olduğu için Keşfet sayfasında görünmez.
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false } 
    });
  } else {
    // B) Ürün Hiç Satılmamışsa: Veritabanından tamamen sil.
    await prisma.product.delete({
      where: { id: productId }
    });
  }

  revalidatePath("/dashboard/products");
  revalidatePath("/explore");
}

export default async function MyProductsPage() {
  const { userId } = await auth();

  if (!userId) redirect("/");

  // Satıcının ürünlerini getir
  // isActive filtresi koymuyoruz, çünkü satıcı pasife aldığı ürünleri de panelde görmeli.
  const products = await prisma.product.findMany({
    where: { sellerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } }
    }
  });

  return (
    <div className="space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Ürünlerim</h1>
          <p className="text-gray-500">Mağazanızdaki tüm dijital ürünleri buradan yönetin.</p>
        </div>
        <Link 
          href="/dashboard/products/new" 
          className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus size={18} />
          Yeni Ürün Ekle
        </Link>
      </div>

      {/* LİSTE */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <FileText size={40} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Henüz ürününüz yok</h3>
            <p className="text-gray-500 max-w-sm mt-2 mb-6">İlk ürününüzü ekleyin.</p>
            <Link href="/dashboard/products/new" className="text-indigo-600 font-bold hover:underline">
              Şimdi Ürün Ekle &rarr;
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-bold text-gray-500">
                  <th className="px-6 py-4">Ürün</th>
                  <th className="px-6 py-4">Fiyat</th>
                  <th className="px-6 py-4">Durum</th>
                  <th className="px-6 py-4 text-center">Satış</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => {
                  
                  // Ürün pasifse "Yayından Kaldırıldı" muamelesi yap
                  // isDeleted alanı varsa onu da kontrol edebilirsin ama isActive yeterli.
                  const isUnpublished = !product.isActive; 
                  const hasSales = product._count.orders > 0;

                  return (
                  <tr key={product.id} className={`hover:bg-gray-50/50 transition group ${isUnpublished ? 'bg-red-50/40' : ''}`}>
                    
                    {/* Ürün Bilgisi */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-gray-100 rounded-lg relative overflow-hidden flex-shrink-0 border border-gray-200">
                          {product.imageUrl ? (
                            <Image src={product.imageUrl} fill alt={product.title} className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">PDF</div>
                          )}
                        </div>
                        <div>
                          {/* İsim Asla Çizilmiyor veya Değişmiyor */}
                          <div className={`font-bold line-clamp-1 ${isUnpublished ? 'text-gray-600' : 'text-gray-900'}`}>
                              {product.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{product.fileName}</div>
                        </div>
                      </div>
                    </td>

                    {/* Fiyat */}
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {product.price === 0 ? "Ücretsiz" : `${product.price} ₺`}
                    </td>

                    {/* Durum */}
                    <td className="px-6 py-4">
                      {isUnpublished ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                          <Archive size={12} />
                          Yayından Kaldırıldı
                        </div>
                      ) : product.isApproved ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                          <CheckCircle size={12} />
                          Yayında
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-600 animate-pulse"></span>
                          İnceleniyor
                        </div>
                      )}
                    </td>

                    {/* İstatistik */}
                    <td className="px-6 py-4 text-center text-xs font-bold text-gray-600">
                        {product._count.orders} Adet
                    </td>

                    {/* Butonlar */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                          
                          {/* Düzenle */}
                          <Link 
                            href={`/dashboard/products/${product.id}/edit`}
                            className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-black hover:text-white transition"
                          >
                            <Edit size={16} />
                          </Link>

                          {/* SİL / ARŞİVLE BUTONU */}
                          {/* Sadece hala aktifse gösteriyoruz */}
                          {!isUnpublished && (
                              <form action={deleteProduct}>
                                <input type="hidden" name="productId" value={product.id} />
                                <button 
                                  type="submit"
                                  className="p-2 border border-gray-200 rounded-lg text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition cursor-pointer"
                                  title="Yayından Kaldır / Sil"
                                  onClick={(e) => {
                                      const msg = hasSales 
                                        ? "Bu ürün daha önce satıldığı için tamamen silinmeyecek, sadece YAYINDAN KALDIRILACAK (Yeni alıcılar göremeyecek). Onaylıyor musunuz?"
                                        : "Bu ürünü tamamen silmek istediğinize emin misiniz?";
                                      if(!confirm(msg)) e.preventDefault();
                                  }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </form>
                          )}

                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}