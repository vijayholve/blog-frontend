// src/app/blog/[slug]/page.jsx
import { getPostBySlug } from "@/lib/api";

// This function handles the SEO (Meta Tags)
export async function generateMetadata({ params }) {
  const { slug } = params;
  const post = await getPostBySlug(slug);

  return {
    title: `${post.title} | My Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image_url], // Useful for social media previews
    },
  };
}

// This is the actual UI of the blog post
export default async function BlogPostPage({ params }) {
  const { slug } = params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <article className="max-w-3xl mx-auto p-8">
      <header className="mb-8">
        <h1 className="text-5xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-500 italic">Published on: {post.date}</p>
      </header>
      
      {/* Blog Content */}
      <div 
        className="prose lg:prose-xl" 
        dangerouslySetInnerHTML={{ __html: post.content }} 
      />
    </article>
  );
}