import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { verifyOTPAction } from '../features/auth/authSlice';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../app/axios';

export default function VerifyOTP() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { state } = useLocation();
  const email     = state?.email || '';
  const [otp,     setOtp]     = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  const onChange = (i, v) => {
    if (!/^\d*$/.test(v) || v.length > 1) return;
    const n = [...otp]; n[i] = v; setOtp(n);
    if (v && i < 5) document.getElementById(`otp${i + 1}`)?.focus();
  };

  const onVerify = async () => {
    const val = otp.join('');
    if (val.length !== 6) { toast.error('Enter 6-digit OTP'); return; }
    setLoading(true);
    const r = await dispatch(verifyOTPAction({ email, otp: val }));
    if (verifyOTPAction.fulfilled.match(r)) {
      toast.success('🎉 Account verified! Welcome!');
      navigate('/');
    } else {
      toast.error(r.payload?.error || 'Invalid OTP');
    }
    setLoading(false);
  };

  const onResend = async () => {
    try {
      await API.post('/auth/resend-otp', { email });
      toast.success('OTP resent!');
    } catch { toast.error('Failed'); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'linear-gradient(135deg,#0f172a,#1e1b4b)' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 380, padding: 36, textAlign: 'center', background: 'rgba(255,255,255,.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,.1)' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>📧</div>
        <h2 style={{ color: 'white', fontWeight: 800, marginBottom: 8 }}>Check your email</h2>
        <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 14, marginBottom: 24 }}>
          We sent a 6-digit OTP to<br />
          <strong style={{ color: '#a78bfa' }}>{email}</strong>
        </p>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
          {otp.map((d, i) => (
            <input key={i} id={`otp${i}`} type="text" maxLength={1} value={d}
              onChange={e => onChange(i, e.target.value)}
              onKeyDown={e => { if (e.key === 'Backspace' && !otp[i] && i > 0) document.getElementById(`otp${i - 1}`)?.focus(); }}
              style={{ width: 46, height: 54, textAlign: 'center', fontSize: 22, fontWeight: 800, borderRadius: 10, border: `2px solid ${d ? '#7c3aed' : 'rgba(255,255,255,.2)'}`, background: d ? 'rgba(124,58,237,.2)' : 'rgba(255,255,255,.05)', color: 'white', outline: 'none', transition: 'all .2s' }} />
          ))}
        </div>

        <button onClick={onVerify} disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: 13, marginBottom: 12, fontSize: 15 }}>
          {loading ? '⏳ Verifying...' : '✅ Verify Account'}
        </button>
        <button onClick={onResend} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          Resend OTP
        </button>
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 12, marginTop: 12 }}>Expires in 10 minutes</p>
      </div>
    </div>
  );
}