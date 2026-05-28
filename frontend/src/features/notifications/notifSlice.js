import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../app/axios';

export const fetchNotifs   = createAsyncThunk('notifs/all',   async () => (await API.get('/notifications')).data);
export const fetchUnread   = createAsyncThunk('notifs/unread', async () => (await API.get('/notifications/unread')).data.count);
export const markRead      = createAsyncThunk('notifs/read',   async () => await API.put('/notifications/read'));

const notifSlice = createSlice({
  name: 'notifications',
  initialState: { list: [], unread: 0 },
  reducers: {
    addNotif:   (s, a) => { s.list.unshift(a.payload); s.unread += 1; },
    clearUnread: s => { s.unread = 0; s.list = s.list.map(n => ({ ...n, isRead: true })); },
  },
  extraReducers: b => {
    b
      .addCase(fetchNotifs.fulfilled,  (s, a) => { s.list = a.payload; })
      .addCase(fetchUnread.fulfilled,  (s, a) => { s.unread = a.payload; })
      .addCase(markRead.fulfilled,     (s)    => { s.unread = 0; });
  },
});

export const { addNotif, clearUnread } = notifSlice.actions;
export default notifSlice.reducer;