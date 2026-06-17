'use client';
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ orders }) {
  const data = useMemo(() => {
    if (!orders) return [];
    
    // Filter out unpaid orders and group by date
    const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'delivered');
    
    const groups = {};
    
    paidOrders.forEach(o => {
      // Assuming _creationTime is available from Convex
      const date = new Date(o._creationTime || Date.now());
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (!groups[dateStr]) {
        groups[dateStr] = 0;
      }
      groups[dateStr] += (o.price_usd || 0);
    });

    // Convert to array and sort by date. 
    // For simplicity, we just use the object keys which may not be perfectly chronological if crossing years,
    // but works fine for recent 30 days.
    return Object.keys(groups).map(dateStr => ({
      name: dateStr,
      revenue: groups[dateStr],
    })).reverse(); // Reverse so older is left, newer is right assuming Convex returns desc
  }, [orders]);

  if (!data || data.length === 0) {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No revenue data yet.</div>;
  }

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="rgba(255,255,255,0.2)" 
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
            axisLine={false} 
            tickLine={false} 
            dy={10}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.2)" 
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
            tickFormatter={(val) => `$${val}`}
            axisLine={false} 
            tickLine={false} 
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#10b981' }}
            formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#10b981" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#18181b' }} 
            activeDot={{ r: 6, fill: '#10b981', stroke: '#fff' }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
