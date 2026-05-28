import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifs, markRead, clearUnread } from '../features/notifications/notifSlice';
import { useNavigate } from 'react-router-dom';

const typeIcon = { like: '❤️', comment: '💬', follow: '👤', mention: '@', reply: '↩️', story_like: '📖' };
const timeAgo = d => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'now';
  if (s < 3600)  return `${Math.floor(s/60)}m`;
  if (s < 86400) return `${Math.floor(s/3600)}h`;
  return `${Math.floor(s/86400)}d`;
};

export default function Notifications() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { list }  = useSelector(s => s.notifications);

  useEffect(() => {
    dispatch(fetchNotifs());
    dispatch(markRead());
    dispatch(clearUnread());
  }, [dispatch]);

  const today  = list.filter(n => (Date.now() - new Date(n.createdAt)) < 86400000);
  const older  = list.filter(n => (Date.now() - new Date(n.createdAt)) >= 86400000);

  const Section = ({ title, items }) => items.length === 0 ? null : (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontWeight: 700, color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px 4px' }}>{title}</p>
      {items.map(n => (
        <div key={n._id}
          onClick={() => n.post && navigate(`/post/${n.post._id}`)}
          className="fade-in"
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, marginBottom: 4, cursor: n.post ? 'pointer' : 'default', background: n.isRead ? 'transparent' : 'rgba(124,58,237,.06)', border: `1px solid ${n.isRead ? 'var(--border)' : 'rgba(124,58,237,.15)'}`, transition: 'background .15s' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img src={n.sender?.avatar || `https://ui-avatars.com/api/?name=${n.sender?.username}&background=7c3aed&color=fff`}
              alt="" style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, border: '2px solid var(--card)' }}>
              {typeIcon[n.type] || '🔔'}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.4 }}>
              <strong>{n.sender?.username}</strong> {' '}
              {n.type === 'like'     && 'liked your post'}
              {n.type === 'comment'  && `commented: "${n.text?.substring(0, 40)}"`}
              {n.type === 'follow'   && 'started following you'}
              {n.type === 'mention'  && 'mentioned you'}
              {n.type === 'story_like' && 'liked your story'}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>{timeAgo(n.createdAt)} ago</p>
          </div>
          {n.post?.images?.[0] && (
            <img src={n.post.images[0]} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
          )}
          {!n.isRead && <div style={{ width: 8, height: 8, background: '#7c3aed', borderRadius: '50%', flexShrink: 0 }} />}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22, margin: 0 }}>Notifications</h2>
        <button onClick={() => dispatch(markRead())}
          style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
          Mark all read
        </button>
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#6b7280' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🔔</div>
          <h3>All caught up!</h3>
          <p style={{ fontSize: 14 }}>No new notifications</p>
        </div>
      ) : (
        <>
          <Section title="Today"   items={today} />
          <Section title="Earlier" items={older} />
        </>
      )}
    </div>
  );
}