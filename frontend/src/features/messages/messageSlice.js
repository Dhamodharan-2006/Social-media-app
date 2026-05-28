import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../app/axios';

export const fetchConvos   = createAsyncThunk('msg/convos',   async () => (await API.get('/messages/conversations')).data);
export const fetchMsgs     = createAsyncThunk('msg/messages', async id   => (await API.get(`/messages/${id}`)).data);
export const sendMsg       = createAsyncThunk('msg/send',     async ({ id, text }) => (await API.post(`/messages/${id}`, { text })).data);
export const fetchMsgUnread = createAsyncThunk('msg/unread',  async () => (await API.get('/messages/unread')).data.count);

const msgSlice = createSlice({
  name: 'messages',
  initialState: { convos: [], msgs: [], selected: null, loading: false, unread: 0 },
  reducers: {
    setSelected: (s, a) => { s.selected = a.payload; s.msgs = []; },
    pushMsg:     (s, a) => { if (!s.msgs.find(m => m._id === a.payload._id)) s.msgs.push(a.payload); },
    setUnread:   (s, a) => { s.unread = a.payload; },
    clearConvoUnread: (s, a) => {
      const c = s.convos.find(c => c.user._id === a.payload);
      if (c) { s.unread = Math.max(0, s.unread - (c.unreadCount || 0)); c.unreadCount = 0; }
    },
  },
  extraReducers: b => {
    b
      .addCase(fetchConvos.fulfilled,    (s, a) => { s.convos = a.payload; })
      .addCase(fetchMsgs.pending,        s => { s.loading = true; s.msgs = []; })
      .addCase(fetchMsgs.fulfilled,      (s, a) => { s.loading = false; s.msgs = a.payload; })
      .addCase(sendMsg.fulfilled,        (s, a) => { if (!s.msgs.find(m => m._id === a.payload._id)) s.msgs.push(a.payload); })
      .addCase(fetchMsgUnread.fulfilled, (s, a) => { s.unread = a.payload; });
  },
});

export const { setSelected, pushMsg, setUnread, clearConvoUnread } = msgSlice.actions;
export default msgSlice.reducer;