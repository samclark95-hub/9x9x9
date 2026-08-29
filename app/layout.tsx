import type { Metadata, Viewport } from "next";
import ServiceWorker from "@/components/ServiceWorker";
import "./globals.css";

export const metadata: Metadata = {
  title: "TKN KB Tracker",
  description: "9 beers. 9 hot dogs. 9 innings.",
  applicationName: "TKN KB Tracker",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "TKN KB",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    // iOS ignores the manifest icons; this link is what it actually uses.
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    // This Next version's appleWebApp only emits mobile-web-app-capable.
    // Older iOS still reads the apple- prefixed one, and §6 requires both.
    "apple-mobile-web-app-capable": "yes",
  },
  // The feed carries photos of identifiable people on a public URL; there is
  // no reason for it to appear in search results.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0e0a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
