import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import API from '../../app/axios';

export default function StoryBar() {
  const { user }     = useSelector(s => s.auth);
  const [stories,    setStories]    = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [storyIdx,   setStoryIdx]   = useState(0);
  const [progress,   setProgress]   = useState(0);
  const [uploading,  setUploading]  = useState(false);

  useEffect(() => {
    API.get('/stories').then(r => setStories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) return;
    setProgress(0);
    const iv = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(iv); nextStory(); return 0; }
        return p + 2;
      });
    }, 100);
    return () => clearInterval(iv);
  }, [selected, storyIdx]);

  const nextStory = () => {
    if (storyIdx < selected.stories.length - 1) setStoryIdx(i => i + 1);
    else { setSelected(null); setStoryIdx(0); }
  };

  const onUpload = async e => {
    const f = e.target.files[0]; if (!f) return;
    setUploading(true);
    const fd = new FormData(); fd.append('media', f);
    try {
      await API.post('/stories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const r = await API.get('/stories'); setStories(r.data);
      toast.success('📖 Story added!');
    } catch { toast.error('Failed'); }
    setUploading(false);
  };

  return (
    <>
      <div className="card" style={{ padding: '14px 16px', marginBottom: 20, overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', minWidth: 'max-content' }}>
          {/* Add story */}
          <label style={{ cursor: 'pointer', textAlign: 'center', flexShrink: 0 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: '2px dashed #7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 4px', background: uploading ? '#ede9fe' : 'transparent', transition: 'all .2s' }}>
              {uploading ? <div style={{ width: 20, height: 20, border: '2px solid #7c3aed', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} /> : '+'}
            </div>
            <p style={{ fontSize: 11, color: '#6b7280', margin: 0, maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Add Story</p>
            <input type="file" accept="image/*,video/*" onChange={onUpload} style={{ display: 'none' }} />
          </label>

          {stories.map(g => (
            <div key={g.user._id} onClick={() => { setSelected(g); setStoryIdx(0); }}
              style={{ cursor: 'pointer', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ padding: 2, borderRadius: '50%', background: g.hasUnseen ? 'linear-gradient(135deg,#f97316,#ec4899,#8b5cf6)' : '#d1d5db', margin: '0 auto 4px', width: 62, height: 62, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform .2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                <img src={g.user.avatar || `https://ui-avatars.com/api/?name=${g.user.username}&background=7c3aed&color=fff`}
                  alt="" style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--card)' }} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--sub)', margin: 0, maxWidth: 62, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {g.user._id === user?._id ? 'Your Story' : g.user.username}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Viewer */}
      {selected && (
        <div onClick={() => { setSelected(null); setStoryIdx(0); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.96)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            {/* Progress */}
            <div style={{ position: 'absolute', top: 10, left: 12, right: 12, display: 'flex', gap: 3, zIndex: 3 }}>
              {selected.stories.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 3, background: 'rgba(255,255,255,.3)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'white', borderRadius: 99, width: i < storyIdx ? '100%' : i === storyIdx ? `${progress}%` : '0%', transition: 'width .1s linear' }} />
                </div>
              ))}
            </div>

            {/* User info */}
            <div style={{ position: 'absolute', top: 22, left: 14, right: 44, display: 'flex', alignItems: 'center', gap: 10, zIndex: 3 }}>
              <img src={selected.user.avatar || `https://ui-avatars.com/api/?name=${selected.user.username}&background=fff&color=7c3aed`}
                alt="" style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid white', objectFit: 'cover' }} />
              <div>
                <p style={{ color: 'white', fontWeight: 700, margin: 0, fontSize: 14 }}>{selected.user.username}</p>
                <p style={{ color: 'rgba(255,255,255,.7)', margin: 0, fontSize: 11 }}>{selected.stories[storyIdx]?.viewers?.length || 0} views</p>
              </div>
            </div>

            {/* Content */}
            {selected.stories[storyIdx]?.image
              ? <img src={selected.stories[storyIdx].image} alt="" style={{ width: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12 }} />
              : selected.stories[storyIdx]?.video
              ? <video src={selected.stories[storyIdx].video} autoPlay muted style={{ width: '100%', maxHeight: '85vh', borderRadius: 12 }} />
              : (
                <div style={{ width: '100%', height: '60vh', background: selected.stories[storyIdx]?.bgColor || '#7c3aed', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                  <p style={{ color: selected.stories[storyIdx]?.textColor || 'white', fontSize: 22, fontWeight: 700, textAlign: 'center', lineHeight: 1.4 }}>{selected.stories[storyIdx]?.text}</p>
                </div>
              )
            }

            {/* Close */}
            <button onClick={() => setSelected(null)}
              style={{ position: 'absolute', top: 18, right: 12, background: 'rgba(255,255,255,.15)', border: 'none', color: 'white', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>✕</button>

            {/* Nav */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', zIndex: 2 }}>
              <div style={{ flex: 1 }} onClick={() => storyIdx > 0 ? setStoryIdx(i => i - 1) : null} />
              <div style={{ flex: 1 }} onClick={nextStory} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}