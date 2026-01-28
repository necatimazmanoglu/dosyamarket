import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { 
  SignInButton, 
  SignUpButton, 
  UserButton 
} from "@clerk/nextjs";
import { 
  Home, 
  Compass, 
  UploadCloud, 
  Library, 
  Store, 
  ShieldCheck 
} from "lucide-react";
import MobileMenu from "./MobileMenu";

export default async function Navbar() {
  // --- GÜVENLİK DÜZELTMESİ ---
  // API hatası olursa site çökmesin diye try-catch kullanıyoruz.
  let user = null;
  try {
    user = await currentUser();
  } catch (error) {
    console.error("Clerk kullanıcı hatası (Geçici olabilir):", error);
    // Hata durumunda user null kalır, site "Giriş Yap" modunda açılır.
  }
  // ---------------------------

  const userEmail = user?.emailAddresses[0]?.emailAddress;

  const ADMIN_EMAIL = "necatimazmanoglu@gmail.com"; 
  const isAdmin = userEmail === ADMIN_EMAIL;

  let isSeller = false;
  if (user) {
    try {
      const sellerProfile = await prisma.sellerProfile.findUnique({
        where: { userId: user.id },
      });
      if (sellerProfile) isSeller = true;
    } catch (error) {
      console.error("Profil kontrol hatası:", error);
    }
  }

  // Ortak link stili
  const baseLinkClass = "flex items-center gap-2 px-4 py-2 rounded-full font-bold text-gray-600 transition-all group";

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          
          {/* --- LOGO KISMI --- */}
          <div className="flex items-center gap-8 xl:gap-12">
            <Link href="/" className="flex flex-col hover:opacity-90 transition group">
              <span className="text-3xl font-black tracking-tight leading-none">
                <span className="text-gray-900">Dosya</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Market</span>
              </span>
              <span className="text-[11px] font-bold text-indigo-600 tracking-widest uppercase mt-0.5 ml-0.5">
                Dijital Pazaryeri
              </span>
            </Link>
            
            {/* --- MASAÜSTÜ MENÜ LİNKLERİ (Sadece PC'de görünür) --- */}
            <div className="hidden md:flex items-center gap-6">
              
              <Link href="/" className={`${baseLinkClass} hover:text-blue-600 hover:bg-blue-50`}>
                <Home size={18} className="text-blue-500 group-hover:scale-110 transition-transform" />
                Ana Sayfa
              </Link>

              <Link href="/explore" className={`${baseLinkClass} hover:text-violet-600 hover:bg-violet-50`}>
                <Compass size={18} className="text-violet-500 group-hover:scale-110 transition-transform" />
                Keşfet
              </Link>
              
              {/* Kullanıcı varsa menüleri göster */}
              {user && (
                <>
                  <Link href="/products/new" className={`${baseLinkClass} hover:text-emerald-600 hover:bg-emerald-50`}>
                    <UploadCloud size={18} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                    PDF Sat
                  </Link>

                  <Link href="/dashboard/library" className={`${baseLinkClass} hover:text-amber-600 hover:bg-amber-50`}>
                    <Library size={18} className="text-amber-500 group-hover:scale-110 transition-transform" />
                    Kütüphanem
                  </Link>
                  
                  {isSeller && (
                    <Link href="/dashboard/products" className={`${baseLinkClass} hover:text-rose-600 hover:bg-rose-50`}>
                      <Store size={18} className="text-rose-500 group-hover:scale-110 transition-transform" />
                      Satıcı Paneli
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* --- SAĞ TARAF --- */}
          <div className="flex items-center gap-6">
            
            {/* Admin Linki */}
            {isAdmin && (
               <Link href="/dashboard/admin" className="hidden lg:flex items-center gap-2 px-5 py-3 rounded-full bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-all shadow-lg hover:-translate-y-0.5">
                 <ShieldCheck size={16} />
                 Admin
               </Link>
            )}

            {/* Mobil Menü */}
            <MobileMenu isSeller={isSeller} isAdmin={isAdmin} />

            {/* --- MASAÜSTÜ AUTH BUTONLARI --- */}
            <div className="hidden md:flex items-center gap-4">
              {!user ? (
                // KULLANICI YOKSA -> GİRİŞ / KAYIT BUTONLARI
                <>
                  <SignInButton mode="modal">
                    <button className="text-gray-600 hover:text-black font-bold text-lg px-6 py-3 hover:bg-gray-100 rounded-full transition-all">
                      Giriş Yap
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-lg px-8 py-3.5 rounded-full transition-all hover:scale-105 shadow-xl shadow-purple-200">
                      Kayıt Ol
                    </button>
                  </SignUpButton>
                </>
              ) : (
                // KULLANICI VARSA -> PROFİL
                <div className="flex items-center gap-4 pl-6 border-l border-gray-200 h-12">
                   <div className="flex flex-col items-end hidden sm:flex">
                     <span className="text-base font-bold text-gray-900">{user?.firstName}</span>
                     <span className="text-xs text-gray-400 font-bold uppercase tracking-wide">Hesabım</span>
                   </div>
                   <UserButton 
                     afterSignOutUrl="/"
                     appearance={{
                       elements: {
                         avatarBox: "w-12 h-12 border-2 border-white shadow-lg ring-2 ring-gray-50 hover:scale-105 transition-transform"
                       }
                     }}
                   />
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}