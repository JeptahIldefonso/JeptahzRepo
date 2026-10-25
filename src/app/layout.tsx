import type { Metadata } from "next";
import { Newsreader, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-editorial",
  style: ["normal", "italic"],
  display: "swap",
});

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://jeptahz-repo.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JeptahzRepo — Computer Science & Engineering Archive",
    template: "%s | JeptahzRepo",
  },
  description:
    "An open, editorial knowledge archive of computer science theory, production software showcases, university syllabi, and engineering ideas.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "JeptahzRepo",
    title: "JeptahzRepo — Computer Science & Engineering Archive",
    description:
      "An open, editorial knowledge archive of computer science theory, production software showcases, university syllabi, and engineering ideas.",
    images: [
      {
        url: "/banner.webp",
        width: 1200,
        height: 630,
        alt: "JeptahzRepo — Computer Science & Engineering Archive",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JeptahzRepo — Computer Science & Engineering Archive",
    description:
      "An open, editorial knowledge archive of computer science theory, production software showcases, university syllabi, and engineering ideas.",
    images: ["/banner.webp"],
  },
  icons: {
    icon: [
      { url: "/avatar.png", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/avatar.png",
    apple: "/avatar.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="antialiased min-h-screen bg-bg text-fg selection:bg-fg selection:text-bg-raised font-sans">
        {children}
      </body>
    </html>
  );
}
