// src/app/blog/[slug]/page.jsx
import { getPostBySlug } from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Generates SEO metadata dynamically for search engines
 */
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | MyBlog`,
    description: post.excerpt,
  };
}

export default async function BlogPost({ params }) {
  // Await params as required in Next.js 15+
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const post = await getPostBySlug(slug);

  // Trigger 404 if post doesn't exist
  if (!post) notFound();

  /**
   * FIX: Relative image paths in Markdown
   * Django saves images as /media/..., but Next.js needs the full URL.
   * This handles images inserted directly into the Markdown content.
   */
  const fixedContent = post.content.replaceAll(
    'src="/media/',
    'src="http://127.0.0.1:8000/media/'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 selection:bg-blue-100">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <article className="relative">
        {/* Navigation Bar */}
        <div className="max-w-5xl mx-auto pt-8 pb-4 px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-all group font-medium"
          >
            <svg
              className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back to all posts</span>
          </Link>
        </div>

        {/* Hero Header Section */}
        <div className="max-w-5xl mx-auto py-8 md:py-16 px-4">
          <header className="text-center animate-fade-in">
            {/* Date Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-100 text-slate-600 text-sm font-semibold mb-8 uppercase tracking-widest">
              <svg
                className="w-4 h-4 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              {new Date(post.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-[1.1]">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl md:text-2xl text-slate-600 italic leading-relaxed max-w-3xl mx-auto font-light">
                {post.excerpt}
              </p>
            )}
          </header>

          {/* Featured Header Image */}
          {post.cover_image && (
            <div className="mt-16 group animate-slide-up">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-500 group-hover:scale-[1.01]">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-auto object-cover max-h-[700px]"
                />
                <div className="absolute inset-0 border-4 border-white/10 rounded-3xl pointer-events-none"></div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Body */}
        <div className="max-w-4xl mx-auto pb-24 px-4">
          <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-white/20 p-8 md:p-16 lg:p-20">
            {/* The 'prose' class from @tailwindcss/typography handles Markdown styling.
                Direct size overrides ensure # becomes massive, ## slightly smaller, etc.
            */}
            <div
              className="prose prose-slate prose-xl max-w-none 
              prose-headings:text-slate-900 prose-headings:font-extrabold
              prose-h1:text-6xl prose-h1:font-black prose-h1:mb-10 prose-h1:mt-16 first:prose-h1:mt-0
              prose-h2:text-5xl prose-h2:font-bold prose-h2:mt-16 prose-h2:mb-8
              prose-h3:text-4xl prose-h3:font-bold prose-h3:mt-12 prose-h3:mb-6
              prose-h4:text-3xl prose-h4:font-semibold prose-h4:mt-10 prose-h4:mb-4
              prose-h5:text-2xl prose-h5:font-semibold prose-h5:mt-8 prose-h5:mb-4
              prose-h6:text-xl prose-h6:font-semibold prose-h6:mt-6 prose-h6:mb-3
              prose-p:text-slate-700 prose-p:text-xl prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
              prose-strong:text-slate-900 prose-strong:font-bold
              prose-em:text-slate-700 prose-em:italic
              prose-ul:my-8 prose-ol:my-8
              prose-li:text-lg prose-li:text-slate-700 prose-li:my-2
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 
              prose-blockquote:bg-blue-50 prose-blockquote:py-4 prose-blockquote:px-6 
              prose-blockquote:rounded-r-xl prose-blockquote:my-8 prose-blockquote:text-slate-700
              prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-2 prose-code:py-1 
              prose-code:rounded prose-code:text-base prose-code:font-mono
              prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:p-6
              prose-img:rounded-2xl prose-img:shadow-2xl prose-img:my-10
              prose-hr:border-slate-200 prose-hr:my-12
              prose-table:border-collapse prose-table:my-8
              prose-th:bg-slate-100 prose-th:font-bold prose-th:text-slate-900 prose-th:p-4
              prose-td:border prose-td:border-slate-200 prose-td:p-4"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {fixedContent}
              </ReactMarkdown>
            </div>

            {/* Author Attribution Footer */}
            <div className="mt-20 pt-10 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  VK
                </div>
                <div>
                  <p className="text-slate-900 font-bold">Vijay Kumar</p>
                  <p className="text-slate-500 text-sm">Author & Developer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
