// Ruta: src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
    <html lang="es">
      {/* Inyectamos la variable de la fuente en el body */}
      <body className={`${inter.variable} font-sans antialiased bg-[#F8FAFC]`}>
        {children}
      </body>
    </html>
  );
}