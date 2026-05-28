import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../features/auth/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Login() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { loading } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);

  const onSubmit = async e => {
    e.preventDefault();
    const r = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(r)) {
      toast.success(`Welcome back, ${r.payload.user.username}! 👋`);
      r.payload.user.isAdmin ? navigate('/admin') : navigate('/');
    } else {
      toast.error(r.payload?.error || 'Login failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)' }}>
      {/* Left brand */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, color: 'white' }}
           className="hide-sm">
        <div style={{ fontSize: 72, marginBottom: 12 }}>📸</div>
        <h1 style={{ fontSize: 48, fontWeight: 900, background: 'linear-gradient(135deg,#a78bfa,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 12 }}>
          SnapGram
        </h1>
        <p style={{ fontSize: 18, opacity: .8, textAlign: 'center', maxWidth: 300, lineHeight: 1.7 }}>
          Share moments, connect with friends, discover the world 🌍
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 32, justifyContent: 'center' }}>
          {['📸 Share Photos','🎬 Reels','💬 Messages','📖 Stories','🔍 Explore','🔔 Notifications'].map(f => (
            <span key={f} style={{ background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(10px)', padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: 500 }}>{f}</span>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="card fade-in" style={{ width: '100%', maxWidth: 380, padding: 36, background: 'rgba(255,255,255,.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📸</div>
            <h2 style={{ color: 'white', fontWeight: 800, fontSize: 24, marginBottom: 4 }}>Welcome back</h2>
            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 14 }}>Sign in to your account</p>
          </div>

          <form onSubmit={onSubmit}>
            <div style={{ marginBottom: 14 }}>
              <input className="input" type="email" placeholder="Email" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: 'white' }} />
            </div>
            <div style={{ marginBottom: 8, position: 'relative' }}>
              <input className="input" type={show ? 'text' : 'password'} placeholder="Password" required
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: 'white', paddingRight: 44 }} />
              <button type="button" onClick={() => setShow(!show)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                {show ? '🙈' : '👁️'}
              </button>
            </div>
            <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <Link to="/forgot-password" style={{ fontSize: 13, color: '#a78bfa', textDecoration: 'none' }}>Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: 13, fontSize: 15 }}>
              {loading ? '⏳ Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.15)' }} />
            <span style={{ color: 'rgba(255,255,255,.4)', fontSize: 13 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.15)' }} />
          </div>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.7)', fontSize: 14 }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#a78bfa', fontWeight: 700, textDecoration: 'none' }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}