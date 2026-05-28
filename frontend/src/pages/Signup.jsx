import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../features/auth/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Signup() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { loading } = useSelector(s => s.auth);
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '' });
  const [show, setShow] = useState(false);

  const onSubmit = async e => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password min 6 chars'); return; }
    const r = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(r)) {
      toast.info('📧 Check your email for OTP!');
      navigate('/verify-otp', { state: { email: form.email } });
    } else {
      toast.error(r.payload?.error || 'Registration failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'linear-gradient(135deg,#0f172a,#1e1b4b)' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 420, padding: 36, background: 'rgba(255,255,255,.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📸</div>
          <h2 style={{ color: 'white', fontWeight: 800, fontSize: 24, marginBottom: 4 }}>Create account</h2>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 14 }}>Join SnapGram today!</p>
        </div>

        <form onSubmit={onSubmit}>
          {[
            { name: 'fullName',  placeholder: 'Full Name',  type: 'text'  },
            { name: 'username',  placeholder: 'Username',   type: 'text'  },
            { name: 'email',     placeholder: 'Email',      type: 'email' },
          ].map(f => (
            <div key={f.name} style={{ marginBottom: 12 }}>
              <input className="input" type={f.type} placeholder={f.placeholder} required={f.name !== 'fullName'}
                value={form[f.name]} onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: 'white' }} />
            </div>
          ))}
          <div style={{ marginBottom: 20, position: 'relative' }}>
            <input className="input" type={show ? 'text' : 'password'} placeholder="Password (min 6 chars)" required
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: 'white', paddingRight: 44 }} />
            <button type="button" onClick={() => setShow(!show)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
              {show ? '🙈' : '👁️'}
            </button>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: 13, fontSize: 15 }}>
            {loading ? '⏳ Creating...' : '🚀 Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.7)', fontSize: 14, marginTop: 20 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#a78bfa', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}