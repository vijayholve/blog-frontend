import { buildSiteUrl } from "../lib/site";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: buildSiteUrl("/sitemap.xml"),
  };
}
