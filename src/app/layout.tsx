import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PWA } from "@/components/pwa";
export const metadata: Metadata = {
  title: "MediRoute — Hospital workspace",
  description:
    "Clinical triage and hospital flow coordination. Synthetic demonstration prototype.",
  manifest: "/manifest.webmanifest",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export const viewport: Viewport = {
  themeColor: "#920942",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{document.documentElement.dataset.theme=localStorage.getItem("medcipher-theme")==="dark"?"dark":"light"}catch{}',
          }}
        />
      </head>
      <body>
        {children}
        <PWA />
      </body>
    </html>
  );
}
