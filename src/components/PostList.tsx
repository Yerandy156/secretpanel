// Previous code remains the same, just add this at the top with other imports:
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

// Replace the loadPosts function with:
useEffect(() => {
  const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const filteredPosts = filterUserId 
      ? posts.filter((post: Post) => post.authorId === filterUserId)
      : posts;
    
    setPosts(filteredPosts);
  });

  return () => unsubscribe();
}, [filterUserId]);

// Rest of the code remains the same
