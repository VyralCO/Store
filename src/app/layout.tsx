import type { Metadata } from "next";
import {
  Saira as SairaFont,
  Space_Mono as SpaceMonoFont,
} from "next/font/google";
import "./globals.css";

const saira = SairaFont({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "500", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const spaceMono = SpaceMonoFont({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VYRAL — O HYPE VIRA ROUPA",
  description: "E-commerce de streetwear oversized da marca VYRAL",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${saira.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-void text-white">
        {children}
      </body>
    </html>
  );
}
