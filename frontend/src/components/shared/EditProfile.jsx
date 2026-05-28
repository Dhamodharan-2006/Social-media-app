import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setProfile } from '../../features/auth/authSlice';
import { toast } from 'react-toastify';
import API from '../../app/axios';

export default function EditProfile({ onClose }) {
  const dispatch  = useDispatch();
  const { profile } = useSelector(s => s.auth);
  const [form, setForm] = useState({
    fullName:  profile?.fullName  || '',
    bio:       profile?.bio       || '',
    website:   profile?.website   || '',
    gender:    profile?.gender    || 'prefer_not_to_say',
    isPrivate: profile?.isPrivate || false,
  });
  const [avatar,   setAvatar]   = useState(null);
  const [prevAvatar, setPrevA]  = useState(profile?.avatar || '');
  const [loading,  setLoading]  = useState(false);

  const onFile = e => {
    const f = e.target.files[0];
    if (f) { setAvatar(f); setPrevA(URL.createObjectURL(f)); }
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (avatar) fd.append('avatar', avatar);
    try {
      const r = await API.put('/users/update', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      dispatch(setProfile(r.data.user));
      toast.success('Profile updated! ✅');
      onClose();
    } catch { toast.error('Failed to update'); }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 800, margin: 0, fontSize: 18 }}>Edit Profile</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' }}>✕</button>
        </div>

        {/* Avatar */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <label style={{ cursor: 'pointer', display: 'inline-block' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={prevAvatar || `https://ui-avatars.com/api/?name=${profile?.username}&background=7c3aed&color=fff&size=128`}
                alt="" style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid #7c3aed' }} />
              <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'linear-gradient(135deg,#7c3aed,#ec4899)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                📷
              </div>
            </div>
            <p style={{ color: '#7c3aed', fontSize: 13, margin: '8px 0 0', fontWeight: 600 }}>Change Photo</p>
            <input type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
          </label>
        </div>

        <form onSubmit={onSubmit}>
          {[
            { name: 'fullName', label: 'Full Name',   placeholder: 'Your full name'                },
            { name: 'bio',      label: 'Bio',          placeholder: 'Tell something about yourself..', textarea: true },
            { name: 'website',  label: 'Website',      placeholder: 'https://yourwebsite.com'       },
          ].map(f => (
            <div key={f.name} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 5 }}>{f.label}</label>
              {f.textarea
                ? <textarea className="input" rows={3} placeholder={f.placeholder} value={form[f.name]}
                    onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                    style={{ resize: 'none', fontFamily: 'inherit' }} />
                : <input className="input" placeholder={f.placeholder} value={form[f.name]}
                    onChange={e => setForm({ ...form, [f.name]: e.target.value })} />
              }
            </div>
          ))}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 5 }}>Gender</label>
            <select className="input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: 14, background: '#f9fafb', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div>
              <p style={{ fontWeight: 600, margin: 0, fontSize: 14 }}>Private Account</p>
              <p style={{ color: '#6b7280', margin: '2px 0 0', fontSize: 12 }}>Only followers can see your posts</p>
            </div>
            <div style={{ position: 'relative', width: 44, height: 24, cursor: 'pointer' }}
              onClick={() => setForm(f => ({ ...f, isPrivate: !f.isPrivate }))}>
              <div style={{ width: 44, height: 24, borderRadius: 99, background: form.isPrivate ? '#7c3aed' : '#d1d5db', transition: 'background .3s' }} />
              <div style={{ position: 'absolute', top: 2, left: form.isPrivate ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left .3s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}