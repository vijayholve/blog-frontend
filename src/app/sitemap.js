import { getPublishedPosts } from "../lib/postsApi";
import { buildSiteUrl } from "../lib/site";

const getPriority = (post) => {
  const updatedAt = post.updated_at || post.created_at;
  if (!updatedAt) return 0.7;

  const ageInDays = Math.max(
    0,
    (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  if (ageInDays <= 30) return 0.9;
  if (ageInDays <= 180) return 0.8;
  return 0.7;
};

export default async function sitemap() {
  const posts = await getPublishedPosts();

  return [
    {
      url: buildSiteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: buildSiteUrl("/create"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...posts.map((post) => ({
      url: buildSiteUrl(`/blog/${post.slug}`),
      lastModified: post.updated_at || post.created_at || new Date(),
      changeFrequency: "monthly",
      priority: getPriority(post),
    })),
  ];
}
