import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClearCare | Discharge instructions, made clear",
  description:
    "Turn dense discharge paperwork into a prioritized, plain-language, source-linked care plan.",
  applicationName: "ClearCare",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "ClearCare",
    description: "Source-linked discharge instructions, made easier to understand.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0e2338",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
