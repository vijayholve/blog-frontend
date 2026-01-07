// src/app/layout.jsx
import './globals.css'; // Importing Tailwind and global styles
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'My Personal Blog',
  description: 'Built with Next.js and Django for perfect SEO',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Navbar />
        {/* The "children" is where your page.jsx content will appear */}
        <main className="min-h-screen">
          {children}
        </main>
    
      </body>
    </html>
  );
}