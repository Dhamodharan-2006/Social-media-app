import { useEffect, useState } from 'react';
import API from '../../app/axios';
import { toast } from 'react-toastify';

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);

  const load = async (p = 1, q = '') => {
    setLoading(true);
    const r = await API.get(`/admin/users?page=${p}&search=${q}`);
    setUsers(r.data.users); setTotal(r.data.total); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleBan = async (id, banned, username) => {
    await API.put(`/admin/users/${id}/ban`);
    toast.success(banned ? `✅ ${username} unbanned` : `🚫 ${username} banned`);
    load(page, search);
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Delete user "${username}"? All posts will be deleted.`)) return;
    await API.delete(`/admin/users/${id}`);
    toast.success('User deleted');
    load(page, search);
  };

  const onSearch = v => {
    setSearch(v); setPage(1);
    clearTimeout(window._st);
    window._st = setTimeout(() => load(1, v), 500);
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontWeight: 900, margin: '0 0 4px', fontSize: 22 }}>👥 User Management</h2>
          <p style={{ color: '#6b7280', margin: 0, fontSize: 14 }}>{total.toLocaleString()} total users</p>
        </div>
        <button onClick={() => load(page, search)}
          className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 13 }}>🔄 Refresh</button>
      </div>

      <input className="input" placeholder="🔍 Search by username, email..."
        value={search} onChange={e => onSearch(e.target.value)}
        style={{ marginBottom: 16 }} />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 68, borderRadius: 12 }} />)}
        </div>
      ) : (
        <div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  {['User', 'Email', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: .5, borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=7c3aed&color=fff`}
                          alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        <div>
                          <p style={{ fontWeight: 600, margin: 0 }}>
                            {u.username}
                            {u.isVerified && <span style={{ marginLeft: 4 }}>✅</span>}
                            {u.isAdmin && <span style={{ marginLeft: 4, fontSize: 10, background: '#7c3aed', color: 'white', padding: '1px 5px', borderRadius: 4 }}>ADMIN</span>}
                          </p>
                          <p style={{ color: '#9ca3af', margin: 0, fontSize: 11 }}>{u.fullName}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#6b7280', fontSize: 12 }}>{u.email}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: u.isBanned ? '#fee2e2' : u.isVerified ? '#dcfce7' : '#fef9c3', color: u.isBanned ? '#991b1b' : u.isVerified ? '#166534' : '#854d0e' }}>
                        {u.isBanned ? '🚫 Banned' : u.isVerified ? '● Active' : '⏳ Unverified'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {!u.isAdmin && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => handleBan(u._id, u.isBanned, u.username)}
                            style={{ padding: '5px 10px', fontSize: 11, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer', background: u.isBanned ? '#dcfce7' : '#fef3c7', color: u.isBanned ? '#166534' : '#92400e' }}>
                            {u.isBanned ? '✅ Unban' : '🚫 Ban'}
                          </button>
                          <button onClick={() => handleDelete(u._id, u.username)}
                            style={{ padding: '5px 10px', fontSize: 11, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer', background: '#fee2e2', color: '#991b1b' }}>
                            🗑️
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <button onClick={() => { setPage(p => p - 1); load(page - 1, search); }} disabled={page === 1}
                className="btn btn-outline" style={{ padding: '7px 14px' }}>← Prev</button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: '#6b7280' }}>Page {page} of {Math.ceil(total / 20)}</span>
              <button onClick={() => { setPage(p => p + 1); load(page + 1, search); }} disabled={page >= Math.ceil(total / 20)}
                className="btn btn-outline" style={{ padding: '7px 14px' }}>Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}