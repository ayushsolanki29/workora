import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { BackgroundTracker } from "@/components/background-tracker";
import { CookieConsent } from "@/components/cookie-consent";
import Script from "next/script";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Soseki",
  description: "All-in-one business operating platform for freelancers, consultants, and small agencies.",
  verification: {
    google: "g2zd7qYHgqu2qzAwP8FGpj_t3XsNuHH-VcKgmBfK9aU",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="t-page-fade min-h-full flex flex-col overflow-x-hidden">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KS9248KF"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-KS9248KF');
          `}
        </Script>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster richColors position="bottom-right" />
        <Suspense fallback={null}>
          <BackgroundTracker />
        </Suspense>
        <CookieConsent />
      </body>
    </html>
  );
}
