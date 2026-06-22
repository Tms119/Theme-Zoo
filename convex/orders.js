import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

// ── List all orders (admin) ──────────────────────────────────────
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("orders").order("desc").collect();
  },
});

export const listPaginated = query({
  args: { paginationOpts: v.any() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    
    // Fetch template orders
    const orders = await ctx.db.query("orders").collect();
    const successfulOrders = orders.filter(o => ['paid', 'delivered', 'completed'].includes(o.status));
    
    // Calculate template revenue, strictly ignoring 100% free promo orders 
    // (identified by tx_hash starting with 'promo_') which may have old inaccurate price_usd data
    const templateRevenue = successfulOrders.reduce((acc, order) => {
      if (order.tx_hash && order.tx_hash.startsWith('promo_')) {
        return acc;
      }
      return acc + (order.price_usd || 0);
    }, 0);

    return {
      totalRevenue: templateRevenue,
      totalOrders: successfulOrders.length
    };
  }
});

// TEMPORARY DEBUG QUERY
export const debugRevenue = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    const successfulOrders = orders.filter(o => ['paid', 'delivered', 'completed'].includes(o.status));
    const templateDetails = successfulOrders.map(o => ({ id: o._id, name: o.product_name, price: o.price_usd, status: o.status, tx: o.tx_hash }));
    
    const customOrders = await ctx.db.query("custom_orders").collect();
    const successfulCustom = customOrders.filter(o => ['paid', 'delivered', 'completed'].includes(o.status));
    const customDetails = successfulCustom.map(o => ({ id: o._id, type: o.service_type, price: o.price_usd, status: o.status }));

    return { templateDetails, customDetails };
  }
});

// ── List by status ───────────────────────────────────────────────
export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, { status }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", status))
      .order("desc")
      .collect();
  },
});

// ── Get order by id ──────────────────────────────────────────────
export const getById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// ── List by user email ───────────────────────────────────────────────
export const listByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_buyer_email", (q) => q.eq("buyer_email", email))
      .order("desc")
      .collect();
  },
});

// ── List by user id ───────────────────────────────────────────────
export const listByUser = query({
  args: { buyer_id: v.string() },
  handler: async (ctx, { buyer_id }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_buyer_id", (q) => q.eq("buyer_id", buyer_id))
      .order("desc")
      .collect();
  },
});

// ── Create order ─────────────────────────────────────────────────
export const create = mutation({
  args: {
    product_id:     v.id("products"),
    product_name:   v.string(),
    price_usd:      v.number(),
    original_price: v.optional(v.number()),
    promo_code:     v.optional(v.string()),
    buyer_email:    v.string(),
    buyer_name:     v.string(),
    buyer_id:       v.optional(v.string()),
    tx_hash:        v.optional(v.string()),
    status:         v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("orders", args);
  },
});

// ── Update order status ──────────────────────────────────────────
export const updateStatus = mutation({
  args: {
    id:           v.id("orders"),
    status:       v.string(),
    tx_hash:      v.optional(v.string()),
    delivered_at: v.optional(v.number()),
    notes:        v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});

// ── Update multiple orders by tx_hash ────────────────────────────
export const updateByTxHash = mutation({
  args: {
    tx_hash:      v.string(), // The cart_id
    status:       v.string(),
    new_tx_hash:  v.optional(v.string()), // The actual payment_id from NOWPayments
    delivered_at: v.optional(v.number()),
  },
  handler: async (ctx, { tx_hash, status, new_tx_hash, delivered_at }) => {
    const orders = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("tx_hash"), tx_hash))
      .collect();

    for (const order of orders) {
      await ctx.db.patch(order._id, {
        status,
        ...(new_tx_hash !== undefined && { tx_hash: new_tx_hash }),
        ...(delivered_at !== undefined && { delivered_at }),
      });
    }
  },
});

// ── Get orders by tx_hash (for real-time cart tracking) ──────────
export const listByTxHash = query({
  args: { tx_hash: v.string() },
  handler: async (ctx, { tx_hash }) => {
    return await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("tx_hash"), tx_hash))
      .collect();
  },
});

// ── Get Download URL for Purchased Product ───────────────────────
export const getDownloadUrl = query({
  args: { order_id: v.id("orders"), email: v.string() },
  handler: async (ctx, { order_id, email }) => {
    const order = await ctx.db.get(order_id);
    if (!order) throw new Error("Order not found");
    
    // Verify ownership
    if (order.buyer_email !== email) {
      throw new Error("Unauthorized to access this download");
    }

    const product = await ctx.db.get(order.product_id);
    if (!product) throw new Error("Product no longer exists");

    if (product.file_url) {
      // Return external link if it exists
      return product.file_url;
    }

    if (product.file_id) {
      // Generate secure short-lived URL for Convex storage file
      return await ctx.storage.getUrl(product.file_id);
    }

    throw new Error("No file associated with this product");
  },
});

// ── Get Download URL via Token (Guest Checkout) ──────────────────
export const getGuestDownloadUrl = mutation({
  args: { order_id: v.id("orders") },
  handler: async (ctx, { order_id }) => {
    const order = await ctx.db.get(order_id);
    if (!order) throw new Error("Order not found");
    
    // Verify payment status
    if (order.status !== "paid") {
      throw new Error("Order is not paid. Cannot access download.");
    }

    const product = await ctx.db.get(order.product_id);
    if (!product) throw new Error("Product no longer exists");

    if (product.file_url) {
      return product.file_url;
    }

    if (product.file_id) {
      return await ctx.storage.getUrl(product.file_id);
    }

    throw new Error("No file associated with this product");
  },
});

// ── Expire Unpaid Orders (Internal) ──────────────────────────────
export const expireUnpaidOrders = internalMutation({
  handler: async (ctx) => {
    // 2 hours ago in milliseconds
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    
    // Find all pending orders
    const pendingOrders = await ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    // Filter orders older than 2 hours
    const expiredOrders = pendingOrders.filter(o => o._creationTime < twoHoursAgo);

    // Update their status to 'failed'
    for (const order of expiredOrders) {
      await ctx.db.patch(order._id, { status: "failed" });
      console.log(`Expired unpaid order ${order._id}`);
    }
    
    // Also handle custom service orders
    const pendingServices = await ctx.db
      .query("custom_orders")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
      
    const expiredServices = pendingServices.filter(s => s._creationTime < twoHoursAgo);
    
    for (const service of expiredServices) {
      await ctx.db.patch(service._id, { status: "failed" });
      console.log(`Expired unpaid service order ${service._id}`);
    }
  },
});
