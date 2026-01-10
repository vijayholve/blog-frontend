"use client";

export default function PromptExamples({ onSelectPrompt }) {
  const examplePrompts = [
    {
      category: "Technology",
      title: "AI & Machine Learning",
      prompt:
        "Write a comprehensive guide about how artificial intelligence is transforming healthcare in 2026. Include specific examples of AI applications in diagnosis, treatment planning, and patient care. Discuss both benefits and ethical considerations.",
      icon: "🤖",
    },
    {
      category: "Technology",
      title: "Web Development",
      prompt:
        "Create an in-depth article about modern web development best practices. Cover topics like responsive design, performance optimization, accessibility, and the latest frameworks. Include practical tips that developers can implement immediately.",
      icon: "💻",
    },
    {
      category: "Business",
      title: "Remote Work",
      prompt:
        "Write about effective strategies for managing remote teams in 2026. Include communication tools, productivity techniques, team building activities, and how to maintain work-life balance. Share actionable insights for both managers and team members.",
      icon: "🏠",
    },
    {
      category: "Business",
      title: "Entrepreneurship",
      prompt:
        "Create a detailed guide for aspiring entrepreneurs on how to validate a business idea before investing time and money. Include market research techniques, customer discovery methods, MVP development, and measuring product-market fit.",
      icon: "🚀",
    },
    {
      category: "Lifestyle",
      title: "Productivity",
      prompt:
        "Write about proven productivity techniques for busy professionals. Cover time management, prioritization frameworks like Eisenhower Matrix, habit formation, and tools for staying organized. Include both digital and analog methods.",
      icon: "⏰",
    },
    {
      category: "Lifestyle",
      title: "Mindfulness",
      prompt:
        "Create a comprehensive guide to incorporating mindfulness practices into daily life. Discuss meditation techniques, breathing exercises, mindful eating, and how to stay present in a digital world. Include scientific benefits and practical exercises.",
      icon: "🧘",
    },
    {
      category: "Health",
      title: "Fitness",
      prompt:
        "Write about creating a sustainable fitness routine that fits into a busy schedule. Cover different workout types, nutrition basics, recovery importance, and how to stay motivated. Include beginner-friendly exercises and progression strategies.",
      icon: "💪",
    },
    {
      category: "Health",
      title: "Mental Health",
      prompt:
        "Create an informative article about managing stress and anxiety in modern life. Discuss coping mechanisms, when to seek professional help, self-care practices, and the connection between physical and mental health. Include practical daily techniques.",
      icon: "🌱",
    },
    {
      category: "Travel",
      title: "Sustainable Travel",
      prompt:
        "Write a detailed guide about eco-friendly travel practices. Cover carbon footprint reduction, supporting local communities, responsible tourism, and how to choose sustainable accommodations. Include practical tips for every type of traveler.",
      icon: "🌍",
    },
    {
      category: "Food",
      title: "Healthy Eating",
      prompt:
        "Create a comprehensive article about building healthy eating habits without restrictive dieting. Discuss meal planning, intuitive eating, understanding nutrition labels, and making sustainable food choices. Include tips for cooking at home.",
      icon: "🥗",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          📝 Example Prompts
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Click any prompt below to use it, or create your own!
        </p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {examplePrompts.map((example, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(example.prompt)}
            className="w-full text-left p-4 bg-gradient-to-r from-slate-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 rounded-xl border border-slate-200 hover:border-blue-300 transition group"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{example.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                    {example.category}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs font-semibold text-gray-700">
                    {example.title}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                  {example.prompt}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span>💡</span> Tips for Great Prompts
        </h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Be specific about the topic and target audience</li>
          <li>• Request specific examples or statistics</li>
          <li>• Mention desired tone (professional, casual, etc.)</li>
          <li>• Specify structure (intro, main points, conclusion)</li>
          <li>• Request actionable insights or practical tips</li>
        </ul>
      </div>
    </div>
  );
}
