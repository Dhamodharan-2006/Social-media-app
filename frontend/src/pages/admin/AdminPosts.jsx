import { useEffect, useState } from 'react';
import API from '../../app/axios';
import { toast } from 'react-toastify';

export default function AdminPosts({ reported = false }) {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await API.get(reported ? '/admin/posts/reported' : '/admin/posts');
      setPosts(reported ? r.data : r.data.posts);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, [reported]);

  const handleDelete = async id => {
    if (!window.confirm('Delete this post permanently?')) return;
    await API.delete(`/admin/posts/${id}`);
    toast.success('Post deleted');
    load();
  };

  const handleDismiss = async id => {
    await API.put(`/admin/posts/${id}/dismiss`);
    toast.success('Report dismissed');
    load();
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontWeight: 900, margin: '0 0 4px', fontSize: 22 }}>
            {reported ? '🚩 Reported Posts' : '📸 All Posts'}
          </h2>
          <p style={{ color: '#6b7280', margin: 0, fontSize: 14 }}>{posts.length} posts</p>
        </div>
        <button onClick={load} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 13 }}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
          <div style={{ fontSize: 50, marginBottom: 12 }}>✅</div>
          <p style={{ fontWeight: 600, fontSize: 18 }}>
            {reported ? 'No reported posts!' : 'No posts yet'}
          </p>
        </div>
      ) : (
        posts.map(post => (
          <div key={post._id} className="card fade-in" style={{ padding: 16, marginBottom: 12, display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* Thumbnail */}
            <div style={{ width: 72, height: 72, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
              {post.images?.[0]
                ? <img src={post.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : post.video
                ? <div style={{ width: '100%', height: '100%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🎬</div>
                : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#ede9fe,#fce7f3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📝</div>
              }
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              {/* User */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <img src={post.user?.avatar || `https://ui-avatars.com/api/?name=${post.user?.username}&background=7c3aed&color=fff`}
                  alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
                <span style={{ fontWeight: 700, fontSize: 13 }}>@{post.user?.username}</span>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Caption */}
              <p style={{ margin: '0 0 8px', fontSize: 13, color: '#374151', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {post.caption || <em style={{ color: '#9ca3af' }}>No caption</em>}
              </p>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#9ca3af', flexWrap: 'wrap' }}>
                <span>❤️ {post.likes?.length || 0} likes</span>
                <span>💬 {post.comments?.length || 0} comments</span>
                <span>👁️ {post.views || 0} views</span>
                {post.images?.length > 0 && <span>🖼️ {post.images.length} image{post.images.length > 1 ? 's' : ''}</span>}
                {reported && <span style={{ color: '#ef4444', fontWeight: 700 }}>🚩 {post.reportCount} reports</span>}
              </div>

              {/* Report reasons */}
              {reported && post.reports?.length > 0 && (
                <div style={{ marginTop: 10, padding: '10px 12px', background: '#fef9c3', borderRadius: 8, border: '1px solid #fde68a' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#92400e', margin: '0 0 6px' }}>
                    Reported by {post.reports.length} user{post.reports.length > 1 ? 's' : ''}:
                  </p>
                  {post.reports.slice(0, 3).map((r, i) => (
                    <p key={i} style={{ fontSize: 11, color: '#78350f', margin: '2px 0' }}>
                      • {r.reason || 'No reason given'}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
              <button onClick={() => handleDelete(post._id)}
                style={{ padding: '7px 14px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                🗑️ Delete
              </button>
              {reported && (
                <button onClick={() => handleDismiss(post._id)}
                  style={{ padding: '7px 14px', background: '#dcfce7', color: '#166534', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  ✅ Dismiss
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}