// src/lib/api.js
const API_URL = "http://127.0.0.1:8000/api";

export async function getPostBySlug(slug) {
  try {
    const res = await fetch(`${API_URL}/posts/${slug}/`, { 
      next: { revalidate: 3600 } // Cache for 1 hour for better speed
    });
    
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}