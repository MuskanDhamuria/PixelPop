import { MessageCircle, Users, Heart, ArrowLeft, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../utils/api';
import { auth } from '../utils/auth';

interface CommunityProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface CommunityPost {
  id: string;
  user: string;
  avatar: string;
  timestamp: string;
  content: string;
  likes: number;
  replies: number;
  likedBy?: string[];
  comments?: CommunityComment[];
}

interface CommunityComment {
  id: string;
  user: string;
  avatar: string;
  timestamp: string;
  content: string;
}

export default function Community({ onNavigate, onLogout }: CommunityProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [postContent, setPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postError, setPostError] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadPosts = () => {
    setLoadingPosts(true);
    apiGet<CommunityPost[]>('/community-posts')
      .then(setPosts)
      .catch((error) => {
        console.error('Failed to load community posts:', error);
        setPostError(error instanceof Error ? error.message : 'Unable to load community posts.');
        setPosts([]);
      })
      .finally(() => setLoadingPosts(false));
  };

  useEffect(() => {
    auth.getSession().then((session) => {
      setCurrentUserId(session?.user?.id ?? null);
    });
    loadPosts();
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return 'Just now';
    const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const handleCreatePost = async () => {
    const content = postContent.trim();
    if (!content || posting) return;

    setPosting(true);
    setPostError('');
    try {
      const accessToken = await auth.getAccessToken();
      if (!accessToken) {
        setPostError('Please log in to post.');
        return;
      }

      const newPost = await apiPost<CommunityPost>('/community-posts', { content }, accessToken);
      setPosts((currentPosts) => [newPost, ...currentPosts]);
      setPostContent('');
    } catch (error) {
      console.error('Failed to create community post:', error);
      setPostError(error instanceof Error ? error.message : 'Unable to save your post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const updatePost = (updatedPost: CommunityPost) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  const handleLikePost = async (postId: string) => {
    setPostError('');
    try {
      const accessToken = await auth.getAccessToken();
      if (!accessToken) {
        setPostError('Please log in to like posts.');
        return;
      }

      const updatedPost = await apiPost<CommunityPost>(`/community-posts/${postId}/like`, {}, accessToken);
      updatePost(updatedPost);
    } catch (error) {
      console.error('Failed to like community post:', error);
      setPostError(error instanceof Error ? error.message : 'Unable to like post.');
    }
  };

  const handleCreateComment = async (postId: string) => {
    const content = commentDrafts[postId]?.trim();
    if (!content || commentingPostId) return;

    setCommentingPostId(postId);
    setPostError('');
    try {
      const accessToken = await auth.getAccessToken();
      if (!accessToken) {
        setPostError('Please log in to comment.');
        return;
      }

      const updatedPost = await apiPost<CommunityPost>(
        `/community-posts/${postId}/comments`,
        { content },
        accessToken
      );
      updatePost(updatedPost);
      setCommentDrafts((drafts) => ({ ...drafts, [postId]: '' }));
    } catch (error) {
      console.error('Failed to comment on community post:', error);
      setPostError(error instanceof Error ? error.message : 'Unable to add comment.');
    } finally {
      setCommentingPostId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <header className="fixed top-0 left-0 right-0 z-50 px-10 py-8 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back</span>
          </button>
          <div className="text-[17px] font-semibold tracking-tight">
            PixelPop<sup>TM</sup>
          </div>
        </div>

        <nav className="liquid-glass rounded-full px-2 py-2 flex items-center gap-1">
          {[
            { name: 'GAMES', page: 'dashboard' },
            { name: 'LEADERBOARD', page: 'leaderboard' },
            { name: 'COMMUNITY', page: 'community' },
            { name: 'CHATBOT', page: 'chatbot' },
            { name: 'FRIENDS', page: 'friends' },
            { name: 'PROFILE', page: 'profile' },
          ].map((link) => (
            <button
              key={link.name}
              onClick={() => onNavigate(link.page)}
              className={`text-[11px] font-medium tracking-[0.12em] px-4 py-1.5 rounded-full transition-colors duration-200 ${
                link.page === 'community' ? 'text-white bg-white/10' : 'text-white/90 hover:text-white'
              }`}
            >
              {link.name}
            </button>
          ))}
        </nav>

        <button
          onClick={onLogout}
          className="liquid-glass rounded-full px-5 py-2.5 text-[11px] font-medium tracking-[0.12em] text-white/90 hover:text-white transition-colors duration-200 flex items-center gap-2"
        >
          <LogOut size={14} />
          LOGOUT
        </button>
      </header>

      <main className="pt-32 px-10 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Users size={40} />
            </div>
            <div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                Community
              </h1>
            </div>
          </div>
          <p className="text-white/60 text-xl mb-12">
            Connect with fellow gamers and share your achievements
          </p>

          <div className="liquid-glass rounded-3xl p-8 mb-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <textarea
              value={postContent}
              onChange={(event) => setPostContent(event.target.value)}
              placeholder="Share something with the community..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 resize-none transition-all duration-300"
              rows={4}
            />
            <div className="flex justify-end mt-4">
              {postError && (
                <div className="mr-auto self-center text-sm text-red-300">
                  {postError}
                </div>
              )}
              <button
                onClick={handleCreatePost}
                disabled={!postContent.trim() || posting}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold rounded-xl px-8 py-3 hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {loadingPosts && (
              <div className="liquid-glass rounded-3xl p-10 text-center text-white/60">
                Loading posts...
              </div>
            )}
            {posts.map((post, index) => {
              const likedByCurrentUser = currentUserId ? post.likedBy?.includes(currentUserId) ?? false : false;
              return (
              <div
                key={post.id}
                className="liquid-glass rounded-3xl p-8 hover:bg-white/[0.03] hover:shadow-xl transition-all duration-300"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="flex gap-5">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg ${
                      index % 4 === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                      index % 4 === 1 ? 'bg-gradient-to-br from-cyan-500 to-blue-500' :
                      index % 4 === 2 ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                      'bg-gradient-to-br from-green-500 to-emerald-600'
                    }`}
                  >
                    {post.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-bold text-lg">{post.user}</span>
                      <span className="text-white/30 text-sm">&middot;</span>
                      <span className="text-white/50 text-sm">{formatTimestamp(post.timestamp)}</span>
                    </div>
                    <p className="text-white/90 text-base leading-relaxed mb-5">{post.content}</p>
                    <div className="flex gap-8">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-2 transition-all duration-200 group ${
                          likedByCurrentUser
                            ? 'text-red-400 hover:text-white/60'
                            : 'text-white/60 hover:text-red-400'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                          likedByCurrentUser ? 'bg-red-500/20' : 'bg-white/5 group-hover:bg-red-500/20'
                        }`}>
                          <Heart size={18} className={likedByCurrentUser ? 'fill-red-400' : ''} />
                        </div>
                        <span className="text-sm font-medium">{post.likes}</span>
                      </button>
                      <div className="flex items-center gap-2 text-white/60">
                        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                          <MessageCircle size={18} />
                        </div>
                        <span className="text-sm font-medium">{post.comments?.length ?? post.replies ?? 0}</span>
                      </div>
                    </div>

                    {(post.comments?.length ?? 0) > 0 && (
                      <div className="mt-6 space-y-3">
                        {post.comments?.map((comment) => (
                          <div key={comment.id} className="rounded-2xl bg-white/5 border border-white/10 p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-xs font-bold">
                                {comment.avatar}
                              </div>
                              <span className="font-semibold text-sm">{comment.user}</span>
                              <span className="text-white/30 text-xs">&middot;</span>
                              <span className="text-white/50 text-xs">{formatTimestamp(comment.timestamp)}</span>
                            </div>
                            <p className="text-sm text-white/80 leading-relaxed">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-5 flex gap-3">
                      <input
                        type="text"
                        value={commentDrafts[post.id] ?? ''}
                        onChange={(event) =>
                          setCommentDrafts((drafts) => ({ ...drafts, [post.id]: event.target.value }))
                        }
                        placeholder="Write a comment..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
                      />
                      <button
                        onClick={() => handleCreateComment(post.id)}
                        disabled={!commentDrafts[post.id]?.trim() || commentingPostId === post.id}
                        className="bg-white/10 text-white text-sm font-semibold rounded-2xl px-5 py-3 hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {commentingPostId === post.id ? 'Adding...' : 'Comment'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
            {!loadingPosts && posts.length === 0 && (
              <div className="liquid-glass rounded-3xl p-10 text-center text-white/60">
                No community posts yet.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
