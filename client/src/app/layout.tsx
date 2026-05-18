import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { FavoritesProvider } from "@/lib/FavoritesContext";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import StoreProvider from "@/store/storeProvider";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Digital Broker | Houses, Cars & Services",
  description: "Professional marketplace for houses, cars, and services in Ethiopia. List, discover, and transact with confidence.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} font-sans antialiased text-foreground`}
      >
        <StoreProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <FavoritesProvider>
              {children}
              <Toaster position="top-right" offset={72} />
            </FavoritesProvider>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
