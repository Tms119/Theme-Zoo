import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every hour to check for abandoned carts
crons.hourly(
  "abandoned-cart-recovery",
  { minuteUTC: 0 },
  internal.emails.processAbandonedCarts
);

// Run every hour to expire unpaid orders older than 2 hours
crons.hourly(
  "expire-unpaid-orders",
  { minuteUTC: 5 }, // Run 5 minutes past the hour to offset from email processing
  internal.orders.expireUnpaidOrders
);

export default crons;
