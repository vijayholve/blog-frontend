// src/app/blog/[slug]/page.jsx
import { getPostBySlug } from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  // Ensures images from the Django media folder load correctly
  const fixedContent = post.content.replaceAll(
    'src="/media/',
    'src="http://127.0.0.1:8000/media/'
  );

  return (
    <div className="min-h-screen bg-dark">
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/2 -left-24 w-[400px] h-[400px] bg-indigo-100/50 rounded-full blur-[100px]"></div>
      </div>

      <article className="relative w-full">
        {/* Minimal Floating Navigation */}
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/70 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full shadow-lg">
          <Link href="/" className="flex items-center gap-2 text-slate-800 font-bold text-sm group">
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Feed
          </Link>
        </nav>

        {/* Hero Section: Centered & Clean */}
        <header className="pt-32 pb-16 px-6 max-w-5xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-600/10 text-blue-600 text-xs font-bold uppercase tracking-[0.2em] mb-8">
            Published {new Date(post.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[1.05]">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Featured Cover: Edge-to-Edge feel */}
        {post.cover_image && (
          <div className="max-w-7xl mx-auto px-6 mb-20">
            <div className="relative aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
              <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        {/* Content Container */}
        <div className={`mx-auto ${post.is_html ? 'w-full px-0' : 'max-w-4xl px-6'} `}>
          <div className={`${post.is_html ? 'bg-transparent' : 'bg-white shadow-2xl rounded-[3rem] p-8 md:p-20 border border-slate-100'}`}>
            
            {post.is_html ? (
              /* --- AI GENERATED HTML MODE (Full Screen Power) --- */
              <div 
                className="w-full min-h-screen"
                dangerouslySetInnerHTML={{ __html: fixedContent }} 
              />
            ) : (
              /* --- STANDARD BLOG MODE (Readability Focused) --- */
              <div className="prose prose-slate prose-xl max-w-none 
                prose-headings:text-slate-900 prose-headings:font-black
                prose-h1:text-6xl prose-h2:text-5xl prose-h3:text-4xl
                prose-p:text-slate-600 prose-p:leading-[1.8]
                prose-a:text-blue-600 prose-strong:text-slate-900
                prose-blockquote:border-l-8 prose-blockquote:border-blue-600 prose-blockquote:bg-slate-50
                prose-img:rounded-[2rem] prose-img:shadow-2xl">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {fixedContent}
                </ReactMarkdown>
              </div>
            )}

            {/* Author Section (Only show for standard posts or add to HTML) */}
            {!post.is_html && (
              <div className="mt-24 pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl rotate-3 flex items-center justify-center text-white text-3xl font-black shadow-xl">
                    VK
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-slate-900">Vijay Kumar</h4>
                    <p className="text-slate-500">Software Architect & Tech Strategist</p>
                  </div>
                </div>
                <Link href="/" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-colors shadow-lg">
                  More Stories
                </Link>
              </div>
            )}
          </div>
        </div>
      </article>
      
      {/* Footer Branding */}
      
    </div>
  );
}