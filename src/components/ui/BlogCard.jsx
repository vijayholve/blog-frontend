// src/components/ui/BlogCard.jsx
import Link from 'next/link';

export default function BlogCard({ title, excerpt, slug, date }) {
  return (
    <div className="group border-b border-gray-100 py-8 transition-all hover:bg-gray-50/50 px-4 rounded-xl">
      <p className="text-sm text-gray-400 mb-2">{date}</p>
      <Link href={`/blog/${slug}`}>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight hover:text-blue-600 transition">
          {title}
        </h2>
      </Link>
      <p className="text-gray-600 mt-3 leading-relaxed max-w-2xl">
        {excerpt}
      </p>
      <Link 
        href={`/blog/${slug}`} 
        className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform"
      >
        Read Full Story →
      </Link>
    </div>
  );
}