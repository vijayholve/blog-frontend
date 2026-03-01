// src/components/GraphicalExamples.jsx
"use client";
import { useState } from "react";

const ALL_EXAMPLES = [
  // ─── Technology ───
  {
    category: "Technology",
    icon: "📊",
    title: "Tech Stack Comparison",
    prompt:
      "Create a comparison dashboard of React vs Vue vs Angular vs Svelte showing performance benchmarks (bundle size, rendering speed), popularity stats (GitHub stars, npm downloads), learning curve ratings, and ecosystem size with bar charts, stat cards, and a comparison table",
  },
  {
    category: "Technology",
    icon: "📱",
    title: "Mobile OS Market Share",
    prompt:
      "Design an infographic showing mobile operating system market share from 2020-2026. Include a pie chart for current share, line chart for trends over time, device distribution by region bar chart, and key milestone timeline",
  },
  {
    category: "Technology",
    icon: "🔐",
    title: "Cybersecurity Threats",
    prompt:
      "Create a cybersecurity dashboard showing top attack types (ransomware, phishing, DDoS) with a bar chart, year-over-year incident growth line chart, cost of breaches stat cards, and a comparison table of security tools",
  },
  {
    category: "Technology",
    icon: "☁️",
    title: "Cloud Provider Comparison",
    prompt:
      "Design a cloud services comparison infographic for AWS vs Azure vs GCP. Include pricing comparison table, market share pie chart, service category bar charts, performance benchmark stats, and global data center count cards",
  },

  // ─── Business ───
  {
    category: "Business",
    icon: "💰",
    title: "Startup Funding Stages",
    prompt:
      "Create a startup ecosystem dashboard showing funding stages funnel chart (pre-seed to IPO), top funded sectors bar chart, success rate statistics with progress bars, and a comparison table of seed vs Series A vs Series B rounds with average valuations",
  },
  {
    category: "Business",
    icon: "📈",
    title: "Revenue Growth Model",
    prompt:
      "Design a SaaS business metrics dashboard showing MRR growth line chart, customer acquisition cost vs lifetime value comparison, churn rate trends, revenue breakdown pie chart by product line, and key financial stat cards",
  },
  {
    category: "Business",
    icon: "🏢",
    title: "Remote Work Statistics",
    prompt:
      "Create an infographic about remote work trends in 2026. Include productivity comparison bar chart (remote vs office), cost savings stat cards, employee satisfaction ratings, preferred work model pie chart, and top remote-friendly industries",
  },
  {
    category: "Business",
    icon: "🌐",
    title: "Global Economy Overview",
    prompt:
      "Design an economic overview dashboard showing GDP growth by region bar chart, inflation rates line chart, trade balance comparison, unemployment statistics, and key economic indicators stat cards for G20 nations",
  },

  // ─── Lifestyle ───
  {
    category: "Lifestyle",
    icon: "⏰",
    title: "Daily Time Allocation",
    prompt:
      "Create a lifestyle infographic showing how the average professional spends their 24 hours. Include a pie chart for time allocation, productivity peak hours line chart, screen time breakdown bar chart, and work-life balance score cards",
  },
  {
    category: "Lifestyle",
    icon: "📚",
    title: "Reading Habits 2026",
    prompt:
      "Design a reading habits dashboard showing books read per year by age group bar chart, preferred genres pie chart, digital vs physical books trend line, reading time statistics, and top platforms comparison table",
  },
  {
    category: "Lifestyle",
    icon: "🎮",
    title: "Gaming Industry Stats",
    prompt:
      "Create a gaming industry infographic with revenue by platform pie chart, player demographics bar chart, top genres popularity trends line chart, esports growth statistics, and gaming hours per week breakdown",
  },

  // ─── Travel ───
  {
    category: "Travel",
    icon: "✈️",
    title: "Tourism Recovery Data",
    prompt:
      "Design a global tourism recovery dashboard showing international arrivals line chart (2019-2026), top destinations bar chart, travel spending per region stat cards, tourism GDP contribution pie chart, and seasonal travel trends",
  },
  {
    category: "Travel",
    icon: "🌍",
    title: "Budget Travel Comparison",
    prompt:
      "Create a travel cost comparison infographic for 10 popular destinations. Include daily budget bar chart, accommodation cost comparison, food cost ratings, transport cost table, and overall value score cards",
  },
  {
    category: "Travel",
    icon: "🏖️",
    title: "Sustainable Tourism",
    prompt:
      "Design an eco-tourism infographic showing carbon footprint by transport mode bar chart, green-certified hotels growth line chart, top sustainable destinations, environmental impact comparison, and eco-friendly travel tips stat cards",
  },

  // ─── Food ───
  {
    category: "Food",
    icon: "🥗",
    title: "Nutrition Breakdown",
    prompt:
      "Create a daily nutrition dashboard showing macronutrient distribution pie chart, vitamin and mineral intake progress bars, calorie intake vs burn line chart, hydration tracking, and meal-by-meal breakdown stat cards",
  },
  {
    category: "Food",
    icon: "🍳",
    title: "World Cuisine Popularity",
    prompt:
      "Design a global cuisine popularity infographic with top 10 cuisines bar chart by country searches, ingredient usage comparison, restaurant count by cuisine type, food spending trends, and regional flavor profile comparison",
  },
  {
    category: "Food",
    icon: "🌱",
    title: "Plant-Based Market Growth",
    prompt:
      "Create an infographic about the plant-based food industry showing market size growth line chart, consumer adoption by age group bar chart, product category breakdown pie chart, investment trends, and taste satisfaction comparison vs traditional foods",
  },

  // ─── Health ───
  {
    category: "Health",
    icon: "💪",
    title: "Fitness Tracker Dashboard",
    prompt:
      "Create a personal fitness dashboard showing weekly workout progress bars by exercise type, calories burned line chart, heart rate zones pie chart, step count trends, body composition changes, and personal best stat cards",
  },
  {
    category: "Health",
    icon: "🧠",
    title: "Mental Health Statistics",
    prompt:
      "Design a mental health awareness infographic showing prevalence rates by condition bar chart, treatment access statistics, stress levels by profession, meditation benefits timeline, and key mental health stat cards with progress indicators",
  },
  {
    category: "Health",
    icon: "😴",
    title: "Sleep Quality Analysis",
    prompt:
      "Create a sleep analysis dashboard showing sleep stages breakdown pie chart, sleep duration trends line chart, sleep quality factors bar chart, optimal bedtime statistics, and sleep hygiene score cards with recommendations",
  },
  {
    category: "Health",
    icon: "💊",
    title: "Healthcare Costs",
    prompt:
      "Design a healthcare costs infographic comparing spending by country bar chart, insurance coverage breakdown pie chart, out-of-pocket expenses trends, preventive vs reactive care cost comparison, and key health spending stat cards",
  },

  // ─── Programming & Tech ───
  {
    category: "Programming & Tech",
    icon: "⚛️",
    title: "Framework Benchmarks",
    prompt:
      "Create a web framework performance dashboard comparing React, Next.js, Vue, Nuxt, Svelte, and Astro. Include build time bar chart, bundle size comparison, Lighthouse score stat cards, rendering speed line chart, and developer satisfaction ratings",
  },
  {
    category: "Programming & Tech",
    icon: "🐍",
    title: "Programming Language Trends",
    prompt:
      "Design a programming language popularity infographic showing TIOBE index trends line chart, GitHub repository count bar chart, salary comparison by language, learning curve ratings, and job market demand stat cards",
  },
  {
    category: "Programming & Tech",
    icon: "🗄️",
    title: "Database Performance",
    prompt:
      "Create a database comparison dashboard for PostgreSQL, MongoDB, Redis, MySQL, and DynamoDB. Include read/write speed benchmarks bar chart, use case comparison table, market share pie chart, and scalability ratings",
  },
  {
    category: "Programming & Tech",
    icon: "🐳",
    title: "DevOps Tools Landscape",
    prompt:
      "Design a DevOps lifecycle infographic showing CI/CD pipeline stages flowchart, tool comparison by category (GitHub Actions vs Jenkins vs GitLab CI), adoption rate bar chart, deployment frequency stats, and mean time to recovery line chart",
  },

  // ─── Artificial Intelligence ───
  {
    category: "Artificial Intelligence",
    icon: "🤖",
    title: "AI Market Growth",
    prompt:
      "Design an infographic showing global AI market growth from 2020 to 2030 with a line chart, key milestones timeline, top AI companies stat cards, investment by sector pie chart, and adoption rate by industry bar chart",
  },
  {
    category: "Artificial Intelligence",
    icon: "🧠",
    title: "LLM Model Comparison",
    prompt:
      "Create a Large Language Model comparison dashboard for GPT-5, Claude, Gemini, Llama 3, and Mistral. Include benchmark scores bar chart, parameter count comparison, pricing table, capability radar chart, and speed stat cards",
  },
  {
    category: "Artificial Intelligence",
    icon: "🎨",
    title: "AI in Creative Industries",
    prompt:
      "Design an infographic about AI adoption in creative fields showing usage rates by industry bar chart, tool popularity comparison, time saved statistics, quality perception surveys, and revenue impact stat cards for design, music, writing, and video",
  },
  {
    category: "Artificial Intelligence",
    icon: "🔬",
    title: "AI Research Trends",
    prompt:
      "Create an AI research dashboard showing papers published per year line chart, top research areas bar chart, funding distribution pie chart, breakthrough timeline, and country-wise contribution comparison with stat cards",
  },

  // ─── Design & UI/UX ───
  {
    category: "Design & UI/UX",
    icon: "🎨",
    title: "Design Tool Market",
    prompt:
      "Create a design tool comparison infographic for Figma vs Sketch vs Adobe XD vs Framer. Include market share pie chart, feature comparison table, pricing bar chart, user satisfaction ratings, and platform availability stat cards",
  },
  {
    category: "Design & UI/UX",
    icon: "📐",
    title: "UI Trends Dashboard",
    prompt:
      "Design a UI/UX trends dashboard for 2026 showing popular design patterns bar chart, color palette trends, typography usage statistics, component library adoption rates, and accessibility compliance progress bars",
  },
  {
    category: "Design & UI/UX",
    icon: "♿",
    title: "Web Accessibility Stats",
    prompt:
      "Create a web accessibility infographic showing WCAG compliance rates by industry bar chart, common accessibility issues pie chart, screen reader usage trends, color contrast failure statistics, and improvement timeline with milestone cards",
  },

  // ─── Software Engineering ───
  {
    category: "Software Engineering",
    icon: "🏗️",
    title: "System Architecture",
    prompt:
      "Create a system architecture infographic showing microservices vs monolith comparison table, request flow diagram, load balancing strategies, caching layers explanation, and scalability metrics stat cards for different architectures",
  },
  {
    category: "Software Engineering",
    icon: "🔄",
    title: "CI/CD Pipeline Stats",
    prompt:
      "Design a CI/CD metrics dashboard showing deployment frequency trends line chart, lead time for changes bar chart, failure rate statistics, mean time to recovery, and DevOps maturity comparison across organizations",
  },
  {
    category: "Software Engineering",
    icon: "🧪",
    title: "Testing Pyramid",
    prompt:
      "Create a software testing infographic showing the testing pyramid visualization, test coverage by type bar chart, bug detection rates comparison, cost of fixing bugs at each stage, and recommended tool comparison table",
  },
  {
    category: "Software Engineering",
    icon: "🔒",
    title: "Security Audit Dashboard",
    prompt:
      "Design a security audit metrics dashboard showing vulnerability severity distribution pie chart, OWASP Top 10 frequency bar chart, patch time trends line chart, security tool comparison table, and compliance score stat cards",
  },

  // ─── Digital Marketing & SEO ───
  {
    category: "Digital Marketing & SEO",
    icon: "🔍",
    title: "SEO Performance Dashboard",
    prompt:
      "Create an SEO analytics infographic showing organic traffic growth line chart, keyword ranking distribution bar chart, backlink quality metrics, Core Web Vitals scores, and top-performing pages comparison table with stat cards",
  },
  {
    category: "Digital Marketing & SEO",
    icon: "📱",
    title: "Social Media Analytics",
    prompt:
      "Design a social media comparison dashboard for Instagram, TikTok, LinkedIn, YouTube, and X. Include engagement rate bar chart, audience demographics pie charts, content type performance, posting time heatmap, and follower growth trends",
  },
  {
    category: "Digital Marketing & SEO",
    icon: "📧",
    title: "Email Campaign Metrics",
    prompt:
      "Create an email marketing dashboard showing open rate trends line chart, click-through rates by campaign type bar chart, best sending times heatmap, subject line A/B test results, and conversion funnel stat cards",
  },
  {
    category: "Digital Marketing & SEO",
    icon: "💰",
    title: "Ad Spend ROI Analysis",
    prompt:
      "Design a digital advertising ROI infographic comparing Google Ads, Meta Ads, LinkedIn Ads, and TikTok Ads. Include cost per acquisition bar chart, ROAS comparison, audience reach statistics, conversion rate trends, and budget allocation pie chart",
  },
];

const CATEGORIES = [
  "All",
  "Technology",
  "Business",
  "Lifestyle",
  "Travel",
  "Food",
  "Health",
  "Programming & Tech",
  "Artificial Intelligence",
  "Design & UI/UX",
  "Software Engineering",
  "Digital Marketing & SEO",
];

const CAT_COLORS = {
  Technology: { bg: "bg-blue-100", text: "text-blue-700" },
  Business: { bg: "bg-emerald-100", text: "text-emerald-700" },
  Lifestyle: { bg: "bg-amber-100", text: "text-amber-700" },
  Travel: { bg: "bg-cyan-100", text: "text-cyan-700" },
  Food: { bg: "bg-orange-100", text: "text-orange-700" },
  Health: { bg: "bg-rose-100", text: "text-rose-700" },
  "Programming & Tech": { bg: "bg-violet-100", text: "text-violet-700" },
  "Artificial Intelligence": { bg: "bg-purple-100", text: "text-purple-700" },
  "Design & UI/UX": { bg: "bg-pink-100", text: "text-pink-700" },
  "Software Engineering": { bg: "bg-indigo-100", text: "text-indigo-700" },
  "Digital Marketing & SEO": { bg: "bg-teal-100", text: "text-teal-700" },
};

export default function GraphicalExamples({ open, onClose, onSelectPrompt }) {
  const [activeCategory, setActiveCategory] = useState("All");

  if (!open) return null;

  const filtered =
    activeCategory === "All"
      ? ALL_EXAMPLES
      : ALL_EXAMPLES.filter((e) => e.category === activeCategory);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-5xl max-h-[85vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 px-8 pt-7 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <span>📊</span> Infographic Prompt Library
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {ALL_EXAMPLES.length} visual prompts — charts, dashboards & data
                visualizations
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition text-xl"
            >
              ✕
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-purple-700 text-white shadow-lg scale-105"
                    : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Grid */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((ex, i) => {
              const colors = CAT_COLORS[ex.category] || {
                bg: "bg-slate-100",
                text: "text-slate-700",
              };
              return (
                <button
                  key={i}
                  onClick={() => {
                    onSelectPrompt(ex.prompt);
                    onClose();
                  }}
                  className="text-left p-5 rounded-2xl border border-purple-100 hover:border-purple-300 bg-gradient-to-br from-white to-purple-50/30 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 shrink-0 rounded-xl ${colors.bg} flex items-center justify-center text-2xl`}
                    >
                      {ex.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
                        >
                          {ex.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1">
                        {ex.title}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                        {ex.prompt}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 shrink-0 text-slate-300 group-hover:text-purple-500 transition mt-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-8 py-4 border-t border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <span className="text-lg">💡</span>
            <p className="text-xs text-slate-600">
              <span className="font-bold">Tip:</span> Mention specific chart
              types (bar, pie, line) and data points you want visualized. The
              more specific, the better the infographic!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
