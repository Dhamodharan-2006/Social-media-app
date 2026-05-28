import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../app/axios';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step,   setStep]   = useState(1);
  const [email,  setEmail]  = useState('');
  const [otp,    setOtp]    = useState(['', '', '', '', '', '']);
  const [pass,   setPass]   = useState('');
  const [cpass,  setCpass]  = useState('');
  const [loading, setLoad]  = useState(false);

  const onSend = async e => {
    e.preventDefault();
    setLoad(true);
    try {
      await API.post('/auth/forgot-password', { email });
      toast.success('OTP sent!');
      setStep(2);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    setLoad(false);
  };

  const onReset = async e => {
    e.preventDefault();
    if (pass !== cpass) { toast.error('Passwords do not match'); return; }
    setLoad(true);
    try {
      await API.post('/auth/reset-password', { email, otp: otp.join(''), newPassword: pass });
      toast.success('Password reset!');
      navigate('/login');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    setLoad(false);
  };

  const onOtpChange = (i, v) => {
    if (!/^\d*$/.test(v) || v.length > 1) return;
    const n = [...otp]; n[i] = v; setOtp(n);
    if (v && i < 5) document.getElementById(`fotp${i + 1}`)?.focus();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'linear-gradient(135deg,#0f172a,#1e1b4b)' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 380, padding: 36, textAlign: 'center', background: 'rgba(255,255,255,.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,.1)' }}>

        {/* Steps indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, background: step >= s ? 'linear-gradient(135deg,#7c3aed,#ec4899)' : 'rgba(255,255,255,.1)', color: 'white' }}>{s}</div>
          ))}
        </div>

        {step === 1 && (
          <>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
            <h2 style={{ color: 'white', fontWeight: 800, marginBottom: 8 }}>Forgot Password?</h2>
            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 14, marginBottom: 24 }}>Enter your email to reset</p>
            <form onSubmit={onSend}>
              <input className="input" type="email" placeholder="Email address" required
                value={email} onChange={e => setEmail(e.target.value)}
                style={{ marginBottom: 16, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: 'white' }} />
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: 13 }}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔑</div>
            <h2 style={{ color: 'white', fontWeight: 800, marginBottom: 8 }}>Reset Password</h2>
            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 14, marginBottom: 16 }}>Enter OTP sent to <strong style={{ color: '#a78bfa' }}>{email}</strong></p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
              {otp.map((d, i) => (
                <input key={i} id={`fotp${i}`} type="text" maxLength={1} value={d}
                  onChange={e => onOtpChange(i, e.target.value)}
                  style={{ width: 44, height: 50, textAlign: 'center', fontSize: 20, fontWeight: 800, borderRadius: 10, border: `2px solid ${d ? '#7c3aed' : 'rgba(255,255,255,.2)'}`, background: d ? 'rgba(124,58,237,.2)' : 'rgba(255,255,255,.05)', color: 'white', outline: 'none' }} />
              ))}
            </div>
            <form onSubmit={onReset}>
              <input className="input" type="password" placeholder="New password" required
                value={pass} onChange={e => setPass(e.target.value)}
                style={{ marginBottom: 10, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: 'white' }} />
              <input className="input" type="password" placeholder="Confirm password" required
                value={cpass} onChange={e => setCpass(e.target.value)}
                style={{ marginBottom: 16, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: 'white' }} />
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: 13 }}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}