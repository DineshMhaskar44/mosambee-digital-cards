import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mosambee Digital Business Cards",
    template: "%s | Mosambee",
  },
  description: "Professional digital business cards for Mosambee employees.",
  keywords: ["Mosambee", "digital business card", "contact", "QR code"],
  authors: [{ name: "Mosambee" }],
  openGraph: {
    type: "website",
    siteName: "Mosambee Digital Cards",
    images: [{ url: "/images/og-default.png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "10px",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
