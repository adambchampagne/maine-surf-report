import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maine Surf Report — Southern Maine Conditions",
  description: "Real-time surf conditions, 7-day forecast, and spot recommendations for southern Maine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${quicksand.variable} antialiased`}>
      <body>
        <main className="mx-auto max-w-[920px] px-4 py-4">{children}</main>
      </body>
    </html>
  );
}
