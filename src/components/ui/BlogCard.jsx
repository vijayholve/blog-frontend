// src/components/ui/BlogCard.jsx
import Link from "next/link";

export default function BlogCard({ title, excerpt, slug, date }) {
  // Calculate estimated read time (rough estimation: 200 words per minute)
  const wordCount = excerpt?.split(" ").length || 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 50));

  return (
    <article className="group/card">
      {/* Meta Information Bar */}
      <div className="flex items-center gap-4 mb-4">
        <time className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {date}
        </time>
        <span className="text-slate-300">•</span>
        <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          {readTime} min read
        </span>
      </div>

      {/* Title with stunning hover effect */}
      <Link href={`/blog/${slug}`} className="block mb-4">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight group-hover/card:text-transparent group-hover/card:bg-clip-text group-hover/card:bg-gradient-to-r group-hover/card:from-blue-600 group-hover/card:via-purple-600 group-hover/card:to-pink-600 transition-all duration-300">
          {title}
        </h2>
      </Link>

      {/* Excerpt with better typography */}
      <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-6 line-clamp-3">
        {excerpt}
      </p>

      {/* Action Row */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <Link
          href={`/blog/${slug}`}
          className="group/link inline-flex items-center gap-2 text-sm font-bold text-slate-900 group-hover/card:text-blue-600 transition-colors"
        >
          <span className="relative">
            Read Article
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover/link:w-full transition-all duration-300"></span>
          </span>
          <svg
            className="w-5 h-5 transform group-hover/link:translate-x-1 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>

        {/* Tags/Category Pills */}
        <div className="flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
          <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
            Featured
          </span>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -bottom-1 -right-1 w-32 h-32 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-full blur-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </article>
  );
}
