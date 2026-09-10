import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import InnerLayout from "@/components/layout/inner-layout";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iziFacture - SaaS de facturation",
  description: "Gérez vos factures facilement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex bg-background text-foreground overflow-hidden" suppressHydrationWarning>
        <Providers>
          <InnerLayout>{children}</InnerLayout>
        </Providers>
      </body>
    </html>
  );
}
