// src/lib/api.js

const BASE_URL = "http://127.0.0.1:8000"; // Use IP instead of 'localhost'

export async function getPosts() {
  try {
    const res = await fetch(`${BASE_URL}/api/posts/`, { 
      next: { revalidate: 60 } 
    });

    if (!res.ok) {
      // Log more detail to help debug
      console.error(`Backend returned status: ${res.status}`);
      throw new Error('Failed to fetch posts');
    }
    return res.json();
  } catch (error) {
    // This catches ECONNREFUSED and network errors
    console.error("Fetch failed:", error.message);
    throw error;
  }
}

// src/lib/api.js
// const BASE_URL = "http://27.0.0.1:8000";

export async function getPostBySlug(slug) {
  try {
    // Note: Use BASE_URL + /api/posts/ + slug + /
    const url = `${BASE_URL}/api/posts/${slug}/`;
    console.log("Fetching from:", url); // This will show in your terminal

    const res = await fetch(url, { 
      cache: 'no-store' // Disable cache temporarily to ensure you see fresh data
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}