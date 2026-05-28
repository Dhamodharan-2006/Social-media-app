import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../app/axios';

const saved  = localStorage.getItem('token');
const decode = t => { try { return JSON.parse(atob(t.split('.')[1])); } catch { return null; } };
const info   = saved ? decode(saved) : null;

export const registerUser = createAsyncThunk('auth/register', async (d, { rejectWithValue }) => {
  try { return (await API.post('/auth/register', d)).data; }
  catch (e) { return rejectWithValue(e.response?.data || { error: 'Failed' }); }
});

export const verifyOTPAction = createAsyncThunk('auth/verify', async (d, { rejectWithValue }) => {
  try {
    const res = await API.post('/auth/verify-otp', d);
    localStorage.setItem('token', res.data.token);
    return res.data;
  } catch (e) { return rejectWithValue(e.response?.data || { error: 'Failed' }); }
});

export const loginUser = createAsyncThunk('auth/login', async (d, { rejectWithValue }) => {
  try {
    const res = await API.post('/auth/login', d);
    localStorage.setItem('token', res.data.token);
    return res.data;
  } catch (e) { return rejectWithValue(e.response?.data || { error: 'Invalid credentials' }); }
});

export const getMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try { return (await API.get('/auth/me')).data; }
  catch (e) { return rejectWithValue(e.response?.data); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token:   saved,
    user:    info,
    profile: null,
    loading: false,
    error:   null,
    message: null,
  },
  reducers: {
    logout: s => {
      s.token = null; s.user = null; s.profile = null;
      localStorage.removeItem('token');
    },
    clearMsg: s => { s.error = null; s.message = null; },
    setProfile: (s, a) => { s.profile = a.payload; },
  },
  extraReducers: b => {
    const pend = s => { s.loading = true; s.error = null; };
    b
      .addCase(loginUser.pending, pend)
      .addCase(loginUser.fulfilled, (s, a) => {
        s.loading = false; s.token = a.payload.token; s.user = a.payload.user;
      })
      .addCase(loginUser.rejected, (s, a) => { s.loading = false; s.error = a.payload?.error; })
      .addCase(registerUser.pending, pend)
      .addCase(registerUser.fulfilled, (s, a) => { s.loading = false; s.message = a.payload.message; })
      .addCase(registerUser.rejected, (s, a) => { s.loading = false; s.error = a.payload?.error; })
      .addCase(verifyOTPAction.fulfilled, (s, a) => { s.token = a.payload.token; s.user = a.payload.user; })
      .addCase(getMe.fulfilled, (s, a) => { s.profile = a.payload; });
  },
});

export const { logout, clearMsg, setProfile } = authSlice.actions;
export default authSlice.reducer;