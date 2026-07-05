import { unstable_cache } from "next/cache";

const getPosts = unstable_cache(
  async (token) => {
    const res = await fetch("http://127.0.0.1:8000/api/my-posts/", {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    return res.json();
  },
  ["my-posts"], // cache key
  {
    revalidate: 1000, // cache for 60 seconds
  },
);

export default getPosts;
