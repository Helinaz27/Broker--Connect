import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { FavoritesProvider } from "@/lib/FavoritesContext";
import { Toaster } from "@/components/ui/sonner";
import StoreProvider from "@/store/storeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ChatProvider } from "@/components/chat/ChatWidget";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Digital Broker | Houses, Cars & Services",
  description:
    "Professional marketplace for houses, cars, and services in Ethiopia. List, discover, and transact with confidence.",
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
        className={`${plusJakarta.variable} font-sans antialiased text-foreground bg-background`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider>
            <AuthProvider>
              <ChatProvider>
                <FavoritesProvider>
                  <Header />
                  {children}
                  <Footer />
                  <Toaster position="top-right" offset={72} />
                </FavoritesProvider>
              </ChatProvider>
            </AuthProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
