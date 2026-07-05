import { unstable_cache } from "next/cache";

const BASE_URL = "http://127.0.0.1:8000";
const DEFAULT_REVALIDATE_SECONDS = 60;
const CACHE_ENABLED = process.env.API_CACHE_ENABLED !== "false";
const REVALIDATE_SECONDS = Number(
  process.env.API_REVALIDATE_SECONDS ?? DEFAULT_REVALIDATE_SECONDS,
);

const revalidate =
  Number.isFinite(REVALIDATE_SECONDS) && REVALIDATE_SECONDS > 0
    ? REVALIDATE_SECONDS
    : DEFAULT_REVALIDATE_SECONDS;

async function fetchPosts() {
  const res = await fetch(`${BASE_URL}/api/posts/`);

  if (!res.ok) {
    console.error(`Backend returned status: ${res.status}`);
    throw new Error("Failed to fetch posts");
  }

  return res.json();
}

async function fetchPostBySlug(slug) {
  const url = `${BASE_URL}/api/posts/${slug}/`;
  console.log("Fetching from:", url);

  const res = await fetch(url);

  if (!res.ok) return null;
  return res.json();
}

export const getPosts = CACHE_ENABLED
  ? unstable_cache(fetchPosts, ["posts"], { revalidate })
  : fetchPosts;

export const getPostBySlug = CACHE_ENABLED
  ? unstable_cache(fetchPostBySlug, ["post-by-slug"], { revalidate })
  : fetchPostBySlug;

export async function getPublishedPosts() {
  const posts = await getPosts();
  return Array.isArray(posts) ? posts.filter((post) => post?.slug) : [];
}
