import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  increment,
  serverTimestamp,
  Timestamp,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Article, Comment, Poll, Submission } from '../types';

const ARTICLES_COLLECTION = 'articles';
const POLLS_COLLECTION = 'polls';
const SUBMISSIONS_COLLECTION = 'submissions';

export const newsService = {
  async getFeaturedArticles(count = 5) {
    const path = ARTICLES_COLLECTION;
    try {
      const q = query(
        collection(db, path),
        where('status', '==', 'published'),
        where('featured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(count)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Article));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  async getLatestArticles(count = 10, category?: string, lastVisible?: QueryDocumentSnapshot<DocumentData>) {
    const path = ARTICLES_COLLECTION;
    try {
      const constraints: QueryConstraint[] = [
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(count)
      ];
      
      if (category) {
        constraints.unshift(where('category', '==', category));
      }
      
      if (lastVisible) {
        constraints.push(startAfter(lastVisible));
      }

      const q = query(collection(db, path), ...constraints);
      
      const snapshot = await getDocs(q);
      const articles = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Article));
      return {
        articles,
        lastVisible: snapshot.docs[snapshot.docs.length - 1] || null
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return { articles: [], lastVisible: null };
    }
  },

  async getArticlesByRegion(region: string, count = 10) {
    const path = ARTICLES_COLLECTION;
    try {
      const q = query(
        collection(db, path),
        where('status', '==', 'published'),
        where('region', '==', region),
        orderBy('createdAt', 'desc'),
        limit(count)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Article));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  async getArticlesByConstituency(inkhundla: string, count = 10) {
    const path = ARTICLES_COLLECTION;
    try {
      const q = query(
        collection(db, path),
        where('status', '==', 'published'),
        where('inkhundla', '==', inkhundla),
        orderBy('createdAt', 'desc'),
        limit(count)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Article));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  async getArticleById(id: string) {
    const path = `${ARTICLES_COLLECTION}/${id}`;
    try {
      const docRef = doc(db, ARTICLES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Article;
        
        // Increment views and earnings (e.g., 0.10 SZL per view)
        const earningsIncrement = 0.10;
        await updateDoc(docRef, { 
          views: increment(1),
          earningsGenerated: increment(earningsIncrement)
        }).catch(err => handleFirestoreError(err, OperationType.UPDATE, path));

        // Update author's total earnings and views
        if (data.authorId) {
          const authorPath = `users/${data.authorId}`;
          const authorRef = doc(db, 'users', data.authorId);
          await updateDoc(authorRef, {
            earnings: increment(earningsIncrement),
            totalViews: increment(1)
          }).catch(err => console.error("Could not update author stats:", err));
        }

        return { id: docSnap.id, ...data, views: (data.views || 0) + 1 } as Article;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async getComments(articleId: string) {
    const path = `${ARTICLES_COLLECTION}/${articleId}/comments`;
    try {
      const q = query(
        collection(db, ARTICLES_COLLECTION, articleId, 'comments'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Comment));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  async addComment(articleId: string, comment: Omit<Comment, 'id' | 'createdAt'>) {
    const path = `${ARTICLES_COLLECTION}/${articleId}/comments`;
    try {
      const colRef = collection(db, ARTICLES_COLLECTION, articleId, 'comments');
      const docRef = await addDoc(colRef, {
        ...comment,
        createdAt: serverTimestamp()
      });
      // Update comment count on article
      await updateDoc(doc(db, ARTICLES_COLLECTION, articleId), {
        commentsCount: increment(1)
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return '';
    }
  },

  async getActivePolls() {
    const path = POLLS_COLLECTION;
    try {
      const q = query(
        collection(db, path),
        where('active', '==', true),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Poll));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  async voteInPoll(pollId: string, optionIndex: number) {
    const path = `${POLLS_COLLECTION}/${pollId}`;
    try {
      const pollRef = doc(db, POLLS_COLLECTION, pollId);
      const pollSnap = await getDoc(pollRef);
      if (pollSnap.exists()) {
        const pollData = pollSnap.data() as Poll;
        const newOptions = [...pollData.options];
        newOptions[optionIndex].votes += 1;
        await updateDoc(pollRef, { options: newOptions });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async submitStory(submission: Omit<Submission, 'id' | 'createdAt' | 'status'>) {
    const path = SUBMISSIONS_COLLECTION;
    try {
      const docRef = await addDoc(collection(db, path), {
        ...submission,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return '';
    }
  }
};
