import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

// ── Get all active products (for store) ─────────────────────────
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("is_active", true))
      .collect();
    return products.sort((a, b) => (a.sort_order ?? 999999) - (b.sort_order ?? 999999));
  },
});

// ── Get all products including inactive (for admin) ──────────────
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const products = await ctx.db.query("products").collect();
    return products.sort((a, b) => (a.sort_order ?? 999999) - (b.sort_order ?? 999999));
  },
});

// ── Get single product by slug ───────────────────────────────────
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("slug"), slug))
      .first();
  },
});

// ── Get single product by id ─────────────────────────────────────
export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// ── File Upload: Generate Upload URL ─────────────────────────────
export const generateUploadUrl = mutation(async (ctx) => {
  await requireAdmin(ctx);
  return await ctx.storage.generateUploadUrl();
});

// ── Get File URL by Storage ID ───────────────────────────────────

// ── Create product ───────────────────────────────────────────────
export const create = mutation({
  args: {
    name:        v.string(),
    slug:        v.string(),
    category:    v.string(),
    short_desc:  v.string(),
    desc:        v.string(),
    price_usd:   v.number(),
    images:      v.array(v.string()),
    features:    v.array(v.string()),
    tech:        v.string(),
    filesize:    v.string(),
    is_active:   v.boolean(),
    is_featured: v.optional(v.boolean()),
    demo_url:    v.optional(v.string()),
    thumbnail_id:v.optional(v.id("_storage")),
    thumbnail_url:v.optional(v.string()),
    file_id:     v.optional(v.id("_storage")),
    file_url:    v.optional(v.string()),
    pdf_id:      v.optional(v.id("_storage")),
    pdf_url:     v.optional(v.string()),
    sort_order:  v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    if (args.sort_order === undefined) {
      const allProducts = await ctx.db.query("products").collect();
      const maxSortOrder = allProducts.reduce((max, p) => Math.max(max, p.sort_order || 0), 0);
      args.sort_order = maxSortOrder + 1;
    }

    return await ctx.db.insert("products", args);
  },
});

// ── Update product ───────────────────────────────────────────────
export const update = mutation({
  args: {
    id:          v.id("products"),
    name:        v.optional(v.string()),
    slug:        v.optional(v.string()),
    category:    v.optional(v.string()),
    short_desc:  v.optional(v.string()),
    desc:        v.optional(v.string()),
    price_usd:   v.optional(v.number()),
    images:      v.optional(v.array(v.string())),
    features:    v.optional(v.array(v.string())),
    tech:        v.optional(v.string()),
    filesize:    v.optional(v.string()),
    is_active:   v.optional(v.boolean()),
    is_featured: v.optional(v.boolean()),
    demo_url:    v.optional(v.string()),
    thumbnail_id:v.optional(v.id("_storage")),
    thumbnail_url:v.optional(v.string()),
    file_id:     v.optional(v.id("_storage")),
    file_url:    v.optional(v.string()),
    pdf_id:      v.optional(v.id("_storage")),
    pdf_url:     v.optional(v.string()),
    sort_order:  v.optional(v.number()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, fields);
  },
});

// ── Toggle active / hidden ───────────────────────────────────────
export const toggleActive = mutation({
  args: { id: v.id("products"), is_active: v.boolean() },
  handler: async (ctx, { id, is_active }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { is_active });
  },
});

// ── Delete product ───────────────────────────────────────────────
export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(id);
    if (existing) {
      await ctx.db.delete(id);
    }
  },
});


// ── Seed initial products ────────────────────────────────────────
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.query("products").collect();
    if (existing.length > 0) return { message: "Already seeded" };

    const products = [
      {
        name: "AstraGlow - Cyberpunk Portfolio", slug: "1-wp-neon", category: "wordpress",
        short_desc: "A futuristic portfolio theme designed for digital artists and web3 developers.",
        desc: "AstraGlow is a premier WordPress Block Theme designed specifically for creatives, NFT collectors, and Web3 developers. Built with a full-site editing approach, it offers customizable color palettes, interactive elements, and block patterns.",
        price_usd: 29.00, images: ["/cyberpunk_portfolio.png", "/agency_theme.png", "/tech_landing.png"],
        features: ["Full Site Editing (FSE) ready", "Cyberpunk mesh gradient animations", "Optimized Core Web Vitals (95+ score)", "Contact Form 7 integration ready", "Custom block patterns included"],
        tech: "WordPress 6.x / Block Editor", filesize: "14.2 MB", is_active: true, is_featured: true, sort_order: 1,
      },
      {
        name: "SaaSify - Tech Landing Page", slug: "2-react-saas", category: "website",
        short_desc: "A high-conversion React Next.js landing template tailored for software platforms.",
        desc: "SaaSify provides everything a modern startup needs to launch their product. Built with Next.js 14, Framer Motion, and pure responsive CSS grid.",
        price_usd: 19.00, images: ["/tech_landing.png", "/saas_mockup.png", "/startup_mockup.png"],
        features: ["Next.js 14 App Router layout", "Fully responsive (mobile-first)", "Smooth Framer Motion integrations", "SEO structured schema markers", "Reusable vanilla CSS components"],
        tech: "Next.js 14, React 18, CSS", filesize: "4.8 MB", is_active: true, is_featured: false, sort_order: 2,
      },
      {
        name: "Apex Agency - Studio Theme", slug: "3-wp-agency", category: "wordpress",
        short_desc: "Modern block theme built for creative studios and marketing agencies.",
        desc: "Apex Agency is a clean, modern, and speed-optimized WordPress theme designed for professional services, design studios, and freelance agents.",
        price_usd: 35.00, images: ["/agency_theme.png", "/cyberpunk_portfolio.png"],
        features: ["Drag-and-drop block layouts", "SEO semantic markups", "Dynamic portfolio filtering grid", "Translation & RTL languages ready", "One-click layout importing script"],
        tech: "WordPress 6.x / Gutenberg Editor", filesize: "18.5 MB", is_active: true, is_featured: false, sort_order: 3,
      },
      {
        name: "NFTHub - Web3 Showcase", slug: "4-html-portal", category: "website",
        short_desc: "Premium dark mode HTML5 landing template for Web3 portals and NFT projects.",
        desc: "NFTHub is a modular HTML5 / CSS3 landing page design system ideal for showing NFT drops, token statistics, and artist collections.",
        price_usd: 15.00, images: ["/web3_showcase.png", "/gaming_mockup.png"],
        features: ["W3C compliant HTML5 & CSS3 code", "Vibrant Web3 responsive design", "Custom canvas particle background", "Pre-designed purchase flow pages", "Included SVG illustration assets"],
        tech: "HTML5, CSS3, ES6 JavaScript", filesize: "6.2 MB", is_active: true, is_featured: false, sort_order: 4,
      },
      {
        name: "Syntax - Analytics Dashboard", slug: "5-saas-dashboard", category: "website",
        short_desc: "A beautiful admin screen mockup with purple charts, perfect for SaaS analytics.",
        desc: "Syntax is a stunning analytics dashboard template packed with interactive charts, KPI cards, and data tables.",
        price_usd: 25.00, images: ["/saas_mockup.png", "/tech_landing.png"],
        features: ["Interactive recharts data visualizations", "Sidebar navigation with role states", "Dark mode only — premium aesthetic", "Responsive table with sort & filter", "TypeScript ready component structure"],
        tech: "React 18, Recharts, CSS", filesize: "7.4 MB", is_active: true, is_featured: false, sort_order: 5,
      },
      {
        name: "AetherTech - Startup Home", slug: "6-startup-landing", category: "website",
        short_desc: "Modern startup page template with dark background and glowing amber lines.",
        desc: "AetherTech is a startup-focused landing page that combines bold typography with subtle glowing accent lines.",
        price_usd: 22.00, images: ["/startup_mockup.png", "/tech_landing.png"],
        features: ["Zero dependency pure HTML/CSS/JS", "Animated hero with gradient text", "Pricing table (monthly/yearly toggle)", "Testimonial carousel", "Production-ready in under 5 minutes"],
        tech: "HTML5, CSS3, Vanilla JS", filesize: "3.1 MB", is_active: true, is_featured: false, sort_order: 6,
      },
      {
        name: "Neon Nexus - Cyberpunk Guild", slug: "7-gaming-community", category: "wordpress",
        short_desc: "Premium WordPress theme with glowing green borders for gaming communities.",
        desc: "Neon Nexus is a high-energy WordPress theme engineered for gaming clans, esports teams, and community sites.",
        price_usd: 32.00, images: ["/gaming_mockup.png", "/cyberpunk_portfolio.png"],
        features: ["Custom match schedule plugin included", "Animated leaderboard table widget", "Player profile card templates", "Discord integration widget", "Twitch live stream embed module"],
        tech: "WordPress 6.x + Custom Plugin", filesize: "22.8 MB", is_active: true, is_featured: false, sort_order: 7,
      },
      {
        name: "BioLink - Profile Landing Page", slug: "8-mobile-bio", category: "website",
        short_desc: "A clean phone-sized profile page to list all your social media accounts and links.",
        desc: "BioLink is a minimalist bio / link-in-bio page template. It's a single-page HTML file you can host on any static host in minutes.",
        price_usd: 12.00, images: ["/mobile_mockup.png"],
        features: ["Single HTML file — zero dependencies", "Animated gradient background", "Unlimited link buttons", "Mobile-first 375px design", "Custom emoji icon support"],
        tech: "HTML5, CSS3", filesize: "0.4 MB", is_active: true, is_featured: false, sort_order: 8,
      },
    ];

    for (const p of products) {
      await ctx.db.insert("products", p);
    }
    return { message: `Seeded ${products.length} products` };
  },
});

export const getFileUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

// ── Update multiple sort orders at once ────────────────────────
export const updateSortOrders = mutation({
  args: {
    updates: v.array(v.object({
      id: v.id("products"),
      sort_order: v.number(),
    })),
  },
  handler: async (ctx, { updates }) => {
    await requireAdmin(ctx);
    for (const update of updates) {
      await ctx.db.patch(update.id, { sort_order: update.sort_order });
    }
  },
});
