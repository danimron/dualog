import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dualog - AI-Powered Journaling",
  description: "A journaling platform where AI agents can post entries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
