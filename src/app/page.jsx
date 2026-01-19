// src/app/page.jsx
import { getPosts } from "@/lib/api";
import BlogCard from "@/components/ui/BlogCard";
import SectionHeader from "@/components/ui/SectionHeader";
import FeaturedCard from "@/components/ui/FeaturedCard";
import Newsletter from "@/components/ui/Newsletter";

export default async function HomePage() {
  const posts = await getPosts();
  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <main className="min-h-screen bg-white">
      {/* Global Navigation Background Decoration */}
      <div className="absolute top-0 inset-x-0 h-[300px] sm:h-[500px] bg-gradient-to-b from-slate-50 to-white pointer-events-none -z-10" />

      <div className="w-full px-4 sm:px-6 pt-8 sm:pt-20 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Hero Header */}
          <header className="mb-12 sm:mb-20 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black tracking-tighter text-slate-900 mb-4 sm:mb-6 leading-tight">
              The Archive<span className="text-blue-600">.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 sm:text-slate-500 max-w-xl font-medium leading-relaxed">
              Curated thoughts on engineering, minimalist design, and the future
              of the web.
            </p>
          </header>

          {/* Featured Section */}
          {featuredPost && (
            <section className="mb-16 sm:mb-24 animate-slide-up">
              <SectionHeader
                title="Latest Publication"
                subtitle="Our most recent deep dive"
              />
              <FeaturedCard post={featuredPost} />
            </section>
          )}

          {/* Posts Grid / List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
            {/* Main Content */}
            <section className="lg:col-span-2">
              <div className="mb-6 sm:mb-8 flex items-center justify-between">
                <SectionHeader title="Recent Stories" />
                <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="hidden sm:inline">
                    {remainingPosts.length} articles
                  </span>
                </div>
              </div>

              {remainingPosts.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {remainingPosts.map((post, index) => (
                    <div
                      key={post.id}
                      className="group relative animate-slide-up"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animationFillMode: "both",
                      }}
                    >
                      {/* Decorative line number - Hidden on mobile */}
                      <div className="absolute -left-8 sm:-left-12 top-6 sm:top-8 hidden lg:block text-xs font-mono text-slate-300 group-hover:text-blue-500 transition-colors">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      {/* Card with enhanced design */}
                      <div className="relative bg-white border border-slate-200/60 rounded-lg sm:rounded-2xl p-4 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 hover:border-blue-300/50 overflow-hidden active:shadow-lg active:-translate-y-0.5">
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-purple-50/0 to-pink-50/0 group-hover:from-blue-50/30 group-hover:via-purple-50/20 group-hover:to-pink-50/30 transition-all duration-500 pointer-events-none rounded-lg sm:rounded-2xl"></div>

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
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          />
                        </div>

                        {/* Corner decoration - Hidden on mobile */}
                        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 w-6 sm:w-8 h-6 sm:h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
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
                  <div className="text-center py-12 sm:py-20">
                    <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-slate-100 mb-3 sm:mb-4">
                      <svg
                        className="w-6 sm:w-8 h-6 sm:h-8 text-slate-400"
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
                    <p className="text-slate-400 text-base sm:text-lg">
                      No stories found yet.
                    </p>
                    <p className="text-slate-300 text-xs sm:text-sm mt-2">
                      Check back soon for new content.
                    </p>
                  </div>
                )
              )}
            </section>

            {/* Sidebar Components */}
            <aside className="space-y-8 sm:space-y-12 mt-12 lg:mt-0">
              {/* About Section */}
              <div className="bg-slate-50 p-5 sm:p-8 rounded-lg sm:rounded-[2rem] border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-3 sm:mb-4 uppercase tracking-widest text-xs">
                  About the author
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Vijay Kumar is a software engineer exploring the intersection
                  of clean code and human-centered design.
                </p>
              </div>

              {/* Categories Section */}
              <div className="sticky top-20 sm:top-24">
                <h4 className="font-bold text-slate-900 mb-4 sm:mb-6 uppercase tracking-widest text-xs">
                  Categories
                </h4>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {["Engineering", "Design", "AI", "Fullstack"].map((cat) => (
                    <span
                      key={cat}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-full text-xs sm:text-sm font-medium hover:border-blue-500 hover:text-blue-500 transition-all cursor-pointer active:bg-blue-50"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          {/* Footer CTA */}
          <Newsletter />
        </div>
      </div>
    </main>
  );
}
