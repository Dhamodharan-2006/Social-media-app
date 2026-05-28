import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../../features/posts/postSlice';
import { toast } from 'react-toastify';

export default function CreatePost() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [caption,  setCaption]  = useState('');
  const [files,    setFiles]    = useState([]);
  const [previews, setPreviews] = useState([]);
  const [location, setLocation] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const onFiles = e => {
    const selected = Array.from(e.target.files).slice(0, 10);
    setFiles(selected);
    setPreviews(selected.map(f => URL.createObjectURL(f)));
    setExpanded(true);
  };

  const removeFile = i => {
    setFiles(f => f.filter((_, j) => j !== i));
    setPreviews(p => p.filter((_, j) => j !== i));
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (!caption.trim() && files.length === 0) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('caption', caption);
    fd.append('location', location);
    files.forEach(f => fd.append('media', f));
    const r = await dispatch(createPost(fd));
    if (createPost.fulfilled.match(r)) {
      toast.success('✨ Post shared!');
      setCaption(''); setFiles([]); setPreviews([]); setLocation(''); setExpanded(false);
    } else {
      toast.error(r.payload?.error || 'Failed to post');
    }
    setLoading(false);
  };

  return (
    <div className="card" style={{ padding: 16, marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=7c3aed&color=fff`}
          alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <textarea value={caption} onChange={e => setCaption(e.target.value)}
            onFocus={() => setExpanded(true)}
            placeholder={`What's on your mind, ${user?.username?.split(' ')[0]}?`}
            rows={expanded ? 3 : 2}
            style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', fontSize: 15, fontFamily: 'inherit', color: 'var(--text)', background: 'transparent', lineHeight: 1.5 }} />

          {/* Media previews */}
          {previews.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {previews.map((p, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  {files[i]?.type.startsWith('video/')
                    ? <video src={p} style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 8 }} />
                    : <img src={p} alt="" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 8 }} />
                  }
                  <button onClick={() => removeFile(i)}
                    style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.6)', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', color: 'white', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              ))}
            </div>
          )}

          {expanded && (
            <>
              {/* Location */}
              <input className="input" placeholder="📍 Add location (optional)" value={location}
                onChange={e => setLocation(e.target.value)}
                style={{ marginTop: 10, fontSize: 13, padding: '8px 12px' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  <label title="Photo/Video" style={{ cursor: 'pointer', padding: '6px 10px', borderRadius: 8, fontSize: 18, color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500 }}>
                    🖼️ <span className="hide-sm">Photo/Video</span>
                    <input type="file" accept="image/*,video/*" multiple onChange={onFiles} style={{ display: 'none' }} />
                  </label>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setExpanded(false); setCaption(''); setFiles([]); setPreviews([]); setLocation(''); }}
                    style={{ padding: '8px 16px', background: 'none', border: '1px solid var(--border)', borderRadius: 99, cursor: 'pointer', fontSize: 13, color: 'var(--sub)' }}>
                    Cancel
                  </button>
                  <button onClick={onSubmit} disabled={loading || (!caption.trim() && files.length === 0)}
                    className="btn btn-primary" style={{ padding: '8px 20px' }}>
                    {loading ? 'Posting...' : 'Share'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}