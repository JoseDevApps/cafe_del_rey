import "@/styles/globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Merienda, Azeret_Mono } from "next/font/google";
import { AppProviders } from "./providers";

const merienda = Merienda({
  subsets: ["latin"],
  variable: "--font-merienda",
  weight: ["400", "600", "700", "800"],
});

const azeretMono = Azeret_Mono({
  subsets: ["latin"],
  variable: "--font-azeret-mono",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Café del Rey",
    template: "%s | Café del Rey",
  },
  description:
    "Café de altura de Los Yungas (La Paz, Bolivia). Micro-lotes, tueste con calma y diseño editorial táctil.",
  openGraph: {
    title: "Café del Rey",
    description:
      "Café de altura de Los Yungas (La Paz, Bolivia). Micro-lotes, tueste con calma y diseño editorial táctil.",
    type: "website",
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const c = await cookies();
  const theme = c.get("ui.theme")?.value ?? "cafe-rey";
  const scale = c.get("ui.scale")?.value ?? "1";

  return (
    <html
      lang="es"
      data-theme={theme}
      style={{ ["--ui-scale" as any]: scale }}
      suppressHydrationWarning
      className={`${merienda.variable} ${azeretMono.variable}`}
    >
      <body className="font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
