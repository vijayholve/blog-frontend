// src/app/page.jsx
import { getPosts } from "@/lib/api";
import BlogCard from "@/components/ui/BlogCard";
import SectionHeader from "@/components/ui/SectionHeader";
import FeaturedCard from "@/components/ui/FeaturedCard";
import Newsletter from "@/components/ui/Newsletter";

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
            Curated thoughts on engineering, minimalist design, and the future
            of the web.
          </p>
        </header>

        {/* 3. Featured Section */}
        {featuredPost && (
          <section className="mb-24 animate-slide-up">
            <SectionHeader
              title="Latest Publication"
              subtitle="Our most recent deep dive"
            />
            <FeaturedCard post={featuredPost} />
          </section>
        )}

        {/* 4. Posts Grid / List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <section className="lg:col-span-2">
            <div className="mb-8 flex items-center justify-between">
              <SectionHeader title="Recent Stories" />
              <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                {remainingPosts.length} articles
              </div>
            </div>

            {remainingPosts.length > 0 ? (
              <div className="space-y-4">
                {remainingPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="group relative animate-slide-up"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: "both",
                    }}
                  >
                    {/* Decorative line number */}
                    <div className="absolute -left-12 top-8 hidden lg:block text-xs font-mono text-slate-300 group-hover:text-blue-500 transition-colors">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    {/* Card with enhanced design */}
                    <div className="relative bg-white border border-slate-200/60 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 hover:border-blue-300/50 overflow-hidden">
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-purple-50/0 to-pink-50/0 group-hover:from-blue-50/30 group-hover:via-purple-50/20 group-hover:to-pink-50/30 transition-all duration-500 pointer-events-none rounded-2xl"></div>

                      {/* Accent bar */}
                      <div className="absolute left-0 top-0 w-1 h-0 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 group-hover:h-full transition-all duration-500"></div>

                      <div className="relative">
                        <BlogCard
                          title={post.title}
                          excerpt={post.excerpt}
                          slug={post.slug}
                          date={new Date(post.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        />
                      </div>

                      {/* Corner decoration */}
                      <div className="absolute top-4 right-4 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg
                          viewBox="0 0 32 32"
                          fill="none"
                          className="w-full h-full text-blue-500"
                        >
                          <path
                            d="M8 24L24 8M24 8H12M24 8V20"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !featuredPost && (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                    <svg
                      className="w-8 h-8 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-400 text-lg">
                    No stories found yet.
                  </p>
                  <p className="text-slate-300 text-sm mt-2">
                    Check back soon for new content.
                  </p>
                </div>
              )
            )}
          </section>

          {/* 5. Sidebar Components */}
          <aside className="space-y-12">
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-widest text-xs">
                About the author
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Vijay Kumar is a software engineer exploring the intersection of
                clean code and human-centered design.
              </p>
            </div>

            <div className="sticky top-24">
              <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">
                Categories
              </h4>
              <div className="flex flex-wrap gap-2">
                {["Engineering", "Design", "AI", "Fullstack"].map((cat) => (
                  <span
                    key={cat}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium hover:border-blue-500 hover:text-blue-500 transition-all cursor-pointer"
                  >
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
