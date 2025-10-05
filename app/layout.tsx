import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CondoSync - AI-Powered Condo Communication",
  description: "WhatsApp-first communication platform for Puerto Rico condominiums",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
