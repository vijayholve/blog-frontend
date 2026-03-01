// src/components/PromptExamples.jsx
"use client";
import { useState } from "react";

const ALL_EXAMPLES = [
  // ─── Technology ───
  {
    category: "Technology",
    icon: "🤖",
    title: "AI in Healthcare",
    prompt:
      "Write a comprehensive guide about how artificial intelligence is transforming healthcare in 2026. Include specific examples of AI applications in diagnosis, treatment planning, drug discovery, and patient care. Discuss both benefits and ethical considerations.",
  },
  {
    category: "Technology",
    icon: "📱",
    title: "5G & IoT Revolution",
    prompt:
      "Create an in-depth article about how 5G connectivity is powering the IoT revolution in smart cities, autonomous vehicles, and industrial automation. Include real-world case studies, speed comparisons, and future predictions for 2026-2030.",
  },
  {
    category: "Technology",
    icon: "🔐",
    title: "Cybersecurity Trends",
    prompt:
      "Write about the top cybersecurity threats and defense strategies in 2026. Cover zero-trust architecture, AI-powered threat detection, ransomware evolution, quantum-safe encryption, and practical tips for businesses and individuals.",
  },
  {
    category: "Technology",
    icon: "☁️",
    title: "Cloud Computing",
    prompt:
      "Create a detailed guide about modern cloud computing architecture. Compare AWS vs Azure vs GCP, discuss serverless computing, edge computing, multi-cloud strategies, and cost optimization techniques with practical examples.",
  },

  // ─── Business ───
  {
    category: "Business",
    icon: "🏠",
    title: "Remote Work Mastery",
    prompt:
      "Write about effective strategies for managing remote and hybrid teams in 2026. Cover async communication, productivity measurement, virtual team building, digital tools comparison, and maintaining company culture remotely.",
  },
  {
    category: "Business",
    icon: "🚀",
    title: "Startup Validation",
    prompt:
      "Create a detailed guide for aspiring entrepreneurs on how to validate a business idea before investing. Include lean startup methodology, customer discovery, MVP development, A/B testing, and measuring product-market fit with real examples.",
  },
  {
    category: "Business",
    icon: "📊",
    title: "Data-Driven Decisions",
    prompt:
      "Write about building a data-driven culture in modern organizations. Cover business intelligence tools, KPI frameworks, data visualization best practices, predictive analytics, and how to avoid common data interpretation pitfalls.",
  },
  {
    category: "Business",
    icon: "💼",
    title: "Personal Branding",
    prompt:
      "Create a comprehensive guide to building a powerful personal brand in 2026. Cover LinkedIn optimization, content strategy, thought leadership, networking tactics, public speaking, and monetizing your expertise.",
  },

  // ─── Lifestyle ───
  {
    category: "Lifestyle",
    icon: "⏰",
    title: "Productivity Systems",
    prompt:
      "Write about proven productivity systems for busy professionals. Compare GTD, Pomodoro, time-blocking, and Eisenhower Matrix. Include digital tool recommendations, habit stacking techniques, and a 30-day implementation plan.",
  },
  {
    category: "Lifestyle",
    icon: "🧘",
    title: "Mindfulness & Meditation",
    prompt:
      "Create a comprehensive guide to mindfulness practices for beginners and advanced practitioners. Cover meditation techniques, breathing exercises, mindful eating, digital detox strategies, and the neuroscience behind mindfulness benefits.",
  },
  {
    category: "Lifestyle",
    icon: "📚",
    title: "Lifelong Learning",
    prompt:
      "Write about building a lifelong learning habit in the age of AI. Cover best online learning platforms, skill-stacking strategies, the T-shaped professional concept, learning techniques like spaced repetition, and creating a personal curriculum.",
  },
  {
    category: "Lifestyle",
    icon: "🏡",
    title: "Minimalist Living",
    prompt:
      "Create a guide to adopting minimalist living without extreme sacrifices. Cover decluttering methods like KonMari, digital minimalism, intentional spending, capsule wardrobes, and how minimalism improves mental clarity and financial freedom.",
  },

  // ─── Travel ───
  {
    category: "Travel",
    icon: "🌍",
    title: "Sustainable Travel",
    prompt:
      "Write a detailed guide about eco-friendly travel practices in 2026. Cover carbon-neutral flights, supporting local communities, responsible tourism certifications, sustainable accommodations, and off-the-beaten-path destinations that benefit from tourism.",
  },
  {
    category: "Travel",
    icon: "🎒",
    title: "Digital Nomad Guide",
    prompt:
      "Create a comprehensive guide for aspiring digital nomads. Cover best countries for remote work (visa programs, cost of living), coworking spaces, travel insurance, tax implications, essential gear, and maintaining relationships while traveling.",
  },
  {
    category: "Travel",
    icon: "✈️",
    title: "Budget Travel Hacks",
    prompt:
      "Write about smart budget travel strategies for 2026. Include flight booking tricks, accommodation hacks (house sitting, hostels, home exchange), free walking tours, travel credit card rewards, and how to eat well on a budget globally.",
  },
  {
    category: "Travel",
    icon: "🏔️",
    title: "Adventure Tourism",
    prompt:
      "Create a guide to the world's best adventure travel experiences. Cover trekking (Everest Base Camp, Inca Trail), diving hotspots, safari destinations, extreme sports locations, safety tips, and how to prepare physically for adventure travel.",
  },

  // ─── Food ───
  {
    category: "Food",
    icon: "🥗",
    title: "Healthy Meal Prep",
    prompt:
      "Create a comprehensive guide to weekly meal prep for busy professionals. Include 7-day meal plans for different diets (keto, Mediterranean, plant-based), batch cooking techniques, storage tips, macro-balanced recipes, and grocery shopping strategies.",
  },
  {
    category: "Food",
    icon: "🍳",
    title: "World Cuisines at Home",
    prompt:
      "Write about mastering international cuisines at home. Cover essential techniques for Italian, Japanese, Indian, Mexican, and Thai cooking. Include pantry staples for each cuisine, beginner recipes, and tips for authentic flavor profiles.",
  },
  {
    category: "Food",
    icon: "🌱",
    title: "Plant-Based Revolution",
    prompt:
      "Create an in-depth article about the plant-based food revolution. Cover nutritional science, protein myths, best plant-based products of 2026, restaurant trends, environmental impact comparison, and delicious recipes for meat-lovers transitioning.",
  },
  {
    category: "Food",
    icon: "☕",
    title: "Coffee & Tea Culture",
    prompt:
      "Write a comprehensive guide to specialty coffee and tea culture worldwide. Cover brewing methods (pour-over, espresso, matcha), bean origins, flavor profiles, home barista equipment, latte art basics, and the science behind perfect extraction.",
  },

  // ─── Health ───
  {
    category: "Health",
    icon: "💪",
    title: "Fitness for Beginners",
    prompt:
      "Write about creating a sustainable fitness routine from scratch. Cover progressive overload, compound exercises, cardio vs strength training, workout splits for beginners, recovery science, nutrition timing, and how to stay motivated with data tracking.",
  },
  {
    category: "Health",
    icon: "🧠",
    title: "Mental Health Toolkit",
    prompt:
      "Create an informative article about managing stress, anxiety, and burnout in modern life. Cover CBT techniques, journaling methods, when to seek therapy, workplace mental health, digital wellness, and building emotional resilience.",
  },
  {
    category: "Health",
    icon: "😴",
    title: "Sleep Optimization",
    prompt:
      "Write a science-backed guide to optimizing sleep quality. Cover sleep architecture, circadian rhythm hacking, bedroom environment setup, blue light management, supplements, sleep tracking technology, and techniques for shift workers.",
  },
  {
    category: "Health",
    icon: "🏃",
    title: "Running & Marathon Guide",
    prompt:
      "Create a comprehensive guide from couch to marathon. Cover proper running form, training plans (5K to marathon), injury prevention, nutrition for runners, gear selection, race day strategies, and mental toughness techniques.",
  },

  // ─── Programming & Tech ───
  {
    category: "Programming & Tech",
    icon: "⚛️",
    title: "React & Next.js Mastery",
    prompt:
      "Write a comprehensive guide to building production-ready apps with React 19 and Next.js 15. Cover Server Components, App Router, streaming SSR, data fetching patterns, state management, performance optimization, and deployment strategies.",
  },
  {
    category: "Programming & Tech",
    icon: "🐍",
    title: "Python for Everything",
    prompt:
      "Create a guide to Python's versatility in 2026. Cover web development (Django/FastAPI), data science (pandas/numpy), machine learning (PyTorch/scikit-learn), automation scripts, and API development with practical code examples for each domain.",
  },
  {
    category: "Programming & Tech",
    icon: "🗄️",
    title: "Database Architecture",
    prompt:
      "Write about modern database architecture decisions. Compare PostgreSQL vs MongoDB vs Redis vs DynamoDB, cover database sharding, replication, ACID vs BASE, ORMs, query optimization, and when to use SQL vs NoSQL with real-world scenarios.",
  },
  {
    category: "Programming & Tech",
    icon: "🐳",
    title: "Docker & Kubernetes",
    prompt:
      "Create a practical guide to containerization with Docker and orchestration with Kubernetes. Cover Dockerfile best practices, docker-compose, K8s deployments, services, ingress, helm charts, and CI/CD pipeline integration.",
  },

  // ─── Artificial Intelligence ───
  {
    category: "Artificial Intelligence",
    icon: "🤖",
    title: "LLM & Prompt Engineering",
    prompt:
      "Write a comprehensive guide to Large Language Models and prompt engineering in 2026. Cover GPT-5, Claude, Gemini comparison, chain-of-thought prompting, RAG systems, fine-tuning techniques, token optimization, and building AI-powered applications.",
  },
  {
    category: "Artificial Intelligence",
    icon: "🎨",
    title: "AI-Powered Creativity",
    prompt:
      "Create an article about AI transforming creative industries. Cover AI art generation (Midjourney, DALL-E 3), AI music composition, AI video editing, AI writing assistants, copyright implications, and how creatives can leverage AI as a collaborator.",
  },
  {
    category: "Artificial Intelligence",
    icon: "🏭",
    title: "AI in Industry",
    prompt:
      "Write about practical AI applications across industries in 2026. Cover manufacturing (predictive maintenance), finance (fraud detection), retail (recommendation engines), agriculture (crop monitoring), and logistics (route optimization) with ROI data.",
  },
  {
    category: "Artificial Intelligence",
    icon: "🔬",
    title: "AI Ethics & Safety",
    prompt:
      "Create a detailed guide about AI ethics, bias mitigation, and safety in 2026. Cover alignment problem, explainable AI (XAI), regulatory frameworks (EU AI Act), responsible AI development, deepfake detection, and building fair ML models.",
  },

  // ─── Design & UI/UX ───
  {
    category: "Design & UI/UX",
    icon: "🎨",
    title: "UI Design Systems",
    prompt:
      "Write about building scalable UI design systems in 2026. Cover atomic design methodology, Figma component libraries, design tokens, accessibility standards (WCAG 2.2), responsive design patterns, and maintaining consistency across large teams.",
  },
  {
    category: "Design & UI/UX",
    icon: "🧪",
    title: "UX Research Methods",
    prompt:
      "Create a comprehensive guide to UX research methods. Cover user interviews, usability testing, A/B testing, heatmap analysis, card sorting, journey mapping, personas creation, and how to synthesize research into actionable design decisions.",
  },
  {
    category: "Design & UI/UX",
    icon: "📐",
    title: "Design Trends 2026",
    prompt:
      "Write about the hottest UI/UX design trends in 2026. Cover glassmorphism evolution, AI-adaptive interfaces, spatial design for AR/VR, micro-interactions, dark mode optimization, variable fonts, 3D elements, and bento grid layouts with examples.",
  },
  {
    category: "Design & UI/UX",
    icon: "♿",
    title: "Accessible Design",
    prompt:
      "Create a practical guide to designing accessible digital products. Cover color contrast ratios, screen reader optimization, keyboard navigation, ARIA labels, cognitive load reduction, inclusive imagery, and testing tools for WCAG 2.2 AA compliance.",
  },

  // ─── Software Engineering ───
  {
    category: "Software Engineering",
    icon: "🏗️",
    title: "System Design",
    prompt:
      "Write a comprehensive guide to system design for scalable applications. Cover load balancing, caching strategies (Redis, CDN), message queues, microservices vs monolith, CAP theorem, database partitioning, and designing for 1M+ concurrent users.",
  },
  {
    category: "Software Engineering",
    icon: "🔄",
    title: "CI/CD Pipelines",
    prompt:
      "Create a guide to building modern CI/CD pipelines. Cover GitHub Actions, GitLab CI, Jenkins comparison, automated testing strategies, deployment strategies (blue-green, canary), infrastructure as code (Terraform), and monitoring with Grafana/Prometheus.",
  },
  {
    category: "Software Engineering",
    icon: "🧹",
    title: "Clean Code Practices",
    prompt:
      "Write about writing maintainable, clean code. Cover SOLID principles, design patterns (Factory, Observer, Strategy), code review best practices, refactoring techniques, technical debt management, documentation strategies, and testing pyramids.",
  },
  {
    category: "Software Engineering",
    icon: "🔒",
    title: "API Security",
    prompt:
      "Create a detailed guide to securing modern APIs. Cover OAuth 2.0 / OIDC, JWT best practices, rate limiting, input validation, CORS configuration, API gateway patterns, penetration testing, and OWASP API Security Top 10 with prevention strategies.",
  },

  // ─── Digital Marketing & SEO ───
  {
    category: "Digital Marketing & SEO",
    icon: "🔍",
    title: "SEO Masterclass",
    prompt:
      "Write a comprehensive SEO guide for 2026. Cover Google's latest algorithm updates, E-E-A-T optimization, technical SEO checklist, Core Web Vitals, AI-generated content policies, schema markup, link building strategies, and local SEO tactics.",
  },
  {
    category: "Digital Marketing & SEO",
    icon: "📱",
    title: "Social Media Strategy",
    prompt:
      "Create a guide to social media marketing in 2026. Cover platform-specific strategies (Instagram Reels, TikTok, LinkedIn, X/Twitter), content calendars, engagement metrics, influencer partnerships, paid ads optimization, and community building.",
  },
  {
    category: "Digital Marketing & SEO",
    icon: "📧",
    title: "Email Marketing",
    prompt:
      "Write about building high-converting email marketing campaigns. Cover list building, segmentation strategies, A/B testing subject lines, automation workflows, deliverability optimization, personalization with AI, and measuring ROI with key metrics.",
  },
  {
    category: "Digital Marketing & SEO",
    icon: "📝",
    title: "Content Marketing",
    prompt:
      "Create a guide to content marketing strategy in the AI era. Cover content pillars, topic clusters for SEO, repurposing content across platforms, measuring content ROI, AI-assisted content creation workflows, and building editorial calendars.",
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

export default function PromptExamples({ open, onClose, onSelectPrompt }) {
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
                <span>📝</span> Prompt Library
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {ALL_EXAMPLES.length} prompts across {CATEGORIES.length - 1}{" "}
                categories — click to use
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
                    ? "bg-slate-900 text-white shadow-lg scale-105"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                  className="text-left p-5 rounded-2xl border border-slate-100 hover:border-slate-300 bg-white hover:shadow-lg transition-all group"
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
                      className="w-5 h-5 shrink-0 text-slate-300 group-hover:text-blue-500 transition mt-1"
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
        <div className="shrink-0 px-8 py-4 border-t border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <span className="text-lg">💡</span>
            <p className="text-xs text-slate-600">
              <span className="font-bold">Tip:</span> Be specific about your
              audience, tone, and desired structure for best AI results. You can
              also write your own custom prompt!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
