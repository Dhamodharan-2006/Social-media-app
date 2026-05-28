import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeed } from '../features/posts/postSlice';
import PostCard     from '../components/post/PostCard';
import CreatePost   from '../components/post/CreatePost';
import StoryBar     from '../components/story/StoryBar';
import Suggested    from '../components/shared/Suggested';

export default function Home() {
  const dispatch = useDispatch();
  const { feed, loading, hasMore } = useSelector(s => s.posts);
  const [page, setPage] = useState(1);

  useEffect(() => { dispatch(fetchFeed(1)); }, [dispatch]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const next = page + 1;
      setPage(next);
      dispatch(fetchFeed(next));
    }
  }, [loading, hasMore, page, dispatch]);

  useEffect(() => {
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 400) {
        loadMore();
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [loadMore]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, maxWidth: 980, margin: '0 auto', padding: '20px 16px' }}>
      {/* Feed */}
      <div>
        <StoryBar />
        <CreatePost />
        {loading && page === 1 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 400, marginBottom: 20, borderRadius: 16 }} />
          ))
        ) : feed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
            <div style={{ fontSize: 50, marginBottom: 12 }}>🌐</div>
            <h3 style={{ marginBottom: 8 }}>Your feed is empty</h3>
            <p>Follow some users to see their posts!</p>
          </div>
        ) : (
          feed.map(post => <PostCard key={post._id} post={post} />)
        )}
        {loading && page > 1 && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ width: 24, height: 24, border: '2px solid #7c3aed', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto' }} />
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="sidebar" style={{ position: 'sticky', top: 80, height: 'fit-content' }}>
        <Suggested />
      </div>
    </div>
  );
}