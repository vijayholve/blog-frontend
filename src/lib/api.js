// src/lib/api.js
const API_URL = "http://127.0.0.1:8000/api";

export async function getPosts() {
  const res = await fetch(`${API_URL}/posts/`, { 
    next: { revalidate: 60 } // Automatically refreshes the data every 60 seconds
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  return res.json();
}

// src/lib/api.js
const BASE_URL = "http://127.0.0.1:8000";

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