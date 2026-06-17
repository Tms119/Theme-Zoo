'use client';
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useAuth } from "@clerk/nextjs";

const convexUrl = (process.env.NEXT_PUBLIC_CONVEX_URL || 'https://dummy.convex.cloud').replace('.site', '.cloud');
const convex = new ConvexReactClient(convexUrl);

export default function ConvexClientProvider({ children }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
