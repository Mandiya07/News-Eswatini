export type UserRole = 'admin' | 'editor' | 'reporter' | 'reader';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  photoURL?: string;
  createdAt: any;
  constituency?: string;
  // Contributor fields
  earnings?: number;
  totalViews?: number;
  articleCount?: number;
  reputationPoints?: number;
  paymentDetails?: {
    method: 'mobile_money' | 'bank_transfer';
    accountNumber: string;
    accountName: string;
  };
}

export type ArticleStatus = 'draft' | 'published' | 'scheduled';

export interface Article {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  category: string;
  region?: string;
  inkhundla?: string;
  tags?: string[];
  status: ArticleStatus;
  createdAt: any;
  updatedAt: any;
  views?: number;
  likes?: number;
  commentsCount?: number;
  featured?: boolean;
  breaking?: boolean;
  imageURL?: string;
  videoURL?: string;
  // Contributor fields
  earningsGenerated?: number;
  payoutStatus?: 'pending' | 'paid';
}

export interface Comment {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  createdAt: any;
}

export interface Poll {
  id: string;
  question: string;
  options: { text: string; votes: number }[];
  active: boolean;
  createdAt: any;
}

export interface Submission {
  id: string;
  title: string;
  content: string;
  submitterName: string;
  submitterEmail: string;
  constituency?: string;
  status: 'pending' | 'reviewed' | 'rejected';
  createdAt: any;
}

export interface Payout {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: 'mobile_money' | 'bank_transfer';
  accountNumber: string;
  processedAt: any;
  processedBy: string;
}
