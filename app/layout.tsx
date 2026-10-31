import type { Metadata } from "next";
import "./globals.css";
import "./game.css";
import "./adaptly.css";
import "./rewards.css";

export const metadata: Metadata = {
  title: "Adaptly | Learning that moves with you",
  description: "Adaptive learning, one question at a time. Play Multiply Quest and discover your next level.",
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
