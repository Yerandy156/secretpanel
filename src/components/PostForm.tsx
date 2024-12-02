import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Send, Image as ImageIcon, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export default function PostForm() {
  const [content, setContent] = useState('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const newPost = {
      id: crypto.randomUUID(),
      content,
      image,
      authorId: user?.id,
      authorName: user?.displayName,
      authorAvatar: user?.avatar,
      timestamp: new Date().toISOString(),
      likes: [],
    };

    localStorage.setItem('posts', JSON.stringify([newPost, ...posts]));
    setContent('');
    setImage(null);
    window.dispatchEvent(new Event('postsUpdated'));
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex space-x-4">
        {user?.avatar ? (
          <img src={user.avatar} alt="profile" className="w-12 h-12 rounded-full" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-xl">{user?.displayName[0]}</span>
          </div>
        )}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full bg-transparent border border-gray-800 rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-gray-600"
            rows={3}
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
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-full flex items-center space-x-2"
              >
                <ImageIcon size={18} />
                <span>Add Image</span>
              </button>
            </div>
            <button
              type="submit"
              disabled={!content.trim() && !image}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-full flex items-center space-x-2"
            >
              <Send size={18} />
              <span>Post</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
