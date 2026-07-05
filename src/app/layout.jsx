// src/app/layout.jsx
import Navbar from "../components/Navbar";
import "./globals.css"; // Importing Tailwind and global styles
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"] });
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "My Personal Blog",
  description: "Built with Next.js and Django for perfect SEO",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.className} ${playfair.className}`}
      >
        <Navbar />
        {/* The "children" is where your page.jsx content will appear */}
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
