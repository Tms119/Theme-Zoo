'use client';
import { useEffect, useState } from 'react';
import useCart from '@/store/useCart';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function DummyCheckout() {
  const { items, clearCart } = useCart();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [status, setStatus] = useState('Initializing Secure Crypto Gateway...');
  const createOrder = useMutation(api.orders.create);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    if (items.length === 0) {
      router.push('/templates');
      return;
    }

    const processCheckout = async () => {
      try {
        // Mock processing steps
        setTimeout(() => setStatus('Awaiting wallet confirmation...'), 1500);
        setTimeout(() => setStatus('Verifying transaction on blockchain...'), 3000);
        
        setTimeout(async () => {
          try {
            setStatus('Payment Successful! Fulfilling order...');
            
            // For each item in the cart, create an order in the database
            for (const item of items) {
              await createOrder({
                product_id: item._id,
                product_name: item.name,
                price_usd: item.price_usd,
                buyer_email: user?.primaryEmailAddress?.emailAddress || "unknown@example.com",
                buyer_name: user?.fullName || "Crypto Buyer",
                buyer_id: user?.id,
                status: "paid",
                tx_hash: `0x${Math.random().toString(16).substr(2, 40)}`
              });
            }

            // Clear cart and redirect
            clearCart();
            setTimeout(() => {
              router.push('/dashboard');
            }, 1500);

          } catch (err) {
            console.error("Failed to create order:", err);
            setStatus('Error fulfilling order. Please contact support.');
          }
        }, 5000);

      } catch (err) {
        setStatus('Checkout failed.');
      }
    };

    processCheckout();
  }, [isLoaded, isSignedIn, items, router, createOrder, user, clearCart]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <div style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '24px', border: '1px solid var(--border-color)', textAlign: 'center', maxWidth: '500px', width: '90%' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid rgba(139, 92, 246, 0.2)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite', margin: '0 auto 2rem auto' }} />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Processing Payment</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{status}</p>
        
        {/* Warning label from Implementation Plan */}
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#ef4444', fontSize: '0.85rem' }}>
          <strong>DEVELOPER NOTICE:</strong> This is a dummy mock checkout flow. Real Web3 crypto integration must be added before pushing to production.
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
