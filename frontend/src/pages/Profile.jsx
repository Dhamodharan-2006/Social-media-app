import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, followAction } from '../features/users/userSlice';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import EditProfile from '../components/shared/EditProfile';

export default function Profile() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { username } = useParams();
  const { profile, posts, loading } = useSelector(s => s.users);
  const { user }  = useSelector(s => s.auth);
  const [tab,     setTab]     = useState('posts');
  const [showEdit, setShowEdit] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    dispatch(fetchProfile(username));
  }, [username, dispatch]);

  useEffect(() => {
    if (profile) {
      setIsFollowing(profile.followers?.some(f => f._id === user?._id || f === user?._id));
      setFollowerCount(profile.followers?.length || 0);
    }
  }, [profile, user]);

  const isOwn = user?._id === profile?._id || user?.username === username;

  const handleFollow = async () => {
    const was = isFollowing;
    setIsFollowing(!was);
    setFollowerCount(c => was ? c - 1 : c + 1);
    const r = await dispatch(followAction(profile._id));
    if (followAction.fulfilled.match(r)) {
      toast.success(r.payload.isFollowing ? `Following @${profile.username}` : `Unfollowed @${profile.username}`);
    }
  };

  if (loading) return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>
      <div className="skeleton" style={{ height: 200, borderRadius: 0 }} />
      <div style={{ display: 'flex', gap: 20, padding: '0 24px', marginTop: -40 }}>
        <div className="skeleton" style={{ width: 90, height: 90, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1, paddingTop: 50 }}>
          <div className="skeleton" style={{ width: 160, height: 20, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 240, height: 14 }} />
        </div>
      </div>
    </div>
  );

  if (!profile) return (
    <div style={{ textAlign: 'center', marginTop: 80 }}>
      <div style={{ fontSize: 50, marginBottom: 12 }}>😔</div>
      <h2>User not found</h2>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {showEdit && <EditProfile onClose={() => setShowEdit(false)} />}

      {/* Cover */}
      <div style={{ height: 200, background: profile.coverPhoto ? `url(${profile.coverPhoto}) center/cover` : 'linear-gradient(135deg,#7c3aed,#ec4899)', position: 'relative', borderRadius: '0 0 0 0', overflow: 'hidden' }}>
        {!profile.coverPhoto && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: .1, fontSize: 80 }}>📸</div>
        )}
      </div>

      {/* Profile info */}
      <div style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', padding: '0 24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ marginTop: -40, position: 'relative' }}>
            <div style={{ padding: 3, background: 'var(--card)', borderRadius: '50%', display: 'inline-block' }}>
              <img
                src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.username}&background=7c3aed&color=fff&size=128`}
                alt={profile.username}
                style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', display: 'block', border: '3px solid var(--card)' }}
              />
            </div>
            {profile.isVerified && (
              <div style={{ position: 'absolute', bottom: 4, right: 4, background: 'white', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✅</div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {isOwn ? (
              <>
                <button onClick={() => setShowEdit(true)} className="btn btn-outline" style={{ padding: '8px 18px', fontSize: 14 }}>
                  Edit Profile
                </button>
              </>
            ) : (
              <>
                <button onClick={handleFollow}
                  className={isFollowing ? 'btn btn-outline' : 'btn btn-primary'}
                  style={{ padding: '8px 22px', fontSize: 14 }}>
                  {isFollowing ? 'Following ✓' : '+ Follow'}
                </button>
                <button onClick={() => navigate('/messages')} className="btn btn-outline" style={{ padding: '8px 16px' }}>
                  💬 Message
                </button>
              </>
            )}
          </div>
        </div>

        <h2 style={{ fontWeight: 800, fontSize: 20, margin: '0 0 2px' }}>{profile.fullName || profile.username}</h2>
        <p style={{ color: '#6b7280', margin: '0 0 8px', fontSize: 14 }}>@{profile.username}</p>
        {profile.bio && <p style={{ margin: '0 0 8px', fontSize: 14, lineHeight: 1.5, maxWidth: 500 }}>{profile.bio}</p>}
        {profile.website && (
          <a href={profile.website} target="_blank" rel="noreferrer"
            style={{ color: '#7c3aed', fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            🔗 {profile.website.replace(/^https?:\/\//, '')}
          </a>
        )}

        <div style={{ display: 'flex', gap: 28, marginTop: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Posts',      val: posts.length   },
            { label: 'Followers',  val: followerCount  },
            { label: 'Following',  val: profile.following?.length || 0 },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setTab('posts')}>
              <p style={{ fontWeight: 800, fontSize: 18, margin: 0 }}>{s.val.toLocaleString()}</p>
              <p style={{ color: '#6b7280', margin: 0, fontSize: 13 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
        {['posts', 'saved'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, padding: '14px 0', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, background: 'transparent', borderTop: tab === t ? '2px solid #0f172a' : '2px solid transparent', color: tab === t ? '#0f172a' : '#6b7280', transition: 'all .2s' }}>
            {t === 'posts' ? '▦ Posts' : '🔖 Saved'}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ padding: 2 }}>
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
            <div style={{ fontSize: 50, marginBottom: 12 }}>📷</div>
            <p style={{ fontWeight: 600 }}>No posts yet</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            {posts.map(post => (
              <div key={post._id} onClick={() => navigate(`/post/${post._id}`)}
                style={{ aspectRatio: '1', overflow: 'hidden', cursor: 'pointer', position: 'relative', background: '#f3f4f6' }}
                onMouseEnter={e => e.currentTarget.querySelector('.ov').style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.querySelector('.ov').style.opacity = '0'}>
                {post.images?.[0]
                  ? <img src={post.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s' }} />
                  : post.video
                  ? <div style={{ width: '100%', height: '100%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🎬</div>
                  : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#ede9fe,#fce7f3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
                      <p style={{ fontSize: 11, color: '#5b21b6', textAlign: 'center', lineHeight: 1.4 }}>{post.caption?.substring(0, 80)}</p>
                    </div>
                }
                <div className="ov" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, opacity: 0, transition: 'opacity .2s' }}>
                  <span style={{ color: 'white', fontWeight: 700 }}>❤️ {post.likes?.length || 0}</span>
                  <span style={{ color: 'white', fontWeight: 700 }}>💬 {post.comments?.length || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}