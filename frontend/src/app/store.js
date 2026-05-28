import { configureStore } from '@reduxjs/toolkit';
import authReducer    from '../features/auth/authSlice';
import postReducer    from '../features/posts/postSlice';
import userReducer    from '../features/users/userSlice';
import notifReducer   from '../features/notifications/notifSlice';
import messageReducer from '../features/messages/messageSlice';

export const store = configureStore({
  reducer: {
    auth:          authReducer,
    posts:         postReducer,
    users:         userReducer,
    notifications: notifReducer,
    messages:      messageReducer,
  },
});