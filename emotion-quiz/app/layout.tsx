import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Microsense - Trắc Nghiệm Cảm Xúc",
  description: "Ứng dụng trắc nghiệm thân thiện với trẻ em kết hợp phân tích cảm xúc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${poppins.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
