import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuggested, followAction } from '../../features/users/userSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Suggested() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { suggested } = useSelector(s => s.users);
  const { user, profile } = useSelector(s => s.auth);

  useEffect(() => { dispatch(fetchSuggested()); }, [dispatch]);

  if (suggested.length === 0) return null;

  return (
    <div>
      {/* Profile summary */}
      {profile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', marginBottom: 16 }}>
          <img src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.username}&background=7c3aed&color=fff`}
            alt="" onClick={() => navigate(`/profile/${profile.username}`)}
            style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: '2px solid transparent', backgroundImage: 'linear-gradient(white,white),linear-gradient(135deg,#7c3aed,#ec4899)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box,border-box' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, margin: 0, fontSize: 14, cursor: 'pointer' }} onClick={() => navigate(`/profile/${profile.username}`)}>
              {profile.username}
              {profile.isVerified && <span style={{ marginLeft: 4 }}>✅</span>}
            </p>
            <p style={{ color: '#6b7280', margin: 0, fontSize: 13 }}>{profile.fullName}</p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ fontWeight: 700, margin: 0, color: '#6b7280', fontSize: 13, textTransform: 'uppercase', letterSpacing: .5 }}>Suggested for you</p>
      </div>

      {suggested.map(u => (
        <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=7c3aed&color=fff`}
            alt="" onClick={() => navigate(`/profile/${u.username}`)}
            style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => navigate(`/profile/${u.username}`)}>
            <p style={{ fontWeight: 600, margin: 0, fontSize: 13 }}>{u.username}</p>
            <p style={{ color: '#9ca3af', margin: 0, fontSize: 12 }}>{(u.followers?.length || 0).toLocaleString()} followers</p>
          </div>
          <button onClick={async () => { await dispatch(followAction(u._id)); toast.success(`Following @${u.username}`); }}
            style={{ background: 'none', border: 'none', color: '#7c3aed', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            Follow
          </button>
        </div>
      ))}

      <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 20 }}>© 2024 SnapGram · All rights reserved</p>
    </div>
  );
}