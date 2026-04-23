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
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Article, Comment, Poll, Submission, Reply, ServiceBusiness, Ad } from '../types';
import { DEMO_ARTICLES, DEMO_POLLS } from '../constants/demoData';

const ARTICLES_COLLECTION = 'articles';
const POLLS_COLLECTION = 'polls';
const SUBMISSIONS_COLLECTION = 'submissions';
const ADS_COLLECTION = 'ads';
const BUSINESSES_COLLECTION = 'businesses';

// Helper to convert demo articles to proper local Article objects
const getLocalDemoArticles = (): Article[] => {
  return DEMO_ARTICLES.map((a, i) => ({
    id: `demo-${i}`,
    ...a,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as any));
};

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
      const articles = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Article));
      
      if (articles.length === 0) {
        return getLocalDemoArticles().filter(a => a.featured).slice(0, count);
      }
      return articles;
    } catch (error) {
      console.warn("Firestore error for featured articles, using demo fallback.");
      return getLocalDemoArticles().filter(a => a.featured).slice(0, count);
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
      
      if (articles.length === 0 && !lastVisible) {
        let demo = getLocalDemoArticles();
        if (category) demo = demo.filter(a => a.category === category);
        return { articles: demo.slice(0, count), lastVisible: null };
      }

      return {
        articles,
        lastVisible: snapshot.docs[snapshot.docs.length - 1] || null
      };
    } catch (error) {
      console.warn("Firestore error for latest articles, using demo fallback.");
      if (!lastVisible) {
        let demo = getLocalDemoArticles();
        if (category) demo = demo.filter(a => a.category === category);
        return { articles: demo.slice(0, count), lastVisible: null };
      }
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

  async getBusinesses(queryConstraints: QueryConstraint[] = []) {
    const path = BUSINESSES_COLLECTION;
    try {
      const q = query(collection(db, path), ...queryConstraints, orderBy('isFeatured', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as ServiceBusiness));
    } catch (error) {
      console.error("Error fetching businesses:", error);
      return [];
    }
  },

  async getBusinessById(id: string) {
    const docRef = doc(db, BUSINESSES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as any) } as ServiceBusiness;
    }
    return null;
  },

  async registerBusiness(businessData: Omit<ServiceBusiness, 'id'>) {
    return await addDoc(collection(db, BUSINESSES_COLLECTION), {
      ...businessData
    });
  },

  async getArticleById(id: string) {
    if (id.startsWith('demo-')) {
      const demoArticles = getLocalDemoArticles();
      return demoArticles.find(a => a.id === id) || null;
    }
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
        }).catch(err => {
          console.warn("Could not update views/earnings (offline?):", err.message);
        });

        // Update author's total earnings and views
        if (data.authorId) {
          const authorRef = doc(db, 'users', data.authorId);
          await updateDoc(authorRef, {
            earnings: increment(earningsIncrement),
            totalViews: increment(1)
          }).catch(err => console.warn("Could not update author stats:", err.message));
        }

        return { id: docSnap.id, ...data, views: (data.views || 0) + 1 } as Article;
      }
      return null;
    } catch (error) {
      console.warn("Firestore error for article by ID, checking demo fallback.");
      const demoArticles = getLocalDemoArticles();
      return demoArticles.find(a => a.id === id) || null;
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

  async addComment(articleId: string, comment: Omit<Comment, 'id' | 'createdAt' | 'likes' | 'likedBy' | 'replies'>) {
    const path = `${ARTICLES_COLLECTION}/${articleId}/comments`;
    try {
      const colRef = collection(db, ARTICLES_COLLECTION, articleId, 'comments');
      const docRef = await addDoc(colRef, {
        ...comment,
        likes: 0,
        likedBy: [],
        replies: [],
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

  async likeComment(articleId: string, commentId: string, userId: string, isLiking: boolean) {
    const path = `${ARTICLES_COLLECTION}/${articleId}/comments/${commentId}`;
    try {
      const docRef = doc(db, ARTICLES_COLLECTION, articleId, 'comments', commentId);
      await updateDoc(docRef, {
        likes: increment(isLiking ? 1 : -1),
        likedBy: isLiking ? arrayUnion(userId) : arrayRemove(userId)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async addReply(articleId: string, commentId: string, reply: Omit<Reply, 'id' | 'createdAt'>) {
    const path = `${ARTICLES_COLLECTION}/${articleId}/comments/${commentId}`;
    try {
      const docRef = doc(db, ARTICLES_COLLECTION, articleId, 'comments', commentId);
      const replyWithId = {
        ...reply,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString() // Using ISO string for array items as serverTimestamp() doesn't work in arrays
      };
      await updateDoc(docRef, {
        replies: arrayUnion(replyWithId)
      });
      return replyWithId.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
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
      const polls = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Poll));
      
      if (polls.length === 0) {
        return DEMO_POLLS.map((p, i) => ({ id: `demo-poll-${i}`, ...p } as any));
      }
      return polls;
    } catch (error) {
      console.warn("Firestore error for active polls, using demo fallback.");
      return DEMO_POLLS.map((p, i) => ({ id: `demo-poll-${i}`, ...p } as any));
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
  },

  async getPendingSubmissionCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, SUBMISSIONS_COLLECTION),
        where('submitterId', '==', userId),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.warn("Could not fetch pending submission count, assuming 0:", error);
      return 0;
    }
  },

  async submitEvent(event: Omit<import('../types').CommunityEvent, 'id' | 'createdAt' | 'status'>) {
    const path = 'events';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...event,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return '';
    }
  },

  async getAuthorById(userId: string) {
    const path = `users/${userId}`;
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { uid: docSnap.id, ...(docSnap.data() as any) } as any;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async getArticlesByAuthor(authorId: string, count = 10) {
    const path = ARTICLES_COLLECTION;
    try {
      const q = query(
        collection(db, path),
        where('status', '==', 'published'),
        where('authorId', '==', authorId),
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

  async getAdsForLocation(region?: string, constituency?: string) {
    const path = 'ads';
    try {
      let q = query(
        collection(db, path),
        where('isActive', '==', true),
        orderBy('priority', 'desc'),
        limit(5)
      );

      const snapshot = await getDocs(q);
      let ads = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Ad));

      if (region) {
        ads = ads.filter(ad => !ad.targetRegion || ad.targetRegion === region);
      }
      if (constituency) {
        ads = ads.filter(ad => !ad.targetConstituency || ad.targetConstituency === constituency);
      }

      return ads;
    } catch (error) {
      console.warn("Could not fetch ads:", error);
      return [];
    }
  },

  async getGovernmentNotices(count = 5) {
    const path = ARTICLES_COLLECTION;
    try {
      const q = query(
        collection(db, path),
        where('status', '==', 'published'),
        where('isGovernmentNotice', '==', true),
        orderBy('createdAt', 'desc'),
        limit(count)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Article));
    } catch (error) {
      console.warn("Falling back to empty government notices");
      return [];
    }
  }
};
