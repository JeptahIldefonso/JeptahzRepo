import type { Metadata } from "next";
import { Cinzel_Decorative, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel_Decorative({
  subsets: ["latin"],
  weight: "900",
  display: "swap",
  variable: "--font-cinzel",
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "JEPTAH.Z — Full-Stack Developer & Computer Science Archive",
  description:
    "Personal portfolio and open repository of computer science theory, production applications, and software engineering builds by Jeptah Ashley Ildefonso.",
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
      className={`${cinzel.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased min-h-screen bg-bg text-fg selection:bg-fg selection:text-bg-raised font-sans relative">
        {children}
      </body>
    </html>
  );
}
