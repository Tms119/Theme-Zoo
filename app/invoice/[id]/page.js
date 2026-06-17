'use client';
import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { Check, Printer, LayoutGrid } from 'lucide-react';
import Link from 'next/link';

export default function InvoicePage() {
  const params = useParams();
  const orderId = params?.id;
  const { user, isLoaded } = useUser();
  const order = useQuery(api.orders.getById, orderId ? { id: orderId } : 'skip');

  if (!isLoaded || order === undefined) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>Loading invoice...</div>;
  }

  if (order === null) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>Invoice not found.</div>;
  }

  // Prevent unauthorized access
  if (order.buyer_id !== user?.id && order.buyer_email !== user?.primaryEmailAddress?.emailAddress) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'red' }}>Unauthorized</div>;
  }

  return (
    <div style={{ background: '#fff', color: '#000', minHeight: '100vh', padding: '4rem 2rem' }} className="invoice-container">
      
      {/* Non-printable actions */}
      <div className="no-print" style={{ maxWidth: '800px', margin: '0 auto 2rem auto', display: 'flex', justifyContent: 'space-between' }}>
        <Link href="/dashboard" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
          &larr; Back to Dashboard
        </Link>
        <button 
          onClick={() => window.print()}
          style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
        >
          <Printer size={16} /> Print / Save as PDF
        </button>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', border: '1px solid #e5e7eb', padding: '3rem', borderRadius: '12px', background: '#fff' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e5e7eb', paddingBottom: '2rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '1rem' }}>
              <LayoutGrid size={24} /> ThemesZoo
            </div>
            <div style={{ color: '#4b5563', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Invoice #: {order._id.substring(0, 8).toUpperCase()}<br/>
              Date: {new Date(order._creationTime).toLocaleDateString()}<br/>
              Status: <span style={{ color: order.status === 'paid' ? '#10b981' : '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>{order.status}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#111827', margin: '0 0 1rem 0', fontWeight: 900 }}>INVOICE</h1>
            <div style={{ color: '#4b5563', fontSize: '0.9rem', lineHeight: '1.5' }}>
              <strong>Billed To:</strong><br/>
              {order.buyer_name}<br/>
              {order.buyer_email}
            </div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#374151', fontSize: '0.9rem' }}>Description</th>
              <th style={{ padding: '1rem', textAlign: 'right', color: '#374151', fontSize: '0.9rem' }}>Amount (USD)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '1.5rem 1rem', color: '#111827', fontWeight: 600 }}>
                {order.product_name}
                {order.tx_hash && (
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 400, marginTop: '0.25rem' }}>
                    Tx ID: {order.tx_hash}
                  </div>
                )}
              </td>
              <td style={{ padding: '1.5rem 1rem', textAlign: 'right', color: '#111827', fontWeight: 600 }}>
                ${order.price_usd.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: '#4b5563', fontSize: '0.9rem' }}>
              <span>Subtotal:</span>
              <span>${order.price_usd.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: '#4b5563', fontSize: '0.9rem' }}>
              <span>Tax (0%):</span>
              <span>$0.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', color: '#111827', fontSize: '1.25rem', fontWeight: 800, borderTop: '2px solid #e5e7eb', marginTop: '0.5rem' }}>
              <span>Total Paid:</span>
              <span>${order.price_usd.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '4rem', textAlign: 'center', color: '#6b7280', fontSize: '0.85rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: '#d1fae5', color: '#059669', marginBottom: '0.5rem' }}>
            <Check size={16} strokeWidth={3} />
          </div>
          <p>Thank you for your business. Payment received securely via NOWPayments.</p>
        </div>

      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .invoice-container { padding: 0 !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}
