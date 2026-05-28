import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../app/axios';

export const searchUsersAction = createAsyncThunk('users/search',    async q        => (await API.get(`/users/search?q=${q}`)).data);
export const fetchSuggested    = createAsyncThunk('users/suggested', async ()       => (await API.get('/users/suggested')).data);
export const fetchProfile      = createAsyncThunk('users/profile',   async username => (await API.get(`/users/${username}`)).data);
export const followAction      = createAsyncThunk('users/follow',    async id       => ({ id, ...(await API.put(`/users/follow/${id}`)).data }));

const userSlice = createSlice({
  name: 'users',
  initialState: { results: [], suggested: [], profile: null, posts: [], loading: false },
  reducers: {},
  extraReducers: b => {
    b
      .addCase(searchUsersAction.fulfilled, (s, a) => { s.results  = a.payload; })
      .addCase(fetchSuggested.fulfilled,    (s, a) => { s.suggested = a.payload; })
      .addCase(fetchProfile.pending,        s => { s.loading = true; })
      .addCase(fetchProfile.fulfilled,      (s, a) => { s.loading = false; s.profile = a.payload.user; s.posts = a.payload.posts; });
  },
});

export default userSlice.reducer;