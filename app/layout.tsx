import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard";

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AC Learning",
  description: "AI Community Learning Space",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${prompt.className} bg-[#fff9f9] text-slate-800`}>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}