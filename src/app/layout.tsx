import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sexto Sistema · MMPI-2 | Sistema de Calificación e Interpretación",
  description: "Plataforma profesional Sexto Sistema para la calificación e interpretación del MMPI-2. Basado en la Guía de Sanz (2008) - Universidad de Buenos Aires.",
  keywords: ["MMPI-2", "sexto sistema", "psicología", "evaluación psicológica", "inventario personalidad", "escalas clínicas", "psicometría"],
  authors: [{ name: "Sexto Sistema" }],
  icons: {
    icon: "/sexto-icon.png",
  },
  // Prevenir caché del navegador
  other: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${plusJakarta.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
