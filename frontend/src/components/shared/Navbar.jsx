import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, getMe } from '../../features/auth/authSlice';
import { fetchUnread } from '../../features/notifications/notifSlice';
import { fetchMsgUnread } from '../../features/messages/messageSlice';
import { searchUsersAction } from '../../features/users/userSlice';
import CreatePost from '../post/CreatePost';

export default function Navbar() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const loc       = useLocation();
  const { user, token }  = useSelector(s => s.auth);
  const { unread }       = useSelector(s => s.notifications);
  const { unread: msgUnread } = useSelector(s => s.messages);
  const { results }      = useSelector(s => s.users);
  const [q,       setQ]        = useState('');
  const [showQ,   setShowQ]    = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [timer,   setTimer]    = useState(null);
  const [mobMenu, setMobMenu]  = useState(false);

  useEffect(() => {
    if (token) {
      dispatch(getMe());
      dispatch(fetchUnread());
      dispatch(fetchMsgUnread());
    }
  }, [token, loc.pathname]);

  const onSearch = v => {
    setQ(v);
    if (timer) clearTimeout(timer);
    if (v.trim()) { setTimer(setTimeout(() => { dispatch(searchUsersAction(v)); setShowQ(true); }, 400)); }
    else setShowQ(false);
  };

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  const isActive = p => loc.pathname === p;

  if (!token) return null;

  const navItems = user?.isAdmin ? [
    { to: '/admin',      icon: '📊', label: 'Dashboard' },
    { to: '/admin/users', icon: '👥', label: 'Users' },
    { to: '/admin/posts', icon: '📸', label: 'Posts' },
  ] : [
    { to: '/',             icon: '🏠', label: 'Home'    },
    { to: '/explore',      icon: '🔍', label: 'Explore' },
    { to: '/messages',     icon: '💬', label: 'Messages',      badge: msgUnread },
    { to: '/notifications',icon: '🔔', label: 'Notifications', badge: unread   },
  ];

  return (
    <>
      {/* Top Navbar */}
      <nav style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 16px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

          {/* Logo */}
          <Link to={user?.isAdmin ? '/admin' : '/'} style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📸</div>
              <span style={{ fontWeight: 900, fontSize: 18, background: 'linear-gradient(135deg,#7c3aed,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} className="hide-sm">SnapGram</span>
            </div>
          </Link>

          {/* Search */}
          {!user?.isAdmin && (
            <div style={{ flex: 1, maxWidth: 260, position: 'relative' }} className="hide-sm">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
                <input className="input" placeholder="Search..." value={q}
                  onChange={e => onSearch(e.target.value)}
                  onFocus={() => q && setShowQ(true)}
                  onBlur={() => setTimeout(() => setShowQ(false), 200)}
                  style={{ paddingLeft: 34, height: 36, fontSize: 13 }} />
              </div>
              {showQ && results.length > 0 && (
                <div className="card fade-in" style={{ position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 200, overflow: 'hidden', maxHeight: 320, overflowY: 'auto' }}>
                  {results.map(u => (
                    <div key={u._id} onMouseDown={() => { navigate(`/profile/${u.username}`); setQ(''); setShowQ(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer' }}>
                      <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=7c3aed&color=fff`}
                        alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <p style={{ fontWeight: 600, margin: 0, fontSize: 13 }}>{u.username}</p>
                        <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{u.fullName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Desktop nav items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="hide-sm">
            {navItems.map(item => (
              <Link key={item.to} to={item.to} style={{ position: 'relative', textDecoration: 'none' }}>
                <div style={{ padding: '8px 10px', borderRadius: 10, fontSize: 20, cursor: 'pointer', background: isActive(item.to) ? 'rgba(124,58,237,.1)' : 'transparent', transition: 'background .15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title={item.label}>
                  {item.icon}
                  {item.badge > 0 && (
                    <span style={{ position: 'absolute', top: 3, right: 3, background: '#ef4444', color: 'white', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
              </Link>
            ))}

            {!user?.isAdmin && (
              <button onClick={() => setShowCreate(true)}
                style={{ padding: '8px 10px', borderRadius: 10, fontSize: 20, cursor: 'pointer', background: 'transparent', border: 'none', transition: 'background .15s' }}
                title="Create Post">
                ➕
              </button>
            )}

            {/* Avatar */}
            {!user?.isAdmin && (
              <Link to={`/profile/${user?.username}`} style={{ marginLeft: 4 }}>
                <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=7c3aed&color=fff`}
                  alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid #7c3aed', display: 'block' }} />
              </Link>
            )}

            <button onClick={handleLogout}
              style={{ padding: '7px 14px', background: '#fef2f2', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#ef4444', marginLeft: 4 }}>
              Logout
            </button>
          </div>

          {/* Mobile right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="show-mobile-flex">
            {!user?.isAdmin && (
              <Link to="/notifications" style={{ position: 'relative', textDecoration: 'none', fontSize: 22 }}>
                🔔
                {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: 'white', borderRadius: '50%', width: 14, height: 14, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{unread}</span>}
              </Link>
            )}
            <button onClick={() => setMobMenu(m => !m)}
              style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text)' }}>
              {mobMenu ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobMenu && (
          <div className="card fade-in" style={{ position: 'absolute', top: 62, right: 16, zIndex: 200, minWidth: 200, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ padding: 8 }}>
              {navItems.map(item => (
                <Link key={item.to} to={item.to} onClick={() => setMobMenu(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: 'var(--text)', background: isActive(item.to) ? 'rgba(124,58,237,.1)' : 'transparent', fontWeight: isActive(item.to) ? 700 : 500, fontSize: 14 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  {item.label}
                  {item.badge > 0 && <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', borderRadius: 99, padding: '1px 6px', fontSize: 11, fontWeight: 700 }}>{item.badge}</span>}
                </Link>
              ))}
              {!user?.isAdmin && (
                <>
                  <Link to={`/profile/${user?.username}`} onClick={() => setMobMenu(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: 'var(--text)', fontSize: 14, fontWeight: 500 }}>
                    <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=7c3aed&color=fff`}
                      alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                    Profile
                  </Link>
                  <button onClick={() => { setShowCreate(true); setMobMenu(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'none', border: 'none', color: 'var(--text)', fontSize: 14, fontWeight: 500, width: '100%', cursor: 'pointer' }}>
                    ➕ Create Post
                  </button>
                </>
              )}
              <button onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'none', border: 'none', color: '#ef4444', fontSize: 14, fontWeight: 600, width: '100%', cursor: 'pointer' }}>
                🚪 Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom nav (mobile) */}
      <div className="bottom-nav">
        {navItems.map(item => (
          <Link key={item.to} to={item.to}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, textDecoration: 'none', position: 'relative', padding: '6px 0' }}>
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            {item.badge > 0 && <span style={{ position: 'absolute', top: 2, right: 'calc(50% - 18px)', background: '#ef4444', color: 'white', borderRadius: '50%', width: 14, height: 14, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{item.badge}</span>}
          </Link>
        ))}
        <button onClick={() => setShowCreate(true)}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0' }}>
          <span style={{ fontSize: 22 }}>➕</span>
        </button>
        <Link to={`/profile/${user?.username}`}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', padding: '6px 0' }}>
          <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=7c3aed&color=fff`}
            alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: '2px solid #7c3aed' }} />
        </Link>
      </div>

      {/* Create post modal */}
      {showCreate && (
        <div onClick={() => setShowCreate(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 500 }}>
            <CreatePost />
            <button onClick={() => setShowCreate(false)}
              style={{ width: '100%', padding: 12, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}