import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every hour to check for abandoned carts
crons.hourly(
  "abandoned-cart-recovery",
  internal.emails.processAbandonedCarts
);

export default crons;
