import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "AC Learning",
  description: "AI-powered campus learning and booking system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}