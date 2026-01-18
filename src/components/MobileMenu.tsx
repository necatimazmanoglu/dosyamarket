"use client"; // Bu satır etkileşim için şart

import { useState } from "react";
import Link from "next/link";
import { 
  Menu, X, Home, Compass, UploadCloud, Library, Store, ShieldCheck 
} from "lucide-react";
import { 
  SignInButton, SignUpButton, SignedIn, SignedOut, UserButton 
} from "@clerk/nextjs";

interface MobileMenuProps {
  isSeller: boolean;
  isAdmin: boolean;
}

export default function MobileMenu({ isSeller, isAdmin }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Link stili
  const linkClass = "flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-all";

  return (
    <div className="md:hidden flex items-center">
      {/* Profil Resmi (Giriş yapmışsa menü dışında da görünsün) */}
      <SignedIn>
        <div className="mr-4">
           <UserButton afterSignOutUrl="/" />
        </div>
      </SignedIn>

      {/* Hamburger Butonu */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Açılır Menü (Drawer) */}
      {isOpen && (
        <div className="absolute top-24 left-0 w-full bg-white border-b border-gray-200 shadow-xl py-4 px-6 flex flex-col gap-2 animate-in slide-in-from-top-5">
          
          <Link href="/" onClick={() => setIsOpen(false)} className={linkClass}>
            <Home size={20} /> Ana Sayfa
          </Link>

          <Link href="/explore" onClick={() => setIsOpen(false)} className={linkClass}>
            <Compass size={20} /> Keşfet
          </Link>

          {/* Sadece Giriş Yapanlar */}
          <SignedIn>
            <Link href="/products/new" onClick={() => setIsOpen(false)} className={linkClass}>
              <UploadCloud size={20} /> PDF Sat
            </Link>

            <Link href="/dashboard/library" onClick={() => setIsOpen(false)} className={linkClass}>
              <Library size={20} /> Kütüphanem
            </Link>

            {isSeller && (
              <Link href="/dashboard/products" onClick={() => setIsOpen(false)} className={linkClass}>
                <Store size={20} /> Satıcı Paneli
              </Link>
            )}

            {isAdmin && (
              <Link href="/dashboard/admin" onClick={() => setIsOpen(false)} className={linkClass}>
                <ShieldCheck size={20} /> Admin Paneli
              </Link>
            )}
          </SignedIn>

          {/* Giriş Yapmamışsa Butonlar */}
          <SignedOut>
            <div className="mt-4 flex flex-col gap-3">
              <SignInButton mode="modal">
                <button className="w-full py-3 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50">
                  Giriş Yap
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg">
                  Kayıt Ol
                </button>
              </SignUpButton>
            </div>
          </SignedOut>

        </div>
      )}
    </div>
  );
}