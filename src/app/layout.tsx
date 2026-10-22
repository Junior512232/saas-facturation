import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import InnerLayout from "@/components/layout/inner-layout";
import { Providers } from "@/components/providers";
import { NetworkManager } from "@/components/NetworkManager";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://iziflow.sn";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "iziFlow — Logiciel de Facturation, Caisse POS & Gestion Commerciale OHADA",
    template: "%s | iziFlow",
  },
  description:
    "La suite de gestion commerciale tout-en-un pour les entreprises et commerçants d'Afrique : Ventes, Caisse POS, Facturation certifiée avec cachet & signature, Stocks, Paie IPRES et encaissements Wave & Orange Money.",
  keywords: [
    "facturation senegal",
    "facture ohada",
    "logiciel de caisse dakar",
    "caisse enregistreuse pos",
    "gestion de stock afrique",
    "wave mobile money paiement",
    "orange money facture",
    "bulletin de paie ipres",
    "saas b2b senegal",
    "ninea rccm facture",
  ],
  authors: [{ name: "iziFlow Technologies", url: siteUrl }],
  creator: "iziFlow Technologies",
  publisher: "iziFlow Technologies",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_SN",
    url: siteUrl,
    siteName: "iziFlow",
    title: "iziFlow — Logiciel de Facturation & Gestion Commerciale OHADA",
    description:
      "Automatisez vos ventes, stocks et factures en Afrique de l'Ouest. Encaissez vos clients par Wave, Orange Money et CB en 1 clic.",
  },
  twitter: {
    card: "summary_large_image",
    title: "iziFlow — Logiciel de Facturation & Caisse POS OHADA",
    description:
      "La suite de gestion commerciale pensée pour l'Afrique de l'Ouest : Factures, Caisse POS, Stocks, Paie & Paiements Wave.",
    creator: "@iziflow",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex bg-background text-foreground" suppressHydrationWarning>
        <NetworkManager />
        <Providers>
          <InnerLayout>{children}</InnerLayout>
        </Providers>
      </body>
    </html>
  );
}
