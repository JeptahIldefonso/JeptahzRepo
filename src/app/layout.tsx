import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JeptahzRepo | Computer Science & Engineering Archive",
  description:
    "An open, wholesome digital repository of computer science theory, production application showcases, course curricula, and engineering ideas.",
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
    <html lang="en">
      <body className="antialiased min-h-screen bg-bg text-fg selection:bg-fg selection:text-bg-raised">
        {children}
      </body>
    </html>
  );
}
