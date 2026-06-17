import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ── Products ────────────────────────────────────────────────────
  products: defineTable({
    name:        v.string(),
    slug:        v.string(),            // URL-safe ID e.g. "1-wp-neon"
    category:    v.string(),            // "wordpress" | "website"
    short_desc:  v.string(),
    desc:        v.string(),
    price_usd:   v.number(),
    images:      v.array(v.string()),   // array of public paths or URLs
    features:    v.array(v.string()),
    tech:        v.string(),
    filesize:    v.string(),
    is_active:   v.boolean(),           // hide/show product without deleting
    is_featured: v.optional(v.boolean()),
    demo_url:    v.optional(v.string()),
    file_id:     v.optional(v.id("_storage")), // Convex Storage ID for zip files
    file_url:    v.optional(v.string()),       // External download link fallback
    pdf_id:      v.optional(v.id("_storage")), // PDF Documentation
    pdf_url:     v.optional(v.string()),       // PDF Download/View URL
    sort_order:  v.optional(v.number()),
  })
    .index("by_slug",     ["slug"])
    .index("by_category", ["category"])
    .index("by_active",   ["is_active"]),

  orders: defineTable({
    product_id:   v.id("products"),
    product_name: v.string(),
    price_usd:    v.number(), // The final price they paid
    original_price: v.optional(v.number()), // Price before discount
    promo_code:   v.optional(v.string()),
    buyer_email:  v.string(),
    buyer_name:   v.string(),
    buyer_id:     v.optional(v.string()),  // clerk user id
    tx_hash:      v.optional(v.string()),  // crypto transaction hash
    status:       v.string(),              // "pending" | "paid" | "delivered" | "refunded"
    delivered_at: v.optional(v.number()), // timestamp
    notes:        v.optional(v.string()),
  })
    .index("by_status",       ["status"])
    .index("by_buyer_email",  ["buyer_email"])
    .index("by_buyer_id",     ["buyer_id"])
    .index("by_product",      ["product_id"]),

  // ── Contact / Custom Orders ─────────────────────────────────────
  contact_requests: defineTable({
    name:         v.string(),
    email:        v.string(),
    project_type: v.optional(v.string()),
    budget:       v.optional(v.string()),
    message:      v.string(),
    status:       v.string(),   // "new" | "replied" | "archived"
  })
    .index("by_status", ["status"]),

  // ── Support Tickets ─────────────────────────────────────────────
  support_tickets: defineTable({
    name:     v.string(),
    email:    v.string(),
    problem:  v.string(),
    status:   v.string(), // "open", "replied", "closed"
  }).index("by_status", ["status"]),

  // Promo Codes Table
  promo_codes: defineTable({
    code: v.string(), // e.g., "FREE100", "SUMMER50"
    discountType: v.string(), // "percentage" or "fixed"
    discountValue: v.number(), // e.g., 100 for 100%, or 50 for $50
    isActive: v.boolean(),
    uses: v.number(), // track how many times it was used
  }).index("by_code", ["code"]),

  // Wishlists Table
  wishlists: defineTable({
    user_email: v.string(),
    product_id: v.id("products"),
  }).index("by_user", ["user_email"]),

  // Services Config Table (Singular config for Custom Services Section)
  services_config: defineTable({
    tier1_name: v.string(),
    tier1_price: v.number(),
    tier1_desc: v.string(),
    tier2_name: v.string(),
    tier2_price: v.number(),
    tier2_desc: v.string(),
    tier3_name: v.string(),
    tier3_desc: v.string(),
    design_title: v.string(),
    design_desc: v.string(),
  }),

  // Custom Orders (Form Submissions)
  custom_orders: defineTable({
    name: v.string(),
    email: v.string(),
    service_type: v.string(), // "Tier 1", "Tier 2", "Tier 3", "Design"
    budget: v.string(),
    message: v.string(),
    status: v.string(), // "pending", "paid", "open", "contacted", "closed"
    tx_hash: v.optional(v.string()), // For direct payments
    price_usd: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  // ── Categories ──────────────────────────────────────────────────
  categories: defineTable({
    name: v.string(), // e.g. "WordPress", "Web Templates"
    slug: v.string(), // e.g. "wordpress", "web-templates"
  }).index("by_slug", ["slug"]),
});
