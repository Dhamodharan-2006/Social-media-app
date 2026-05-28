import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getMe } from './features/auth/authSlice';
import Navbar from './components/shared/Navbar';

import Login          from './pages/Login';
import Signup         from './pages/Signup';
import VerifyOTP      from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import Home           from './pages/Home';
import Explore        from './pages/Explore';
import Profile        from './pages/Profile';
import Notifications  from './pages/Notifications';
import Messages       from './pages/Messages';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers     from './pages/admin/AdminUsers';
import AdminPosts     from './pages/admin/AdminPosts';

function PrivateRoute({ children }) {
  const { token } = useSelector(s => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { token, user } = useSelector(s => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (!user?.isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AuthRoute({ children }) {
  const { token } = useSelector(s => s.auth);
  if (token) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const dispatch = useDispatch();
  const { token } = useSelector(s => s.auth);

  useEffect(() => {
    if (token) dispatch(getMe());
  }, [token, dispatch]);

  return (
    <Router>
      <Navbar />
      <div style={{ paddingBottom: 70 }}>
        <Routes>
          {/* Auth routes */}
          <Route path="/login"          element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/signup"         element={<AuthRoute><Signup /></AuthRoute>} />
          <Route path="/verify-otp"     element={<VerifyOTP />} />
          <Route path="/forgot-password"element={<ForgotPassword />} />

          {/* App routes */}
          <Route path="/"               element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/explore"        element={<PrivateRoute><Explore /></PrivateRoute>} />
          <Route path="/profile/:username" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/notifications"  element={<PrivateRoute><Notifications /></PrivateRoute>} />
          <Route path="/messages"       element={<PrivateRoute><Messages /></PrivateRoute>} />

          {/* Admin routes */}
          <Route path="/admin"          element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users"    element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/posts"    element={<AdminRoute><AdminPosts /></AdminRoute>} />
          <Route path="/admin/reported" element={<AdminRoute><AdminPosts reported={true} /></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}