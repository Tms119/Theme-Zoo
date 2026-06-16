'use client';
import { UserProfile, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <>
        <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Loading settings...</p>
        </main>
      </>
    );
  }

  if (!isSignedIn) {
    router.push('/');
    return null;
  }

  return (
    <>
      <main style={{ minHeight: '80vh', paddingTop: '100px', paddingBottom: '4rem', display: 'flex', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div style={{ width: '100%', maxWidth: '800px', padding: '0 1rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Account Settings</h1>
          
          <div className="clerk-profile-wrapper">
            <UserProfile routing="hash" />
          </div>
        </div>
      </main>
      
      <style jsx global>{`
        /* Force the Clerk profile to blend into the dark theme container slightly better if needed */
        .clerk-profile-wrapper {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .clerk-profile-wrapper > div {
          width: 100%;
        }
      `}</style>
    </>
  );
}
