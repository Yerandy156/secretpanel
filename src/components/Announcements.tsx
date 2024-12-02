import { useState, useEffect } from 'react';
import { Send, Megaphone, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

interface Announcement {
  id: string;
  content: string;
  timestamp: string;
  image?: string;
}

export default function Announcements() {
  const [content, setContent] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const { user } = useAuth();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  });

  useEffect(() => {
    const stored = localStorage.getItem('announcements');
    if (stored) {
      setAnnouncements(JSON.parse(stored));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !image) || !user?.isCEO) return;

    const newAnnouncement = {
      id: crypto.randomUUID(),
      content: content.trim(),
      timestamp: new Date().toISOString(),
      image: image || undefined,
    };

    const updatedAnnouncements = [newAnnouncement, ...announcements];
    setAnnouncements(updatedAnnouncements);
    localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
    setContent('');
    setImage(null);
    toast.success('Announcement posted');
  };

  const handleDelete = (id: string) => {
    if (!user?.isCEO) return;
    const updatedAnnouncements = announcements.filter(a => a.id !== id);
    setAnnouncements(updatedAnnouncements);
    localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
    toast.success('Announcement deleted');
  };

  return (
    <div className="p-4 space-y-6">
      {user?.isCEO && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Post an announcement..."
              className="w-full bg-transparent border border-purple-500/30 rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500"
              rows={4}
            />
            {image && (
              <div className="relative mt-2 inline-block">
                <img src={image} alt="Upload preview" className="max-h-32 rounded-lg" />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="flex justify-between mt-2">
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <button
                  type="button"
                  className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 px-4 py-2 rounded-full flex items-center space-x-2"
                >
                  <ImageIcon size={18} />
                  <span>Add Image</span>
                </button>
              </div>
              <button
                type="submit"
                disabled={!content.trim() && !image}
                className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-full flex items-center space-x-2"
              >
                <Send size={18} />
                <span>Post Announcement</span>
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {announcements.map((announcement) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/30 transition-colors relative admin-post"
            >
              <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-clip-padding animate-rainbow" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-purple-400">
                    <Megaphone size={20} />
                    <span className="text-sm">
                      {formatDistanceToNow(new Date(announcement.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  {user?.isCEO && (
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <p className="text-white whitespace-pre-wrap">{announcement.content}</p>
                {announcement.image && (
                  <div className="mt-3">
                    <img src={announcement.image} alt="Announcement attachment" className="max-h-96 rounded-lg object-contain" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {announcements.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No announcements yet.
          </div>
        )}
      </div>
    </div>
  );
}
