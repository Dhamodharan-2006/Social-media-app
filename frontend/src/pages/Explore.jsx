import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExplore } from '../features/posts/postSlice';
import { searchUsersAction } from '../features/users/userSlice';
import { useNavigate } from 'react-router-dom';

export default function Explore() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { explore } = useSelector(s => s.posts);
  const { results } = useSelector(s => s.users);
  const [q,    setQ]    = useState('');
  const [show, setShow] = useState(false);
  const [timer, setTimer] = useState(null);

  useEffect(() => { dispatch(fetchExplore(1)); }, [dispatch]);

  const onSearch = v => {
    setQ(v);
    if (timer) clearTimeout(timer);
    if (v.trim()) {
      setTimer(setTimeout(() => { dispatch(searchUsersAction(v)); setShow(true); }, 400));
    } else {
      setShow(false);
    }
  };

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '20px 16px' }}>
      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
          <input className="input" placeholder="Search users..."
            value={q} onChange={e => onSearch(e.target.value)}
            onBlur={() => setTimeout(() => setShow(false), 200)}
            style={{ paddingLeft: 42 }} />
        </div>
        {show && results.length > 0 && (
          <div className="card fade-in" style={{ position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 100, overflow: 'hidden', maxHeight: 360, overflowY: 'auto' }}>
            {results.map(u => (
              <div key={u._id} onMouseDown={() => { navigate(`/profile/${u.username}`); setShow(false); setQ(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ position: 'relative' }}>
                  <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=7c3aed&color=fff`}
                    alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                  {u.isOnline && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, background: '#22c55e', border: '2px solid white', borderRadius: '50%' }} />}
                </div>
                <div>
                  <p style={{ fontWeight: 700, margin: 0, fontSize: 14 }}>
                    {u.username}
                    {u.isVerified && <span style={{ marginLeft: 4, fontSize: 14 }}>✅</span>}
                  </p>
                  <p style={{ color: '#6b7280', margin: 0, fontSize: 12 }}>{u.fullName}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <h3 style={{ fontWeight: 800, marginBottom: 16 }}>Explore</h3>

      {/* Masonry-style grid */}
      <div style={{ columns: 3, columnGap: 4 }}>
        {explore.map(post => (
          <div key={post._id}
            onClick={() => navigate(`/post/${post._id}`)}
            style={{ breakInside: 'avoid', marginBottom: 4, position: 'relative', cursor: 'pointer', overflow: 'hidden', borderRadius: 4 }}
            onMouseEnter={e => e.currentTarget.querySelector('.overlay').style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.querySelector('.overlay').style.opacity = '0'}>
            {post.images?.[0] ? (
              <img src={post.images[0]} alt="" style={{ width: '100%', display: 'block' }} />
            ) : post.video ? (
              <div style={{ background: '#0f172a', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🎬</div>
            ) : (
              <div style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
                <p style={{ color: 'white', fontSize: 12, textAlign: 'center' }}>{post.caption?.substring(0, 80)}</p>
              </div>
            )}
            <div className="overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, opacity: 0, transition: 'opacity .2s' }}>
              <span style={{ color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>❤️ {post.likes?.length || 0}</span>
              <span style={{ color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>💬 {post.comments?.length || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}