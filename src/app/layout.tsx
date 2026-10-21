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

export const metadata: Metadata = {
  title: "JeptahzRepo — Computer Science & Engineering Archive",
  description:
    "An open, editorial knowledge archive of computer science theory, production software showcases, university syllabi, and engineering ideas.",
  icons: {
    icon: "/favicon.ico",
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
