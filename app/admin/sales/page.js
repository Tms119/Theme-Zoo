'use client';
import React, { useState } from 'react';
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SalesPage() {
  const {
    results: orders,
    status: ordersStatus,
    loadMore: loadMoreOrders,
  } = usePaginatedQuery(api.orders.listPaginated, {}, { initialNumItems: 50 });

  const [expandedOrder, setExpandedOrder] = useState(null);

  if (ordersStatus === "LoadingFirstPage") {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading Sales Data...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.25rem' }}>Sales History</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>View and manage all completed standard template transactions.</p>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="hide-mobile" style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Tx ID</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Template</th>
                <th className="hide-mobile" style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Buyer</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Amount</th>
                <th className="hide-mobile" style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'right' }}>Status</th>
                <th className="show-mobile-cell" style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <React.Fragment key={o._id}>
                  <tr style={{ borderBottom: expandedOrder === o._id ? 'none' : '1px solid rgba(255,255,255,0.03)' }}>
                    <td className="hide-mobile" style={{ padding: '1rem 0.5rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{o._id.substring(0, 8)}...</td>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 500, whiteSpace: 'normal' }}>{o.product_name}</td>
                    <td className="hide-mobile" style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>{o.buyer_email}</td>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>${o.price_usd.toFixed(2)}</td>
                    <td className="hide-mobile" style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(16, 189, 129, 0.1)', border: '1px solid rgba(16, 189, 129, 0.2)', color: 'var(--accent-emerald)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: 600, textTransform: 'uppercase' }}>
                        {o.status}
                      </span>
                    </td>
                    <td className="show-mobile-cell" style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => setExpandedOrder(expandedOrder === o._id ? null : o._id)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        {expandedOrder === o._id ? 'Less' : 'More'}
                      </button>
                    </td>
                  </tr>
                  {expandedOrder === o._id && (
                    <tr className="show-mobile-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: 'rgba(255,255,255,0.01)' }}>
                      <td colSpan={3} style={{ padding: '0 0.5rem 1rem 0.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Tx ID:</span>
                            <span style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>{o._id}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Buyer:</span>
                            <span style={{ color: 'var(--text-main)' }}>{o.buyer_email}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                            <span style={{ fontSize: '0.75rem', background: 'rgba(16, 189, 129, 0.1)', border: '1px solid rgba(16, 189, 129, 0.2)', color: 'var(--accent-emerald)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: 600, textTransform: 'uppercase' }}>
                              {o.status}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {ordersStatus === "CanLoadMore" && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button 
                onClick={() => loadMoreOrders(50)}
                className="btn btn-secondary"
                style={{ padding: '0.6rem 1.5rem', borderRadius: '100px' }}
              >
                Load More Orders
              </button>
            </div>
          )}
          {ordersStatus === "LoadingMore" && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
              Loading...
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .show-mobile-cell, .show-mobile-row {
          display: none !important;
        }
        @media (max-width: 768px) {
          .hide-mobile {
            display: none !important;
          }
          .show-mobile-cell {
            display: table-cell !important;
          }
          .show-mobile-row {
            display: table-row !important;
          }
        }
      `}</style>
    </div>
  );
}
