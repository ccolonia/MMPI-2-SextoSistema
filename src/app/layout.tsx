import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MMPI-2 | Sistema de Calificación e Interpretación",
  description: "Sistema profesional para la calificación e interpretación del Inventario Multifásico de Personalidad de Minnesota-2 (MMPI-2). Basado en la Guía de Sanz (2008).",
  keywords: ["MMPI-2", "psicología", "evaluación psicológica", "inventario personalidad", "escalas clínicas", "psicometría"],
  authors: [{ name: "Sistema MMPI-2" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
