import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../app/axios';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/stats').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ maxWidth: 1000, margin: '24px auto', padding: '0 16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
        {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}
      </div>
    </div>
  );

  const stats = [
    { icon: '👥', label: 'Total Users',    val: data?.stats.totalUsers,    bg: 'linear-gradient(135deg,#7c3aed,#8b5cf6)' },
    { icon: '✅', label: 'Verified',       val: data?.stats.verifiedUsers,  bg: 'linear-gradient(135deg,#10b981,#059669)' },
    { icon: '📸', label: 'Total Posts',    val: data?.stats.totalPosts,     bg: 'linear-gradient(135deg,#ec4899,#f97316)' },
    { icon: '🚩', label: 'Reported Posts', val: data?.stats.reportedPosts,  bg: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
    { icon: '🚫', label: 'Banned Users',   val: data?.stats.bannedUsers,    bg: 'linear-gradient(135deg,#64748b,#475569)' },
    { icon: '💬', label: 'Messages',       val: data?.stats.totalMessages,  bg: 'linear-gradient(135deg,#6366f1,#3b82f6)' },
  ];

  const today = [
    { icon: '🆕', label: 'New Users Today',  val: data?.stats.newUsersToday },
    { icon: '📝', label: 'New Posts Today',   val: data?.stats.newPostsToday },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 900, fontSize: 24, margin: '0 0 4px' }}>📊 Admin Dashboard</h2>
        <p style={{ color: '#6b7280', margin: 0 }}>Overview of SnapGram platform</p>
      </div>

      {/* Today stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {today.map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>{s.icon}</span>
            <div>
              <p style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{s.val}</p>
              <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} className="fade-in" style={{ background: s.bg, borderRadius: 14, padding: 20, color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -8, top: -8, fontSize: 50, opacity: .15 }}>{s.icon}</div>
            <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 6px', opacity: .9 }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>{s.val?.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { to: '/admin/users',    icon: '👥', title: 'Manage Users',   desc: 'View, ban, delete users',        color: '#7c3aed' },
          { to: '/admin/posts',    icon: '📸', title: 'All Posts',      desc: 'Browse and moderate posts',      color: '#ec4899' },
          { to: '/admin/reported', icon: '🚩', title: 'Reported Posts', desc: `${data?.stats.reportedPosts} posts need review`, color: '#f59e0b' },
        ].map(l => (
          <Link key={l.to} to={l.to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: 20, transition: 'transform .2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: l.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 12 }}>{l.icon}</div>
              <p style={{ fontWeight: 700, margin: '0 0 4px', fontSize: 15 }}>{l.title}</p>
              <p style={{ color: '#6b7280', margin: 0, fontSize: 13 }}>{l.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          { title: '🆕 Recent Users', items: data?.recentUsers, render: u => (
            <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=7c3aed&color=fff`}
                alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, margin: 0, fontSize: 13 }}>{u.username}</p>
                <p style={{ color: '#9ca3af', margin: 0, fontSize: 11, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{u.email}</p>
              </div>
              {u.isVerified ? <span style={{ fontSize: 14 }}>✅</span> : <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: 4 }}>Unverified</span>}
            </div>
          )},
          { title: '🔥 Recent Posts', items: data?.recentPosts, render: p => (
            <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              {p.images?.[0]
                ? <img src={p.images[0]} alt="" style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: 42, height: 42, borderRadius: 8, background: 'linear-gradient(135deg,#ede9fe,#fce7f3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📝</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, margin: 0, fontSize: 13 }}>@{p.user?.username}</p>
                <p style={{ color: '#9ca3af', margin: 0, fontSize: 11, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{p.caption || 'No caption'}</p>
              </div>
              <div style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0 }}>❤️{p.likes?.length || 0}</div>
            </div>
          )},
        ].map(section => (
          <div key={section.title} className="card" style={{ padding: 20 }}>
            <h4 style={{ fontWeight: 700, margin: '0 0 16px', fontSize: 14 }}>{section.title}</h4>
            {section.items?.map(section.render)}
          </div>
        ))}
      </div>
    </div>
  );
}