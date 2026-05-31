import type { Metadata } from "next";
import { Inter, Noto_Sans_Ethiopic, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { FavoritesProvider } from "@/lib/FavoritesContext";
import { Toaster } from "@/components/ui/sonner";
import StoreProvider from "@/store/storeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ChatProvider } from "@/components/chat/ChatWidget";
import { LanguageProvider } from "@/i18n/LanguageProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const notoEthiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic", "latin"],
  variable: "--font-amharic",
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
        className={`${inter.variable} ${plusJakarta.variable} ${notoEthiopic.variable} font-sans antialiased text-foreground bg-background`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider>
            <LanguageProvider>
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
            </LanguageProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
