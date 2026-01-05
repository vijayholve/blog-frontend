// src/components/Navbar.jsx
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="border-b bg-white sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          MyBlog
        </Link>
        <div className="space-x-6">
          <Link href="/" className="hover:text-blue-500 transition">Home</Link>
          <Link href="/about" className="hover:text-blue-500 transition">About</Link>
          {/* Add more links as you grow */}
        </div>
      </div>
    </nav>
  );
}