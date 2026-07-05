// src/lib/api.js

const BASE_URL = "http://127.0.0.1:8000"; // Use IP instead of 'localhost'

export async function generateAIContent(requirement) {
  const res = await fetch(`${BASE_URL}/api/generate-ai-content/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requirement }),
  });

  if (!res.ok) throw new Error("AI Generation failed");
  return res.json(); // Should return { generated_code: "..." }
}
