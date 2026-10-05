import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kasbon — Catatan Utang Piutang",
  description: "Catat siapa berutang ke kamu, dan kamu berutang ke siapa.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
