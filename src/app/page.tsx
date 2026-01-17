import Link from "next/link";
import { UploadCloud, Share2, Coins } from "lucide-react"; // İkonları ekledik

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      
      {/* --- HERO SECTION (Aynen Korundu) --- */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight mb-6 leading-tight">
             Dijital Ürünlerinizi <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-600">Kolayca Satın ve Alın</span>
           </h1>
           <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
             PDF kitaplar, şablonlar, eğitim setleri. Güvenli ödeme ile hemen başlayın.
           </p>
           
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link 
               href="/explore" 
               className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition shadow-lg hover:shadow-purple-200 hover:-translate-y-1"
             >
               Ürünleri Keşfet
             </Link>
             <Link 
               href="/dashboard/products/new" 
               className="bg-white text-gray-900 border-2 border-gray-200 px-8 py-4 rounded-xl font-bold text-lg hover:border-purple-600 hover:text-purple-600 transition hover:-translate-y-1"
             >
               Hemen Ürün Ekle
             </Link>
           </div>
        </div>
      </section>

      {/* --- YENİ BÖLÜM: NASIL ÇALIŞIR? (Mor Tema Uyumlu) --- */}
      <section className="py-24 bg-purple-50/50 relative overflow-hidden">
         {/* Arka plan süslemesi */}
         <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>

         <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-16 max-w-3xl mx-auto">
                <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                    Nasıl Çalışır? <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">3 Basit Adımda Başlayın</span>
                </h2>
                <p className="text-xl text-gray-500 leading-relaxed">
                    Platformumuzda dijital ürün satmak veya almak hiç bu kadar kolay olmamıştı.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-start">
               
               {/* Adım 1 */}
               <div className="bg-white p-8 rounded-3xl shadow-xl shadow-purple-100/50 border border-purple-100 relative group hover:-translate-y-2 transition-all duration-300 text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center shadow-sm mb-6 mx-auto group-hover:scale-110 transition-transform">
                    <UploadCloud className="text-purple-600 w-10 h-10" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-black text-2xl mb-4 text-gray-900">
                    1. Dosyanı Yükle
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    PDF, şablon veya eğitim setini saniyeler içinde yükle. Ürün detaylarını ve fiyatını belirle.
                  </p>
               </div>

               {/* Adım 2 */}
               <div className="bg-white p-8 rounded-3xl shadow-xl shadow-purple-100/50 border border-purple-100 relative group hover:-translate-y-2 transition-all duration-300 text-center mt-0 md:mt-8">
                  <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center shadow-sm mb-6 mx-auto group-hover:scale-110 transition-transform">
                    <Share2 className="text-purple-600 w-10 h-10" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-black text-2xl mb-4 text-gray-900">
                    2. Paylaş & Listele
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Ürünün anında mağazada listelensin. Sana özel linki kitlenle paylaşarak satışa başla.
                  </p>
               </div>

               {/* Adım 3 */}
               <div className="bg-white p-8 rounded-3xl shadow-xl shadow-purple-100/50 border border-purple-100 relative group hover:-translate-y-2 transition-all duration-300 text-center mt-0 md:mt-16">
                  <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center shadow-sm mb-6 mx-auto group-hover:scale-110 transition-transform">
                    <Coins className="text-purple-600 w-10 h-10" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-black text-2xl mb-4 text-gray-900">
                    3. Güvenle Kazan
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Her satıştan sonra ödemen güvenli altyapımızla hesabına yatsın. %0 riskle kazan.
                  </p>
               </div>

            </div>
         </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-32 text-center relative z-10 overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-purple-300 to-indigo-300 rounded-full blur-[120px] opacity-20 -z-10"></div>
         <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-black mb-8 tracking-tight text-gray-900">Hemen Başlamaya Hazır mısın?</h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                Binlerce kullanıcı arasına katıl. İster ürünlerini sat, ister yeni içerikler keşfet.
            </p>
            <Link href="/dashboard/products/new" className="bg-purple-600 text-white px-12 py-5 rounded-xl font-black text-xl hover:bg-purple-700 transition shadow-xl hover:shadow-purple-200 hover:-translate-y-1">
               Mağaza Aç (Ücretsiz)
            </Link>
         </div>
      </section>

    </div>
  );
}