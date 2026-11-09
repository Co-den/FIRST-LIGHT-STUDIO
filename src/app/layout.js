import { Source_Sans_3 } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { site } from "@/data/site";

const source = Source_Sans_3({ subsets: ["latin"], weight: ["300", "400", "600", "700"], variable: "--font-source", display: "swap" });

export const metadata = {
  ...(site.url && { metadataBase: new URL(site.url) }),
  title: { default: `${site.brandName} | Original Comics, Animation and IP`, template: `%s | ${site.brandName}` },
  description: site.description,
  openGraph: { title: site.brandName, description: site.description, siteName: site.legalName, type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={source.variable}>
      <body className="bg-night text-white antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-sun focus:px-4 focus:py-2 focus:text-night">Skip to content</a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
