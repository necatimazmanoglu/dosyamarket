"use client"; // <--- BU SATIR ÇOK ÖNEMLİ (Yoksa hata verir)

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface DeleteProductButtonProps {
  productId: string;
  hasSales: boolean;
}

export default function DeleteProductButton({ productId, hasSales }: DeleteProductButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    // Mesajı duruma göre belirle
    const confirmMessage = hasSales
      ? "Bu ürün satıldığı için tamamen silinmeyecek, sadece YAYINDAN KALDIRILACAK. Onaylıyor musunuz?"
      : "Bu ürünü tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.";

    if (!confirm(confirmMessage)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/seller/products/${productId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh(); // Sayfayı yenile
      } else {
        const data = await res.json();
        alert(data.error || "İşlem başarısız.");
      }
    } catch (error) {
      alert("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 border border-gray-200 rounded-lg text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition cursor-pointer"
      title={hasSales ? "Yayından Kaldır" : "Ürünü Sil"}
    >
      {loading ? (
        <span className="animate-spin h-4 w-4 block rounded-full border-2 border-current border-t-transparent"></span>
      ) : (
        <Trash2 size={16} />
      )}
    </button>
  );
}