import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "Math Elevate | Online Tutoring Platform",
  description: "A premium online platform for learning mathematics in English and Arabic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // By default LTR. We can make a wrapper to switch this dynamically based on user setting or path.
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${cairo.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
