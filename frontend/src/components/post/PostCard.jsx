import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { likePost, addComment, deletePost } from '../../features/posts/postSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../app/axios';

const timeAgo = d => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'just now'; if (s < 3600) return `${Math.floor(s/60)}m`; if (s < 86400) return `${Math.floor(s/3600)}h`; return `${Math.floor(s/86400)}d`;
};

export default function PostCard({ post }) {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector(s => s.auth);
  const [showComments, setShowComments] = useState(false);
  const [commentText,  setCommentText]  = useState('');
  const [isSaved,      setIsSaved]      = useState(false);
  const [showMenu,     setShowMenu]     = useState(false);
  const [imgIdx,       setImgIdx]       = useState(0);
  const [liked,        setLiked]        = useState(() => post.likes?.some(l => l === user?._id || l?._id === user?._id));
  const [likeCount,    setLikeCount]    = useState(post.likes?.length || 0);
  const [likeAnim,     setLikeAnim]     = useState(false);
  const [zoom,         setZoom]         = useState(false);

  const isOwn = post.user?._id === user?._id;

  const handleLike = async () => {
    setLiked(l => !l);
    setLikeCount(c => liked ? c - 1 : c + 1);
    setLikeAnim(true); setTimeout(() => setLikeAnim(false), 400);
    dispatch(likePost(post._id));
  };

  const handleDblClick = () => { if (!liked) handleLike(); };

  const handleComment = async e => {
    e.preventDefault();
    if (!commentText.trim()) return;
    dispatch(addComment({ id: post._id, text: commentText }));
    setCommentText('');
    toast.success('💬 Comment added!');
  };

  const handleSave = async () => {
    await API.put(`/posts/${post._id}/save`);
    setIsSaved(s => !s);
    toast.success(isSaved ? 'Removed from saved' : '🔖 Saved!');
  };

  const handleDelete = () => {
    if (window.confirm('Delete this post?')) {
      dispatch(deletePost(post._id));
      toast.success('Post deleted');
    }
    setShowMenu(false);
  };

  const handleReport = async () => {
    const reason = window.prompt('Reason for reporting:');
    if (reason) {
      await API.post(`/posts/${post._id}/report`, { reason });
      toast.info('Post reported');
    }
    setShowMenu(false);
  };

  const images = post.images || [];

  return (
    <>
      <div className="card fade-in" style={{ marginBottom: 20, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            onClick={() => navigate(`/profile/${post.user?.username}`)}>
            <div style={{ position: 'relative' }}>
              <img src={post.user?.avatar || `https://ui-avatars.com/api/?name=${post.user?.username}&background=7c3aed&color=fff`}
                alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid transparent', backgroundImage: 'linear-gradient(white,white),linear-gradient(135deg,#7c3aed,#ec4899)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box,border-box' }} />
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, background: '#22c55e', border: '2px solid white', borderRadius: '50%' }} />
            </div>
            <div>
              <p style={{ fontWeight: 700, margin: 0, fontSize: 14 }}>
                {post.user?.username}
                {post.user?.isVerified && <span style={{ marginLeft: 4, fontSize: 12 }}>✅</span>}
              </p>
              <p style={{ color: '#9ca3af', margin: 0, fontSize: 11 }}>
                {post.location ? `📍 ${post.location} · ` : ''}{timeAgo(post.createdAt)}
              </p>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowMenu(m => !m)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: '4px 8px', color: '#6b7280', borderRadius: 8 }}>
              ···
            </button>
            {showMenu && (
              <div className="card fade-in" style={{ position: 'absolute', right: 0, top: '100%', zIndex: 20, minWidth: 160, padding: 6 }}>
                {isOwn
                  ? <button onClick={handleDelete} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 14, borderRadius: 8 }}>🗑️ Delete Post</button>
                  : <button onClick={handleReport} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, borderRadius: 8 }}>🚩 Report Post</button>
                }
              </div>
            )}
          </div>
        </div>

        {/* Caption above (text posts) */}
        {post.caption && !images.length && !post.video && (
          <div style={{ padding: '8px 16px 16px' }}>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: 0 }}>{post.caption}</p>
          </div>
        )}

        {/* Media */}
        {images.length > 0 && (
          <div style={{ position: 'relative' }} onDoubleClick={handleDblClick} onClick={() => setZoom(true)}>
            <img src={images[imgIdx]} alt="post" style={{ width: '100%', maxHeight: 540, objectFit: 'cover', display: 'block', cursor: 'zoom-in' }} />
            {likeAnim && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 80, animation: 'heartBeat .4s ease', pointerEvents: 'none' }}>❤️</div>
            )}
            {images.length > 1 && (
              <>
                <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
                  {images.map((_, i) => <div key={i} style={{ width: i === imgIdx ? 20 : 6, height: 6, borderRadius: 99, background: i === imgIdx ? 'white' : 'rgba(255,255,255,.5)', transition: 'width .3s' }} />)}
                </div>
                {imgIdx > 0 && (
                  <button onClick={e => { e.stopPropagation(); setImgIdx(i => i - 1); }}
                    style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,.6)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>‹</button>
                )}
                {imgIdx < images.length - 1 && (
                  <button onClick={e => { e.stopPropagation(); setImgIdx(i => i + 1); }}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,.6)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>›</button>
                )}
              </>
            )}
          </div>
        )}
        {post.video && (
          <video src={post.video} controls style={{ width: '100%', maxHeight: 540, background: '#000', display: 'block' }} />
        )}

        {/* Actions */}
        <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={handleLike}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: liked ? '#ef4444' : 'var(--sub)', fontWeight: liked ? 700 : 400, transition: 'all .2s' }}>
            <span style={{ fontSize: 22, transition: 'transform .2s', transform: likeAnim ? 'scale(1.3)' : 'scale(1)' }}>{liked ? '❤️' : '🤍'}</span>
            {likeCount > 0 && likeCount}
          </button>

          <button onClick={() => setShowComments(c => !c)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--sub)', fontWeight: showComments ? 700 : 400 }}>
            <span style={{ fontSize: 20 }}>💬</span>
            {post.comments?.length > 0 && post.comments.length}
          </button>

          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 8, fontSize: 20, color: 'var(--sub)' }}>📤</button>

          <button onClick={handleSave}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 8, fontSize: 20, marginLeft: 'auto', color: isSaved ? '#7c3aed' : 'var(--sub)' }}>
            {isSaved ? '🔖' : '📄'}
          </button>
        </div>

        {/* Caption below image */}
        {post.caption && (images.length > 0 || post.video) && (
          <div style={{ padding: '2px 16px 6px' }}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
              <strong style={{ marginRight: 6 }}>{post.user?.username}</strong>{post.caption}
            </p>
          </div>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div style={{ padding: '0 16px 6px', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {post.tags.map(t => <span key={t} style={{ fontSize: 13, color: '#7c3aed', fontWeight: 500 }}>#{t}</span>)}
          </div>
        )}

        {/* Comments */}
        {showComments && (
          <div style={{ padding: '8px 16px 16px', borderTop: '1px solid var(--border)' }}>
            {post.comments?.slice(-5).map(c => (
              <div key={c._id} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
                <img src={c.user?.avatar || `https://ui-avatars.com/api/?name=${c.user?.username}&background=7c3aed&color=fff`}
                  alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 10, padding: '7px 12px' }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{c.user?.username} </span>
                  <span style={{ fontSize: 13 }}>{c.text}</span>
                </div>
              </div>
            ))}
            {post.comments?.length === 0 && (
              <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '8px 0' }}>No comments yet. Be first!</p>
            )}
            <form onSubmit={handleComment} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=7c3aed&color=fff`}
                alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              <input value={commentText} onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="input"
                style={{ flex: 1, height: 36, padding: '0 12px', fontSize: 13, borderRadius: 99 }} />
              <button type="submit" disabled={!commentText.trim()}
                style={{ background: commentText ? 'linear-gradient(135deg,#7c3aed,#ec4899)' : '#e5e7eb', border: 'none', borderRadius: 99, padding: '0 14px', color: 'white', fontWeight: 700, fontSize: 13, cursor: commentText ? 'pointer' : 'default', transition: 'all .2s' }}>
                Post
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Zoom modal */}
      {zoom && images.length > 0 && (
        <div onClick={() => setZoom(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, cursor: 'zoom-out' }}>
          <img src={images[imgIdx]} alt="post" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8 }} />
          <button onClick={() => setZoom(false)}
            style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,.15)', border: 'none', color: 'white', borderRadius: '50%', width: 40, height: 40, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
      )}
    </>
  );
}