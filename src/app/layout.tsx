// Ruta: src/app/layout.tsx
import QueryProvider from "@/providers/QueryProvider";
import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "UPDS - Sistema de Reserva de Laboratorios",
  description: "Gestión y reserva de laboratorios de computación UPDS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("font-sans", geist.variable)}>
      {/* Inyectamos la variable de la fuente en el body */}
      <body className={`${inter.variable} font-sans antialiased bg-[#F8FAFC]`}>
        <QueryProvider>
          {children}
        </QueryProvider>

      </body>
    </html>
  );
}