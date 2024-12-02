import { useState, useEffect } from 'react';
import { Heart, Trash2, MoreHorizontal, Ban, Image, Smile } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import AdminBadge from './AdminBadge';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface Post {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  timestamp: string;
  likes: string[];
  banned?: boolean;
  image?: string;
  reactions?: { [key: string]: Reaction };
}

interface PostListProps {
  filterUserId?: string;
  onProfileClick?: (userId: string) => void;
}

export default function PostList({ filterUserId, onProfileClick }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [menuPost, setMenuPost] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

  const loadPosts = () => {
    const storedPosts = JSON.parse(localStorage.getItem('posts') || '[]');
    const filteredPosts = filterUserId 
      ? storedPosts.filter((post: Post) => post.authorId === filterUserId)
      : storedPosts;
    setPosts(filteredPosts);
  };

  useEffect(() => {
    loadPosts();
    window.addEventListener('postsUpdated', loadPosts);
    return () => window.removeEventListener('postsUpdated', loadPosts);
  }, [filterUserId]);

  const handleLike = (postId: string, currentUserId: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const likes = Array.isArray(post.likes) ? post.likes : [];
        const userLikeIndex = likes.indexOf(currentUserId);
        
        if (userLikeIndex === -1) {
          likes.push(currentUserId);
        } else {
          likes.splice(userLikeIndex, 1);
        }
        
        return { ...post, likes };
      }
      return post;
    });

    localStorage.setItem('posts', JSON.stringify(updatedPosts));
    setPosts(updatedPosts);
  };

  const handleReaction = (postId: string, emoji: { id: string, native: string }, currentUserId: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const reactions = post.reactions || {};
        const reaction = reactions[emoji.id] || { emoji: emoji.native, count: 0, users: [] };
        const userIndex = reaction.users.indexOf(currentUserId);

        if (userIndex === -1) {
          reaction.count++;
          reaction.users.push(currentUserId);
        } else {
          reaction.count--;
          reaction.users.splice(userIndex, 1);
        }

        const updatedReactions = {
          ...reactions,
          [emoji.id]: reaction.count > 0 ? reaction : undefined
        };

        // Remove undefined reactions
        Object.keys(updatedReactions).forEach(key => {
          if (!updatedReactions[key]) {
            delete updatedReactions[key];
          }
        });

        return { ...post, reactions: updatedReactions };
      }
      return post;
    });

    localStorage.setItem('posts', JSON.stringify(updatedPosts));
    setPosts(updatedPosts);
    setShowEmojiPicker(null);
  };

  const handleDeletePost = (postId: string) => {
    const updatedPosts = posts.filter(post => post.id !== postId);
    localStorage.setItem('posts', JSON.stringify(updatedPosts));
    setPosts(updatedPosts);
    toast.success('Post deleted');
    setMenuPost(null);
  };

  const handleBanPost = (postId: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return { ...post, banned: !post.banned };
      }
      return post;
    });
    localStorage.setItem('posts', JSON.stringify(updatedPosts));
    setPosts(updatedPosts);
    toast.success(updatedPosts.find(p => p.id === postId)?.banned 
      ? 'Post has been banned' 
      : 'Post has been unbanned'
    );
    setMenuPost(null);
  };

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  if (posts.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No posts yet. Be the first to post something!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {posts.map(post => {
          const isAdminPost = post.authorId.toLowerCase() === 'rune';
          const reactions = post.reactions || {};

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className={`relative border border-gray-800 rounded-xl p-5 bg-gray-900/50 backdrop-blur-sm hover:border-gray-700 transition-all hover:shadow-lg ${
                post.banned ? 'opacity-50' : ''
              } ${isAdminPost ? 'admin-post' : ''}`}
            >
              {isAdminPost && (
                <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-clip-padding animate-rainbow" />
              )}
              <div className="flex space-x-4">
                <button
                  onClick={() => onProfileClick?.(post.authorId)}
                  className="flex-shrink-0 transition-transform hover:scale-105"
                >
                  {post.authorAvatar ? (
                    <img src={post.authorAvatar} alt="profile" className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/20" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/30 to-purple-600/30 flex items-center justify-center ring-2 ring-purple-500/20">
                      <span className="text-lg font-bold">{post.authorName[0]}</span>
                    </div>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onProfileClick?.(post.authorId)}
                        className="font-bold hover:text-purple-400 transition-colors truncate flex items-center space-x-2"
                      >
                        <span>{post.authorName}</span>
                        {post.authorId.toLowerCase() === 'rune' && <AdminBadge />}
                      </button>
                      <span className="text-gray-500 text-sm">
                        {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    {(post.authorId === currentUser.id || currentUser.isCEO) && (
                      <div className="relative">
                        <button
                          onClick={() => setMenuPost(menuPost === post.id ? null : post.id)}
                          className="p-1 hover:bg-gray-800 rounded-full transition-colors"
                        >
                          <MoreHorizontal size={20} />
                        </button>
                        {menuPost === post.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-10"
                          >
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center space-x-2"
                            >
                              <Trash2 size={16} />
                              <span>Delete Post</span>
                            </button>
                            {currentUser.isCEO && post.authorId !== currentUser.id && (
                              <button
                                onClick={() => handleBanPost(post.id)}
                                className="w-full px-4 py-2 text-left text-yellow-400 hover:bg-gray-700 flex items-center space-x-2"
                              >
                                <Ban size={16} />
                                <span>{post.banned ? 'Unban Post' : 'Ban Post'}</span>
                              </button>
                            )}
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                  {post.banned ? (
                    <div className="mt-3 text-yellow-500 italic">
                      This post has been banned by an administrator.
                    </div>
                  ) : (
                    <>
                      <p className="mt-3 text-gray-200 leading-relaxed whitespace-pre-wrap break-words">
                        {post.content}
                      </p>
                      {post.image && (
                        <div className="mt-3">
                          <img src={post.image} alt="Post attachment" className="max-h-96 rounded-lg object-contain" />
                        </div>
                      )}
                    </>
                  )}
                  <div className="mt-4 flex items-center flex-wrap gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => !post.banned && handleLike(post.id, currentUser.id)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-colors ${
                        post.banned
                          ? 'opacity-50 cursor-not-allowed'
                          : Array.isArray(post.likes) && post.likes.includes(currentUser.id)
                          ? 'text-red-500 bg-red-500/10'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
                      }`}
                    >
                      <Heart
                        size={18}
                        className={Array.isArray(post.likes) && post.likes.includes(currentUser.id) ? 'fill-current' : ''}
                      />
                      <span className="text-sm font-medium">{Array.isArray(post.likes) ? post.likes.length : 0}</span>
                    </motion.button>

                    {Object.values(reactions).map((reaction) => (
                      <motion.button
                        key={reaction.emoji}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleReaction(post.id, { id: reaction.emoji, native: reaction.emoji }, currentUser.id)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-colors ${
                          reaction.users.includes(currentUser.id)
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-gray-800/50 hover:bg-gray-700/50'
                        }`}
                      >
                        <span>{reaction.emoji}</span>
                        <span className="text-sm">{reaction.count}</span>
                      </motion.button>
                    ))}

                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowEmojiPicker(showEmojiPicker === post.id ? null : post.id)}
                        className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                      >
                        <Smile size={18} />
                      </motion.button>
                      
                      {showEmojiPicker === post.id && (
                        <div className="absolute bottom-full right-0 mb-2 z-50">
                          <Picker
                            data={data}
                            onEmojiSelect={(emoji: any) => handleReaction(post.id, emoji, currentUser.id)}
                            theme="dark"
                            set="native"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
