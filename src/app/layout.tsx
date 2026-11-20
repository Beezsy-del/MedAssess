import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PWA } from "@/components/pwa";
export const metadata: Metadata = {
  title: "MedCipher — Hospital workspace",
  description:
    "Clinical triage and hospital flow coordination. Synthetic demonstration prototype.",
  manifest: "/manifest.webmanifest",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export const viewport: Viewport = {
  themeColor: "#651d38",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <PWA />
      </body>
    </html>
  );
}
