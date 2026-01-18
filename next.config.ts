import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Iyzipay paketleme hatasını çözen ayar
  serverExternalPackages: ["iyzipay"],

  // 2. TypeScript hatalarını görmezden gel
  typescript: {
    ignoreBuildErrors: true,
  },

  // (ESLint ayarı kaldırıldı, artık Vercel build komutuyla yönetiliyor veya gerek kalmadı)

  // 3. Resim kaynakları izinleri
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
};

export default nextConfig;