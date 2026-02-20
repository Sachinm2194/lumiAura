import type { Metadata } from "next";
import { Geist, Geist_Mono,Inclusive_Sans } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { CartProvider } from "@/contexts/CartContext";
import { CheckoutProvider } from "@/contexts/CheckoutContext";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import TopLoader from "@/components/core-components/top-loader";
import BottomNavigationFooter from "@/components/core-components/bottom-navigation-footer";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
 const inclusiveSans = Inclusive_Sans({
  weight: ["400"],
  display: "swap",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LumiAura GlowSkin",
  description: "LumiAura GlowSkin is a premium skincare brand that offers a wide range of products for all skin types. Our products are made with the highest quality ingredients and are designed to help you achieve the perfect skin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`antialiased ${inclusiveSans.className} `}
        suppressHydrationWarning={false}
        cz-shortcut-listen="true"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TopLoader />
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <CheckoutProvider>
                  <ToastContainer
                    position="top-right"
                    autoClose={4000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                  />
        {children}
                  <BottomNavigationFooter />
                </CheckoutProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
