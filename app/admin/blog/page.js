'use client';
import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from 'next/link';
import { Plus, Edit, Trash2, Search, ExternalLink } from 'lucide-react';

export default function AdminBlog() {
  const posts = useQuery(api.posts.listAll);
  const toggleStatus = useMutation(api.posts.toggleStatus);
  const deletePost = useMutation(api.posts.remove);

  const [searchTerm, setSearchTerm] = useState('');

  if (posts === undefined) {
    return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading posts...</div>;
  }

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Blog Posts</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage your SEO content and articles.</p>
        </div>
        
        <Link href="/admin/blog/editor" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '10px', textDecoration: 'none' }}>
          <Plus size={16} /> New Post
        </Link>
      </div>

      <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Search posts..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input"
          style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff' }}
        />
      </div>

      <div className="admin-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
        {filteredPosts.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No posts found. Create your first blog post!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Title</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Status</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Date</th>
                <th style={{ textAlign: 'right', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map(post => (
                <tr key={post._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.2rem' }}>{post.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>/{post.slug}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button 
                      onClick={() => toggleStatus({ id: post._id })}
                      style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '20px', 
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        background: post.status === 'published' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                        color: post.status === 'published' ? '#10b981' : 'var(--text-muted)',
                      }}
                    >
                      {post.status.toUpperCase()}
                    </button>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    {post.published_at ? new Date(post.published_at).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      {post.status === 'published' && (
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '0.4rem', borderRadius: '8px' }} title="View Live">
                          <ExternalLink size={16} />
                        </a>
                      )}
                      <Link href={`/admin/blog/editor?id=${post._id}`} className="btn btn-outline" style={{ padding: '0.4rem', borderRadius: '8px', textDecoration: 'none' }} title="Edit">
                        <Edit size={16} />
                      </Link>
                      <button 
                        onClick={() => {
                          if(confirm('Delete this post?')) deletePost({ id: post._id })
                        }}
                        className="btn btn-outline" 
                        style={{ padding: '0.4rem', borderRadius: '8px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
