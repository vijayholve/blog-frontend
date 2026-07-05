export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000";

export const buildSiteUrl = (path = "") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, SITE_URL).toString();
};
