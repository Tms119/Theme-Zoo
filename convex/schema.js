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

  // ── Orders ──────────────────────────────────────────────────────
  orders: defineTable({
    product_id:   v.id("products"),
    product_name: v.string(),
    price_usd:    v.number(),
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
    status:   v.string(), // "open" | "resolved"
  })
    .index("by_status", ["status"]),

  // ── Categories ──────────────────────────────────────────────────
  categories: defineTable({
    name: v.string(), // e.g. "WordPress", "Web Templates"
    slug: v.string(), // e.g. "wordpress", "web-templates"
  }).index("by_slug", ["slug"]),
});
