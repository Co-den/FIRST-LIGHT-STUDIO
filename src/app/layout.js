import { Bangers, League_Spartan, Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { site } from "@/data/site";

const bangers = Bangers({ weight: "400", subsets: ["latin"], variable: "--font-bangers", display: "swap" });
const spartan = League_Spartan({ subsets: ["latin"], variable: "--font-spartan", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata = {
  ...(site.url && { metadataBase: new URL(site.url) }),
  title: { default: `${site.brandName} | Original Comics, Animation and IP`, template: `%s | ${site.brandName}` },
  description: site.description,
  openGraph: { title: site.brandName, description: site.description, siteName: site.legalName, type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${bangers.variable} ${spartan.variable} ${inter.variable}`}>
      <body className="bg-night text-white antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-sun focus:px-4 focus:py-2 focus:text-night">Skip to content</a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
