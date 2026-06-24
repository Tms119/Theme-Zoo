'use client';

export default function SecurityProvider({ children }) {
  // Security restrictions have been removed to allow View Source and DevTools.
  return <>{children}</>;
}
