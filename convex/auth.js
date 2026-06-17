export async function requireAdmin(ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Unauthenticated call');
  }

  const adminEmails = ['mohammadsayemweb@gmail.com', 'htmlocean@gmail.com'];
  // Clerk stores the primary email in identity.email
  if (!identity.email || !adminEmails.includes(identity.email)) {
    throw new Error('Unauthorized: Admin access required');
  }

  return identity;
}
