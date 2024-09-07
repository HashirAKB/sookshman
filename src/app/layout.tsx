import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner"
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sookshman",
  description: "Web based blockchain HD wallet",
  icons: [
    {
      rel: "icon",
      type: "image/png",
      url: "/sookshman.svg",
      media: "(prefers-color-scheme: light)",
    },
    {
      rel: "icon",
      type: "image/png",
      url: "/sookshman.svg",
      media: "(prefers-color-scheme: dark)",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Toaster/>
              {children}
          </ThemeProvider>
        </body>
    </html>
  );
}
