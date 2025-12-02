import type React from "react";
import type { Metadata } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/stores/auth";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title:
    process.env.NEXT_PUBLIC_APP_NAME || "Sistem Pelaporan Prestasi Mahasiswa",
  description:
    "Sistem Pelaporan Prestasi Mahasiswa untuk mengelola dan melaporkan prestasi mahasiswa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body
        className={`${poppins.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="grow">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
