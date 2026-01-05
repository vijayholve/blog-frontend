// src/components/ui/FeaturedCard.jsx
import Link from 'next/link';

export default function FeaturedCard({ post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group relative block overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl transition-all hover:scale-[1.01]">
      <div className="aspect-[16/9] md:aspect-[21/9] w-full relative">
        {post.cover_image ? (
          <img src={post.cover_image} alt={post.title} className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
      </div>
      
      <div className="absolute bottom-0 p-8 md:p-12 w-full">
        <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-widest rounded-full mb-4">Featured Story</span>
        <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4 tracking-tighter">
          {post.title}
        </h2>
        <p className="text-slate-300 text-lg md:text-xl max-w-2xl line-clamp-2 italic font-light">
          {post.excerpt}
        </p>
      </div>
    </Link>
  );
}