// src/app/page.jsx
import { getPosts } from '@/lib/api';
import BlogCard from '@/components/ui/BlogCard';
import SectionHeader from '@/components/ui/SectionHeader';
import FeaturedCard from '@/components/ui/FeaturedCard';
import Newsletter from '@/components/ui/Newsletter';

export default async function HomePage() {
  const posts = await getPosts();
  const featuredPost = posts[0]; // Take the latest post as featured
  const remainingPosts = posts.slice(1); // The rest go into the list

  return (
    <main className="min-h-screen bg-white">
      {/* 1. Global Navigation Background Decoration */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-slate-50 to-white pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-24">
        
        {/* 2. Hero Header */}
        <header className="mb-20 animate-fade-in">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-6">
            The Archive<span className="text-blue-600">.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-xl font-medium leading-relaxed">
            Curated thoughts on engineering, minimalist design, and the future of the web.
          </p>
        </header>

        {/* 3. Featured Section */}
        {featuredPost && (
          <section className="mb-24 animate-slide-up">
            <SectionHeader title="Latest Publication" subtitle="Our most recent deep dive" />
            <FeaturedCard post={featuredPost} />
          </section>
        )}

        {/* 4. Posts Grid / List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <section className="lg:col-span-2 space-y-6">
            <SectionHeader title="Recent Stories" />
            {remainingPosts.length > 0 ? (
              remainingPosts.map((post) => (
                <BlogCard 
                  key={post.id}
                  title={post.title}
                  excerpt={post.excerpt}
                  slug={post.slug}
                  date={new Date(post.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                />
              ))
            ) : (
              !featuredPost && <p className="text-slate-400">No stories found yet.</p>
            )}
          </section>

          {/* 5. Sidebar Components */}
          <aside className="space-y-12">
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-widest text-xs">About the author</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Vijay Kumar is a software engineer exploring the intersection of clean code and human-centered design.
              </p>
            </div>
            
            <div className="sticky top-24">
               <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">Categories</h4>
               <div className="flex flex-wrap gap-2">
                 {['Engineering', 'Design', 'AI', 'Fullstack'].map(cat => (
                   <span key={cat} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium hover:border-blue-500 hover:text-blue-500 transition-all cursor-pointer">
                     {cat}
                   </span>
                 ))}
               </div>
            </div>
          </aside>
        </div>

        {/* 6. Footer CTA */}
        <Newsletter />
      </div>
    </main>
  );
}