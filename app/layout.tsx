import type { Metadata } from "next";
import "./globals.css";
import "./game.css";

export const metadata: Metadata = {
  title: "Multiply Quest · Little steps. Big discoveries.",
  description: "A joyful adaptive multiplication adventure with clear insights for parents.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
