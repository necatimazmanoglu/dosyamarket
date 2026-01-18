import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react"; // İkonu lucide-react'ten çekelim, daha temiz olur

interface ExplorePageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const selectedCategory = params.category || "Hepsi";
  const searchQuery = params.q || "";

  // --- DÜZELTME BURADA YAPILDI ---
  // Artık sadece onaylı değil, aynı zamanda SİLİNMEMİŞ ürünleri getiriyoruz.
  const whereCondition: any = {
    isApproved: true,
    isDeleted: false, // <--- İşte sihirli satır bu! Silinenleri gizler.
  };

  if (selectedCategory !== "Hepsi") {
    whereCondition.category = selectedCategory;
  }

  if (searchQuery) {
    whereCondition.OR = [
      { title: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  const products = await prisma.product.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
    include: {
      seller: true,
    },
  });

  const categories = [
    "Hepsi", "Ders Notları", "Sınav Hazırlık", "E-Kitap",
    "Akademik", "Kılavuz", "Diğer",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Üst Arama Alanı */}
      <div className="bg-white border-b border-gray-200 py-8 px-4 sticky top-24 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
               <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dokümanları Keşfet 📚</h1>
               <p className="text-gray-500 text-sm mt-1">Binlerce akademik kaynak ve ders notu.</p>
            </div>
            
            <form className="w-full md:w-96 relative group">
              <input 
                name="q"
                defaultValue={searchQuery}
                type="text" 
                placeholder="Not veya kitap ara..." 
                className="w-full py-3.5 pl-5 pr-12 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-black focus:ring-4 focus:ring-gray-100 outline-none transition-all font-medium"
              />
              <button type="submit" className="absolute right-2 top-2 p-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors shadow-lg">
                <Search size={18} />
              </button>
            </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Kategoriler (Yatay Kaydırmalı Mobil Uyumlu) */}
        <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={cat === "Hepsi" ? "/explore" : `/explore?category=${cat}`}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? "bg-black text-white border-black shadow-lg shadow-gray-200"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Ürün Listesi */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4">📂</div>
            <h3 className="text-xl font-black text-gray-900">Sonuç Bulunamadı</h3>
            <p className="text-gray-500 mt-2 max-w-md">Aradığınız kriterlere uygun doküman henüz yüklenmemiş veya kaldırılmış olabilir.</p>
            {selectedCategory !== "Hepsi" && (
              <Link href="/explore" className="mt-6 px-6 py-3 bg-black text-white rounded-full font-bold text-sm hover:bg-gray-800 transition shadow-lg">
                Filtreleri Temizle
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
            {products.map((product) => (
              <Link href={`/products/${product.id}`} key={product.id} className="group flex flex-col h-full">
                
                {/* Kart Görseli */}
                <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden relative border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-300">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-2">
                         <span className="text-2xl">📄</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Kategori Etiketi */}
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-900 rounded-lg shadow-sm">
                    {product.category}
                  </span>

                  {/* Fiyat Etiketi (Görsel Üstü) */}
                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
                    {product.price === 0 ? "Ücretsiz" : `${product.price} ₺`}
                  </div>
                </div>
                
                {/* Kart Bilgileri */}
                <div className="mt-4 px-1">
                  <h3 className="font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors h-10">
                    {product.title}
                  </h3>
                  
                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                          {product.seller.shopName ? product.seller.shopName[0].toUpperCase() : "S"}
                       </div>
                       <p className="text-xs text-gray-500 font-medium truncate max-w-[100px]">
                         {product.seller.shopName || "Satıcı"}
                       </p>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                      İncele &rarr;
                    </span>
                  </div>
                </div>

              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}