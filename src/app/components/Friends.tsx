import { ArrowLeft, LogOut, UserPlus, Users, Activity, MessageCircle, Crown } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useEffect, useState } from 'react';
import { Friend, ActivityFeedItem } from '../types/user';
import { apiGet, apiPost } from '../utils/api';
import { auth } from '../utils/auth';

interface FriendsProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface FriendMessage {
  id: string;
  senderId: string;
  senderUsername: string;
  content: string;
  timestamp: string;
}

interface FriendWithUnread extends Friend {
  hasUnreadMessages?: boolean;
}

export default function Friends({ onNavigate, onLogout }: FriendsProps) {
  const { userProfile } = useUser();
  const [activeTab, setActiveTab] = useState<'friends' | 'activity'>('friends');
  const [friends, setFriends] = useState<FriendWithUnread[]>([]);
  const [activity, setActivity] = useState<ActivityFeedItem[]>([]);
  const [friendUsername, setFriendUsername] = useState('');
  const [friendsError, setFriendsError] = useState('');
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [addingFriend, setAddingFriend] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<FriendMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const loadFriends = async () => {
    setLoadingFriends(true);
    setFriendsError('');

    const accessToken = await auth.getAccessToken();
    if (!accessToken) {
      setFriendsError('Please log in to view friends.');
      setLoadingFriends(false);
      return;
    }

    const [loadedFriends, loadedActivity] = await Promise.all([
      apiGet<FriendWithUnread[]>('/friends', accessToken),
      apiGet<ActivityFeedItem[]>('/activity-feed', accessToken),
    ]);

    setFriends(loadedFriends);
    setActivity(loadedActivity.map((item) => ({ ...item, timestamp: new Date(item.timestamp) })));
    setLoadingFriends(false);
  };

  useEffect(() => {
    loadFriends().catch((error) => {
      console.error('Failed to load friends:', error);
      setFriendsError(error instanceof Error ? error.message : 'Failed to load friends.');
      setFriends([]);
      setActivity([]);
      setLoadingFriends(false);
    });
  }, []);

  const handleAddFriend = async () => {
    const username = friendUsername.trim();
    if (!username || addingFriend) return;

    setAddingFriend(true);
    setFriendsError('');

    try {
      const accessToken = await auth.getAccessToken();
      if (!accessToken) {
        setFriendsError('Please log in to add friends.');
        return;
      }

      const result = await apiPost<{ friend: Friend; activity: ActivityFeedItem }>(
        '/friends',
        { username },
        accessToken
      );

      setFriends((currentFriends) => [...currentFriends, result.friend]);
      setActivity((currentActivity) => [
        { ...result.activity, timestamp: new Date(result.activity.timestamp) },
        ...currentActivity,
      ]);
      setFriendUsername('');
    } catch (error) {
      console.error('Failed to add friend:', error);
      setFriendsError(error instanceof Error ? error.message : 'Failed to add friend.');
    } finally {
      setAddingFriend(false);
    }
  };

  const openChat = async (friend: FriendWithUnread) => {
    setSelectedFriend(friend);
    setMessages([]);
    setFriendsError('');
    setLoadingMessages(true);

    try {
      const accessToken = await auth.getAccessToken();
      if (!accessToken) {
        setFriendsError('Please log in to chat.');
        return;
      }

      const loadedMessages = await apiGet<FriendMessage[]>(`/friends/${friend.id}/messages`, accessToken);
      setMessages(loadedMessages);
      setFriends((currentFriends) =>
        currentFriends.map((currentFriend) =>
          currentFriend.id === friend.id
            ? { ...currentFriend, hasUnreadMessages: false }
            : currentFriend
        )
      );
    } catch (error) {
      console.error('Failed to load messages:', error);
      setFriendsError(error instanceof Error ? error.message : 'Failed to load messages.');
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    const content = messageDraft.trim();
    if (!content || !selectedFriend || sendingMessage) return;

    setSendingMessage(true);
    setFriendsError('');

    try {
      const accessToken = await auth.getAccessToken();
      if (!accessToken) {
        setFriendsError('Please log in to chat.');
        return;
      }

      const message = await apiPost<FriendMessage>(
        `/friends/${selectedFriend.id}/messages`,
        { content },
        accessToken
      );
      setMessages((currentMessages) => [...currentMessages, message]);
      setMessageDraft('');
    } catch (error) {
      console.error('Failed to send message:', error);
      setFriendsError(error instanceof Error ? error.message : 'Failed to send message.');
    } finally {
      setSendingMessage(false);
    }
  };

  if (!userProfile) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  }

  const getStatusColor = (status: Friend['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'playing':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
    }
  };

  const getActivityLabel = (type: ActivityFeedItem['type']) => {
    switch (type) {
      case 'achievement':
        return 'ACH';
      case 'high_score':
        return 'TOP';
      case 'new_game':
        return 'NEW';
      case 'friend_added':
        return 'ADD';
    }
  };

  const formatTimestamp = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                link.page === 'friends' ? 'text-white bg-white/10' : 'text-white/90 hover:text-white'
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
          <div className="flex items-center gap-6 mb-12">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Users size={40} />
            </div>
            <div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                Friends
              </h1>
              <p className="text-white/60 text-xl mt-2">{friends.length} friends</p>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === 'friends'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                  : 'liquid-glass text-white/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={18} />
                Friends List
              </div>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === 'activity'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                  : 'liquid-glass text-white/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity size={18} />
                Activity Feed
              </div>
            </button>
          </div>

          {activeTab === 'friends' && (
            <div>
              <div className="liquid-glass rounded-3xl p-6 mb-8 shadow-xl">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={friendUsername}
                    onChange={(event) => setFriendUsername(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleAddFriend();
                      }
                    }}
                    placeholder="Enter a username to add..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                  />
                  <button
                    onClick={handleAddFriend}
                    disabled={!friendUsername.trim() || addingFriend}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-2xl font-semibold hover:from-purple-400 hover:to-pink-400 transition-all shadow-lg shadow-purple-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus size={20} />
                    {addingFriend ? 'Adding...' : 'Add Friend'}
                  </button>
                </div>
                {friendsError && <p className="text-red-300 text-sm mt-4">{friendsError}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loadingFriends && (
                  <div className="liquid-glass rounded-3xl p-10 text-center text-white/60 md:col-span-2">
                    Loading friends...
                  </div>
                )}
                {friends.map((friend, index) => (
                  <div
                    key={friend.id}
                    className="liquid-glass rounded-3xl p-6 hover:bg-white/[0.03] transition-all duration-300 shadow-xl"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center font-bold text-xl shadow-lg">
                          {friend.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getStatusColor(friend.status)} rounded-full border-2 border-black`} />
                        {friend.hasUnreadMessages && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 border-2 border-black shadow-lg shadow-pink-500/50" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold">{friend.username}</h3>
                          {friend.hasUnreadMessages && (
                            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-lg shadow-pink-500/60" />
                          )}
                          {friend.level >= 20 && <Crown className="text-yellow-400" size={18} />}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/60">
                          <span>Level {friend.level}</span>
                          {friend.currentGame && (
                            <>
                              <span>&middot;</span>
                              <span className="text-green-400">Playing {friend.currentGame}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => openChat(friend)}
                        className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10"
                      >
                        <MessageCircle size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                {!loadingFriends && friends.length === 0 && (
                  <div className="liquid-glass rounded-3xl p-10 text-center text-white/60 md:col-span-2">
                    No friends yet.
                  </div>
                )}
              </div>

              {selectedFriend && (
                <div className="liquid-glass rounded-3xl p-6 mt-8 shadow-xl">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-2xl font-bold">Chat with {selectedFriend.username}</h2>
                      <p className="text-white/50 text-sm">Messages are saved to your shared conversation.</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFriend(null);
                        setMessages([]);
                        setMessageDraft('');
                      }}
                      className="text-white/60 hover:text-white text-sm"
                    >
                      Close
                    </button>
                  </div>

                  <div className="h-80 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                    {loadingMessages && (
                      <div className="text-white/50 text-center py-10">Loading messages...</div>
                    )}
                    {!loadingMessages && messages.length === 0 && (
                      <div className="text-white/50 text-center py-10">No messages yet.</div>
                    )}
                    {messages.map((message) => {
                      const fromMe = message.senderId === userProfile.id;
                      return (
                        <div key={message.id} className={`flex ${fromMe ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                              fromMe
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'bg-white/10 text-white'
                            }`}
                          >
                            <div className="text-sm leading-relaxed">{message.content}</div>
                            <div className={`text-[11px] mt-1 ${fromMe ? 'text-white/70' : 'text-white/40'}`}>
                              {formatMessageTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3 mt-4">
                    <input
                      type="text"
                      value={messageDraft}
                      onChange={(event) => setMessageDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          sendMessage();
                        }
                      }}
                      placeholder={`Message ${selectedFriend.username}...`}
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!messageDraft.trim() || sendingMessage}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl font-semibold hover:from-purple-400 hover:to-pink-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingMessage ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              {loadingFriends && (
                <div className="liquid-glass rounded-3xl p-10 text-center text-white/60">
                  Loading activity...
                </div>
              )}
              {activity.map((item, index) => (
                <div
                  key={item.id}
                  className="liquid-glass rounded-3xl p-6 hover:bg-white/[0.03] transition-all duration-300 shadow-xl"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xs font-bold text-white/70">
                      {getActivityLabel(item.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-white/90">
                        <span className="font-bold text-white">{item.username}</span>{' '}
                        {item.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-white/50">{formatTimestamp(item.timestamp)}</span>
                        {item.gameName && (
                          <>
                            <span className="text-white/30">&middot;</span>
                            <span className="text-sm text-cyan-400">{item.gameName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {!loadingFriends && activity.length === 0 && (
                <div className="liquid-glass rounded-3xl p-10 text-center text-white/60">
                  No activity yet.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
