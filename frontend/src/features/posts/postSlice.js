import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../app/axios';

export const fetchFeed = createAsyncThunk('posts/feed', async (page = 1) => {
  return (await API.get(`/posts/feed?page=${page}`)).data;
});

export const fetchExplore = createAsyncThunk('posts/explore', async (page = 1) => {
  return (await API.get(`/posts/explore?page=${page}`)).data;
});

export const createPost = createAsyncThunk('posts/create', async (formData, { rejectWithValue }) => {
  try {
    return (await API.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  } catch (e) { return rejectWithValue(e.response?.data); }
});

export const likePost = createAsyncThunk('posts/like', async id => {
  return { id, ...(await API.put(`/posts/${id}/like`)).data };
});

export const addComment = createAsyncThunk('posts/comment', async ({ id, text }) => {
  return { id, comment: (await API.post(`/posts/${id}/comment`, { text })).data };
});

export const deletePost = createAsyncThunk('posts/delete', async id => {
  await API.delete(`/posts/${id}`);
  return id;
});

export const savePost = createAsyncThunk('posts/save', async id => {
  return { id, ...(await API.put(`/posts/${id}/save`)).data };
});

const postSlice = createSlice({
  name: 'posts',
  initialState: { feed: [], explore: [], loading: false, hasMore: true, explorHasMore: true },
  reducers: {
    prependPost: (s, a) => { s.feed.unshift(a.payload); },
    removePost:  (s, a) => { s.feed = s.feed.filter(p => p._id !== a.payload); s.explore = s.explore.filter(p => p._id !== a.payload); },
  },
  extraReducers: b => {
    b
      .addCase(fetchFeed.pending,    s => { s.loading = true; })
      .addCase(fetchFeed.fulfilled,  (s, a) => {
        s.loading = false;
        s.feed = a.meta.arg === 1 ? a.payload.posts : [...s.feed, ...a.payload.posts];
        s.hasMore = a.payload.hasMore;
      })
      .addCase(fetchExplore.fulfilled, (s, a) => {
        s.explore = a.meta.arg === 1 ? a.payload.posts : [...s.explore, ...a.payload.posts];
        s.explorHasMore = a.payload.hasMore;
      })
      .addCase(createPost.fulfilled, (s, a) => { s.feed.unshift(a.payload); })
      .addCase(likePost.fulfilled,   (s, a) => {
        const p = s.feed.find(x => x._id === a.payload.id);
        if (p) { p._liked = a.payload.isLiked; p.likes = Array(a.payload.likes).fill(null); }
      })
      .addCase(addComment.fulfilled, (s, a) => {
        const p = s.feed.find(x => x._id === a.payload.id);
        if (p) p.comments.push(a.payload.comment);
      })
      .addCase(deletePost.fulfilled, (s, a) => {
        s.feed = s.feed.filter(p => p._id !== a.payload);
        s.explore = s.explore.filter(p => p._id !== a.payload);
      });
  },
});

export const { prependPost, removePost } = postSlice.actions;
export default postSlice.reducer;