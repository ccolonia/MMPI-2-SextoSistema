import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sexto Sistema · MMPI-2 | Sistema de Calificación e Interpretación",
  description: "Plataforma profesional Sexto Sistema para la calificación e interpretación del MMPI-2. Basado en la Guía de Sanz (2008) - Universidad de Buenos Aires.",
  keywords: ["MMPI-2", "sexto sistema", "psicología", "evaluación psicológica", "inventario personalidad", "escalas clínicas", "psicometría"],
  authors: [{ name: "Sexto Sistema" }],
  icons: {
    icon: "/sexto-icon.png",
  },
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
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
