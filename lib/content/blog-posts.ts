export type BlogSection = {
  heading?: string;
  body: string;
  bullets?: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readMinutes: number;
  publishedAt: string;
  author: string;
  tags: string[];
  image: string;
  imageAlt: string;
  keyTakeaways: string[];
  sections: BlogSection[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "franchise-listing-seo-guide",
    title: "How to Write a Franchise Listing That Ranks on Google",
    excerpt:
      "Investors search before they enquire. Structure your iFranchise profile for discoverability, clarity, and conversion.",
    category: "SEO",
    readMinutes: 8,
    publishedAt: "2026-05-12",
    author: "iFranchise Growth Team",
    tags: ["SEO", "Listings", "Google"],
    image: "/assets/blog/seo.jpg",
    imageAlt: "Laptop showing search analytics for franchise marketing",
    keyTakeaways: [
      "Treat your listing like a landing page — investors Google before they enquire.",
      "Use industry, city, and investment range in the first 150 words.",
      "Complete profiles with real photos rank higher and convert better.",
      "Link your website and iFranchise listing both ways for stronger SEO.",
    ],
    sections: [
      {
        body: "Most franchise buyers start on Google — \"best food franchise under 20 lakhs\" or \"retail franchise in Hyderabad.\" Your iFranchise marketplace listing is not a form dump; it is a landing page that competes with every other brand in your category. The brands that win search also win trust.",
      },
      {
        heading: "Think like your investor, not like your marketing team",
        body: "Buyers search with plain language. They do not search for \"synergistic QSR solutions.\" They search for outcomes, budgets, and cities. Mirror that language in your headline, summary, and investment block.",
        bullets: [
          "Lead with category + geography: \"Quick-service café franchise — pan-India expansion.\"",
          "State investment range early — it filters serious leads and improves click-through.",
          "Answer \"why now\" in one sentence: demand, margins, or support advantage.",
        ],
      },
      {
        heading: "Structure content for Google and for humans",
        body: "Search engines reward clarity. Each major section of your listing should map to one intent: who you are, what it costs, what support exists, and where you are expanding.",
        bullets: [
          "Brand story: name, category, years operating, units live.",
          "Investment: franchise fee, setup range, royalty — no hidden gaps.",
          "Support: training days, launch help, marketing kit — specifics beat adjectives.",
          "Territories: named cities or regions, not \"all India\" unless true.",
        ],
      },
      {
        heading: "Images are SEO assets, not decorations",
        body: "Upload a crisp logo, real outlet photos, and product shots. Filenames and visuals that match your brand name reinforce relevance. Investors spend more time on listings with proof — and time-on-page is a ranking signal.",
        bullets: [
          "Avoid generic stock that could belong to any brand.",
          "Show the unit, the product, and the customer experience.",
          "Keep visual style consistent with your public website.",
        ],
      },
      {
        heading: "Build authority off the marketplace",
        body: "Your listing does not live in isolation. Link to it from your website footer, press pages, and founder LinkedIn. Keep business name, phone, and city spelling identical everywhere — inconsistent NAP data hurts local SEO.",
      },
      {
        heading: "Your 30-minute SEO audit on iFranchise",
        body: "Open Marketplace Preview and score yourself honestly:",
        bullets: [
          "Can a stranger explain your business in 10 seconds from the first paragraph?",
          "Are all required fields complete in Brand Health?",
          "Do photos look like your actual brand?",
          "Is investment information specific enough to pre-qualify leads?",
          "Does your expansion plan mention real cities?",
        ],
      },
    ],
  },
  {
    slug: "content-marketing-franchise-leads",
    title: "Content Marketing That Turns Browsers Into Franchise Leads",
    excerpt:
      "Blog posts, case studies, and founder stories build trust long before the first enquiry form is filled.",
    category: "Content",
    readMinutes: 7,
    publishedAt: "2026-05-08",
    author: "iFranchise Growth Team",
    tags: ["Content", "Leads", "Trust"],
    image: "/assets/blog/content.jpg",
    imageAlt: "Team planning content strategy around a table",
    keyTakeaways: [
      "Franchise buyers need proof — publish numbers, not promises.",
      "One franchisee story can become four content pieces with minimal extra work.",
      "FAQ-rich listings answer the questions investors ask at 11 p.m.",
      "Consistency beats viral moments for high-consideration purchases.",
    ],
    sections: [
      {
        body: "Franchise is a high-consideration purchase. A prospect may visit your listing five times before enquiring. Content bridges the gap between curiosity and confidence — especially when they have never heard of your brand outside your home city.",
      },
      {
        heading: "Publish proof, not promises",
        body: "Investors are risk managers. They want unit economics, support depth, and operator outcomes. Content that cites real timelines and real franchisee quotes outperforms glossy brand films for lead quality.",
        bullets: [
          "Average payback range (even a band is better than silence).",
          "Training length and who attends launch week.",
          "What happens when a unit underperforms — support response matters.",
        ],
      },
      {
        heading: "The one-story, four-format system",
        body: "Pick one franchisee win per quarter. Stretch it across channels so your message compounds without a full agency budget.",
        bullets: [
          "Long form: 600-word case study on your site.",
          "Short form: carousel with before/after metrics.",
          "Listing FAQ: answer \"What does success look like in year one?\"",
          "Email: three sentences + link back to your iFranchise profile.",
        ],
      },
      {
        heading: "Answer the midnight questions",
        body: "Strong listings anticipate objections. Write FAQ entries as if you are on a call with a skeptical investor:",
        bullets: [
          "What is the break-even timeline in a tier-2 city?",
          "Can I keep another business while operating?",
          "Who picks the site — me or the franchisor?",
          "What marketing support do I get in months 1–3?",
        ],
      },
      {
        heading: "Measure content by lead quality",
        body: "Vanity traffic is useless if enquiries are unqualified. Track which blog posts and case studies were viewed before form fills (UTM links help). Double down on topics that produce serious conversations, not just clicks.",
      },
    ],
  },
  {
    slug: "marketplace-profile-conversion",
    title: "7 Fixes That Improve Marketplace Profile Conversion",
    excerpt:
      "Small listing changes often lift enquiry quality more than ad spend. Audit your profile like a growth marketer would.",
    category: "Conversion",
    readMinutes: 6,
    publishedAt: "2026-04-28",
    author: "iFranchise Growth Team",
    tags: ["CRO", "Listings", "UX"],
    image: "/assets/blog/conversion.jpg",
    imageAlt: "Analytics dashboard showing growth metrics",
    keyTakeaways: [
      "Incomplete profiles signal risk — completion is your first conversion lever.",
      "Lead with a real hero image, not abstract stock art.",
      "Investment clarity pre-qualifies leads and saves your sales team time.",
      "Use Marketplace Preview before every submit — small UX gaps cost enquiries.",
    ],
    sections: [
      {
        body: "Traffic without conversion is wasted visibility. Before you increase ad spend, fix the profile investors land on. Most brands lose enquiries in the first eight seconds — unclear category, missing investment data, or a profile that looks half-finished.",
      },
      {
        heading: "Fix 1 — Complete every section",
        body: "Brand Health exists for a reason. Each missing field is a micro-objection: \"If they cannot finish a profile, how will they support my outlet?\" Aim for 100% before pushing external traffic.",
      },
      {
        heading: "Fix 2 — Hero image that proves the concept",
        body: "The first visual should answer \"what will my unit look like?\" A storefront, kitchen, or service bay beats abstract graphics. Match the image to your highest-performing real location.",
      },
      {
        heading: "Fix 3 — Investment range upfront",
        body: "Hide the numbers and you attract tourists, not buyers. A clear range filters curiosity and improves sales efficiency. If components vary by city, say so — transparency builds trust.",
      },
      {
        heading: "Fix 4 — Territory clarity",
        body: "Named cities and states reduce back-and-forth. \"Pan-India\" without detail feels like a call centre script. Show where you are actively recruiting versus where you are waitlisting.",
      },
      {
        heading: "Fix 5 — Support & training specifics",
        body: "Replace \"full support\" with curriculum: onboarding days, field visits, marketing templates, vendor introductions. Investors compare your support table against competitors — make yours concrete.",
      },
      {
        heading: "Fix 6 — Preview before publish",
        body: "Use Marketplace Preview inside the portal. Read on mobile. If anything feels vague or cramped, fix it before iFranchise review — resubmits slow your time-to-live.",
      },
      {
        heading: "Fix 7 — Respond to review feedback fast",
        body: "Review comments are free consulting. Address them within 24 hours, update the listing, and resubmit. Speed signals operational discipline — exactly what franchisees want in a partner.",
      },
    ],
  },
  {
    slug: "local-seo-multi-city-franchise",
    title: "Local SEO When You Expand Into New Cities",
    excerpt:
      "Multi-city franchise brands win local search with structured territory pages and consistent location data.",
    category: "SEO",
    readMinutes: 7,
    publishedAt: "2026-04-15",
    author: "iFranchise Growth Team",
    tags: ["Local SEO", "Expansion"],
    image: "/assets/blog/local-seo.jpg",
    imageAlt: "City skyline representing multi-city franchise expansion",
    keyTakeaways: [
      "Each target city is its own keyword cluster — write for local intent.",
      "Keep name, phone, and address spelling identical across every platform.",
      "Territory pages on your site should link to your iFranchise listing.",
      "Expansion plans in the portal should name real markets, not vague regions.",
    ],
    sections: [
      {
        body: "Expansion is a search opportunity. When you enter Pune, investors in Pune search locally first. Generic national copy misses those high-intent queries — and hands them to a competitor who bothered to be specific.",
      },
      {
        heading: "Build city-specific narratives",
        body: "In your expansion plan and on your website, explain why each city fits: demand drivers, competitive density, average ticket size, and unit format. Local relevance beats superlative adjectives.",
        bullets: [
          "Hyderabad: cite consumption patterns or corridor growth if true.",
          "Tier-2 strategy: explain format changes (smaller footprint, lower capex).",
          "Name trade areas you are prioritising for site selection.",
        ],
      },
      {
        heading: "Keep NAP data consistent",
        body: "NAP = Name, Address, Phone. Google cross-checks your website, maps listing, social profiles, and directories. A mismatched phone number or alternate brand spelling splits your authority.",
        bullets: [
          "Use one canonical brand name everywhere.",
          "Match city spellings (Bengaluru vs Bangalore — pick one).",
          "Link from city pages to the same iFranchise profile URL.",
        ],
      },
      {
        heading: "Local proof accelerates trust",
        body: "If you have a pilot or flagship in a region, showcase it. Photos with recognisable landmarks perform better in local investor conversations than studio shots.",
      },
      {
        heading: "Action plan for brand owners",
        body: "This week, pick three target cities. For each, draft a short paragraph: market opportunity, investment band, and support available at launch. Add those paragraphs to your iFranchise expansion section and mirror them on your site. That single exercise often unlocks long-tail search visibility within weeks.",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
