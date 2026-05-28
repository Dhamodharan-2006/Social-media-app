import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConvos, fetchMsgs, sendMsg, setSelected, pushMsg, clearConvoUnread } from '../features/messages/messageSlice';
import { fetchMsgUnread } from '../features/messages/messageSlice';
import getSocket from '../app/socket';
import { toast } from 'react-toastify';
import API from '../app/axios';

const timeAgo = d => {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'now'; if (s < 3600) return `${Math.floor(s/60)}m`; if (s < 86400) return `${Math.floor(s/3600)}h`;
  return new Date(d).toLocaleDateString();
};

export default function Messages() {
  const dispatch = useDispatch();
  const { convos, msgs, selected, loading } = useSelector(s => s.messages);
  const { user } = useSelector(s => s.auth);
  const [text,    setText]    = useState('');
  const [typing,  setTyping]  = useState(false);
  const [onlines, setOnlines] = useState([]);
  const [search,  setSearch]  = useState('');
  const [srResults, setSrResults] = useState([]);
  const [mobile,  setMobile]  = useState(false);
  const [showChat, setShowChat] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    dispatch(fetchConvos());
    const socket = getSocket(user?._id);
    socket.on('online_users', setOnlines);
    socket.on('receive_message', msg => {
      dispatch(pushMsg(msg));
      dispatch(fetchConvos());
    });
    socket.on('typing',      d => { if (d.senderId === selected?._id) setTyping(true); });
    socket.on('stop_typing', d => { if (d.senderId === selected?._id) setTyping(false); });
    const isMob = window.innerWidth < 768;
    setMobile(isMob);
    return () => { socket.off('online_users'); socket.off('receive_message'); socket.off('typing'); socket.off('stop_typing'); };
  }, [user?._id]);

  useEffect(() => {
    if (selected) {
      dispatch(fetchMsgs(selected._id));
      dispatch(clearConvoUnread(selected._id));
      if (mobile) setShowChat(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [selected]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const handleSend = async e => {
    e?.preventDefault();
    if (!text.trim() || !selected) return;
    const socket = getSocket(user?._id);
    socket.emit('stop_typing', { senderId: user._id, receiverId: selected._id });
    const r = await dispatch(sendMsg({ id: selected._id, text: text.trim() }));
    if (sendMsg.fulfilled.match(r)) {
      socket.emit('send_message', { ...r.payload, receiverId: selected._id });
      setText('');
    }
  };

  const handleTyping = e => {
    setText(e.target.value);
    const socket = getSocket(user?._id);
    if (selected) {
      socket.emit('typing', { senderId: user._id, receiverId: selected._id });
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => socket.emit('stop_typing', { senderId: user._id, receiverId: selected._id }), 1500);
    }
  };

  const searchUsers = async v => {
    setSearch(v);
    if (!v.trim()) { setSrResults([]); return; }
    const r = await API.get(`/users/search?q=${v}`);
    setSrResults(r.data);
  };

  const isOnline = id => onlines.includes(id?.toString());

  const dark = { bg: 'var(--bg)', card: 'var(--card)', border: 'var(--border)', text: 'var(--text)', sub: '#6b7280' };

  return (
    <div style={{ height: 'calc(100vh - 62px)', display: 'flex', maxWidth: 960, margin: '0 auto', border: `1px solid ${dark.border}`, borderTop: 'none', overflow: 'hidden' }}>

      {/* Sidebar */}
      <div style={{ width: mobile ? '100%' : 320, flexShrink: 0, borderRight: `1px solid ${dark.border}`, background: dark.card, display: mobile && showChat ? 'none' : 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${dark.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>Messages</h3>
          </div>
          <div style={{ position: 'relative' }}>
            <input className="input" placeholder="Search people..."
              value={search} onChange={e => searchUsers(e.target.value)}
              style={{ fontSize: 13 }} />
            {srResults.length > 0 && search && (
              <div className="card" style={{ position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 100, overflow: 'hidden', maxHeight: 260, overflowY: 'auto' }}>
                {srResults.map(u => (
                  <div key={u._id} onMouseDown={() => { dispatch(setSelected(u)); setSearch(''); setSrResults([]); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer' }}>
                    <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=7c3aed&color=fff`}
                      alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <p style={{ fontWeight: 600, margin: 0, fontSize: 14 }}>{u.username}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{u.fullName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {convos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>💬</div>
              <p style={{ fontWeight: 600 }}>No conversations yet</p>
              <p style={{ fontSize: 13 }}>Search for people to start chatting</p>
            </div>
          )}
          {convos.map(c => {
            const isSel = selected?._id === c.user._id;
            const online = isOnline(c.user._id);
            return (
              <div key={c.user._id} onClick={() => dispatch(setSelected(c.user))}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', background: isSel ? 'rgba(124,58,237,.08)' : 'transparent', borderLeft: `3px solid ${isSel ? '#7c3aed' : 'transparent'}`, transition: 'all .15s' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img src={c.user.avatar || `https://ui-avatars.com/api/?name=${c.user.username}&background=7c3aed&color=fff`}
                    alt="" style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, background: online ? '#22c55e' : '#9ca3af', border: '2px solid var(--card)', borderRadius: '50%' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <p style={{ fontWeight: c.unreadCount > 0 ? 700 : 600, margin: 0, fontSize: 14 }}>{c.user.username}</p>
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, flexShrink: 0 }}>{timeAgo(c.lastMessage?.createdAt)}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontSize: 13, color: '#6b7280', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', flex: 1 }}>
                      {c.lastMessage?.sender?._id === user?._id ? 'You: ' : ''}{c.lastMessage?.text || 'Start chatting'}
                    </p>
                    {c.unreadCount > 0 && (
                      <span style={{ background: '#7c3aed', color: 'white', borderRadius: '50%', minWidth: 18, height: 18, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginLeft: 6, padding: '0 4px', flexShrink: 0 }}>
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: mobile && !showChat ? 'none' : 'flex', flexDirection: 'column', background: dark.bg }}>
        {selected ? (
          <>
            {/* Header */}
            <div style={{ padding: '12px 16px', background: dark.card, borderBottom: `1px solid ${dark.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              {mobile && (
                <button onClick={() => { setShowChat(false); dispatch(setSelected(null)); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, marginRight: 4, color: dark.text }}>←</button>
              )}
              <div style={{ position: 'relative' }}>
                <img src={selected.avatar || `https://ui-avatars.com/api/?name=${selected.username}&background=7c3aed&color=fff`}
                  alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 11, height: 11, background: isOnline(selected._id) ? '#22c55e' : '#9ca3af', border: '2px solid white', borderRadius: '50%' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, margin: 0, fontSize: 15 }}>{selected.username}</p>
                <p style={{ margin: 0, fontSize: 12, color: isOnline(selected._id) ? '#22c55e' : '#6b7280', fontWeight: 500 }}>
                  {typing ? '✍️ typing...' : isOnline(selected._id) ? '● Online' : `last seen ${timeAgo(selected.lastSeen)}`}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                  <div style={{ width: 24, height: 24, border: '2px solid #7c3aed', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
                </div>
              )}
              {msgs.map((msg, i) => {
                const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                const showAvatar = !isMe && (i === 0 || msgs[i - 1]?.sender?._id !== msg.sender?._id);
                return (
                  <div key={msg._id || i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 6 }} className="fade-in">
                    {!isMe && (
                      <div style={{ width: 28, flexShrink: 0 }}>
                        {showAvatar && (
                          <img src={selected.avatar || `https://ui-avatars.com/api/?name=${selected.username}&background=7c3aed&color=fff`}
                            alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                        )}
                      </div>
                    )}
                    <div style={{ maxWidth: '68%' }}>
                      <div style={{ padding: '9px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: isMe ? 'linear-gradient(135deg,#7c3aed,#ec4899)' : dark.card, color: isMe ? 'white' : dark.text, fontSize: 14, lineHeight: 1.5, boxShadow: isMe ? '0 2px 8px rgba(124,58,237,.3)' : 'none', border: isMe ? 'none' : `1px solid ${dark.border}`, wordBreak: 'break-word' }}>
                        {msg.text}
                      </div>
                      <p style={{ fontSize: 10, color: '#9ca3af', margin: '3px 4px 0', textAlign: isMe ? 'right' : 'left' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMe && ' ✓✓'}
                      </p>
                    </div>
                  </div>
                );
              })}
              {typing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="fade-in">
                  <img src={selected.avatar || `https://ui-avatars.com/api/?name=${selected.username}&background=7c3aed&color=fff`}
                    alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                  <div style={{ background: dark.card, border: `1px solid ${dark.border}`, borderRadius: '18px 18px 18px 4px', padding: '10px 14px', display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map(j => <div key={j} style={{ width: 7, height: 7, borderRadius: '50%', background: '#9ca3af', animation: `pulse 1.2s ease ${j * .2}s infinite` }} />)}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '12px 16px', background: dark.card, borderTop: `1px solid ${dark.border}` }}>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <textarea ref={inputRef} value={text} onChange={handleTyping}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={`Message ${selected.username}...`}
                  rows={1}
                  style={{ flex: 1, padding: '10px 14px', border: `1.5px solid ${text ? '#7c3aed' : dark.border}`, borderRadius: 20, fontSize: 14, background: dark.bg, color: dark.text, outline: 'none', resize: 'none', maxHeight: 100, overflowY: 'auto', fontFamily: 'inherit', lineHeight: 1.5, transition: 'border .2s' }}
                  onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'; }} />
                <button type="submit" disabled={!text.trim()}
                  style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: text.trim() ? 'linear-gradient(135deg,#7c3aed,#ec4899)' : '#e5e7eb', color: 'white', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, transition: 'all .2s', boxShadow: text.trim() ? '0 2px 8px rgba(124,58,237,.4)' : 'none' }}>
                  ➤
                </button>
              </form>
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 5, marginLeft: 4 }}>Enter to send · Shift+Enter for new line</p>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 20 }}>💬</div>
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Your Messages</h3>
            <p style={{ fontSize: 14, textAlign: 'center', maxWidth: 260, lineHeight: 1.6 }}>Send private messages to your friends</p>
          </div>
        )}
      </div>
    </div>
  );
}