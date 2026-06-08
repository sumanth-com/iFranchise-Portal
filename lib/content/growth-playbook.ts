export type GrowthTip = {
  id: string;
  title: string;
  detail: string;
  impact: "High" | "Medium";
};

export type GrowthModule = {
  id: string;
  title: string;
  subtitle: string;
  icon: "search" | "target" | "share" | "chart";
  tips: GrowthTip[];
  actionHref: string;
  actionLabel: string;
};

export const GROWTH_MODULES: GrowthModule[] = [
  {
    id: "listing-seo",
    title: "Listing SEO Scorecard",
    subtitle: "Make your iFranchise profile discoverable on Google and inside our marketplace.",
    icon: "search",
    actionHref: "/dashboard/brands",
    actionLabel: "Edit my listing",
    tips: [
      {
        id: "seo-1",
        title: "Use industry + city in your description",
        detail:
          "Buyers search \"QSR franchise Mumbai\" not \"innovative opportunity.\" Front-load searchable phrases in your About section.",
        impact: "High",
      },
      {
        id: "seo-2",
        title: "Complete all profile fields",
        detail:
          "Google and marketplace algorithms favour complete pages. Empty investment or expansion blocks hurt ranking and trust.",
        impact: "High",
      },
      {
        id: "seo-3",
        title: "Add 5+ high-quality images",
        detail:
          "Listings with logo, store, and product photos earn longer visits — a strong engagement signal for SEO.",
        impact: "Medium",
      },
      {
        id: "seo-4",
        title: "Link your website ↔ marketplace profile",
        detail:
          "Cross-linking builds authority. Add your iFranchise URL to your site footer and link back from your listing.",
        impact: "Medium",
      },
    ],
  },
  {
    id: "conversion",
    title: "Conversion Optimisation",
    subtitle: "Turn profile views into qualified franchise enquiries.",
    icon: "target",
    actionHref: "/dashboard/marketplace-preview",
    actionLabel: "Preview as investor",
    tips: [
      {
        id: "cro-1",
        title: "Lead with investment clarity",
        detail:
          "Show min investment, franchise fee, and expected ROI in the first scroll. Hiding numbers increases bounce rate.",
        impact: "High",
      },
      {
        id: "cro-2",
        title: "Write for sceptical buyers",
        detail:
          "Address support, training, and exit terms. Serious franchisees compare 5–10 brands — transparency wins.",
        impact: "High",
      },
      {
        id: "cro-3",
        title: "Mobile-first preview",
        detail:
          "60%+ of research happens on phones. Check Marketplace Preview on mobile before you submit.",
        impact: "Medium",
      },
    ],
  },
  {
    id: "social-digital",
    title: "Digital & Social Amplification",
    subtitle: "Extend reach beyond the marketplace with owned and earned channels.",
    icon: "share",
    actionHref: "/dashboard/blog",
    actionLabel: "Read growth articles",
    tips: [
      {
        id: "soc-1",
        title: "Repurpose listing copy into LinkedIn posts",
        detail:
          "Turn your expansion plan into a 3-post series: opportunity, proof, call-to-action with link to your live listing.",
        impact: "High",
      },
      {
        id: "soc-2",
        title: "Collect franchisee testimonials",
        detail:
          "Short video or quote from an existing operator outperforms branded ads for franchise lead quality.",
        impact: "High",
      },
      {
        id: "soc-3",
        title: "Retarget website visitors",
        detail:
          "Install Meta and Google pixels on your site. Retarget visitors with \"View our franchise listing\" ads after launch.",
        impact: "Medium",
      },
    ],
  },
  {
    id: "analytics",
    title: "Measure & Iterate",
    subtitle: "World-class brands optimise weekly — not once at launch.",
    icon: "chart",
    actionHref: "/dashboard",
    actionLabel: "View dashboard",
    tips: [
      {
        id: "an-1",
        title: "Track listing completion % weekly",
        detail:
          "Use Brand Health on your dashboard. Every incomplete section is a leak in your acquisition funnel.",
        impact: "High",
      },
      {
        id: "an-2",
        title: "Review notification response time",
        detail:
          "Fast replies to iFranchise reviewer feedback get you live sooner — speed to market is a competitive advantage.",
        impact: "Medium",
      },
      {
        id: "an-3",
        title: "Benchmark against top categories",
        detail:
          "Study approved listings in your industry on Marketplace Preview. Note structure, visuals, and copy patterns.",
        impact: "Medium",
      },
    ],
  },
];

export const GROWTH_QUICK_WINS = [
  "Add target cities to your expansion plan — unlocks local SEO searches.",
  "Upload a PDF brochure — investors share it internally during decision meetings.",
  "Refresh gallery photos quarterly — stale visuals signal a stagnant brand.",
  "Set up Google Alerts for your brand name — monitor mentions and respond.",
  "Publish one founder story per month — builds E-E-A-T for organic search.",
] as const;
