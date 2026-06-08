export type UserRole = 'admin' | 'editor' | 'reporter' | 'reader' | 'ministry_admin';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  photoURL?: string;
  createdAt: any;
  constituency?: string;
  region?: string; // Add region for journalists
  bio?: string;
  videoBio?: string;
  socials?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    website?: string;
  };
  // Contributor fields
  earnings?: number;
  totalViews?: number;
  articleCount?: number;
  reputationPoints?: number;
  isOfficial?: boolean;
  officialTitle?: string;
  department?: string;
  paymentDetails?: {
    method: 'mobile_money' | 'bank_transfer';
    accountNumber: string;
    accountName: string;
  };
  isVerifiedPolitician?: boolean;
  isSubscriber?: boolean;
  subscriptionTier?: 'basic' | 'standard' | 'premium' | 'patron';
  subscriptionExpiry?: string;
  subscriptionActiveSince?: string;
}

export type ArticleStatus = 'draft' | 'published' | 'scheduled';

export interface Article {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
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
  isGovernmentNotice?: boolean;
  // Advertisement fields
  // Contributor fields
  earningsGenerated?: number;
  payoutStatus?: 'pending' | 'paid';
  contentLabel?: 'Independent' | 'Sponsored' | 'Partnership';
}

export interface Ad {
  id: string;
  advertiserName: string;
  imageURL: string;
  linkURL: string;
  targetRegion?: string;
  targetConstituency?: string;
  startDate: any;
  endDate: any;
  isActive: boolean;
  priority: 'high' | 'normal' | 'low';
}

export interface Comment {
  id: string;
  articleId: string;
  parentId?: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  imageURL?: string;
  isSubscriber?: boolean;
  subscriptionTier?: string;
  createdAt: any;
  likes?: number;
  likedBy?: string[];
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
  submitterId: string;
  title: string;
  content: string;
  submitterName: string;
  submitterEmail: string;
  constituency?: string;
  imageURL?: string;
  videoURL?: string;
  status: 'pending' | 'reviewed' | 'rejected';
  createdAt: any;
  bountyId?: string;
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

export type EventType = 'funeral' | 'meeting' | 'announcement' | 'celebration' | 'other';

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  eventType: EventType;
  date: any; // Date of the event
  location: string;
  region?: string;
  constituency?: string;
  imageURL?: string;
  submitterId: string;
  submitterName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'basic' | 'supporter' | 'patron';
  status: 'active' | 'canceled' | 'past_due';
  startDate: any;
  nextPaymentDate: any;
}

export interface BusinessLocation {
  address: string;
  region: string;
  constituency: string;
  contactNumber?: string;
}

export interface ServiceBusiness {
  id: string;
  advertiserId?: string; // Links to Advertiser/User
  name: string;
  category: string;
  description: string;
  imageURL: string;
  contactPhone: string;
  contactEmail: string;
  locations: BusinessLocation[];
  isFeatured: boolean;
  featuredUntil?: any;
}

export type BountyStatus = 'open' | 'completed' | 'expired';

export interface Bounty {
  id: string;
  title: string;
  description: string;
  constituency: string;
  reward: number;
  status: BountyStatus;
  createdAt: any;
  authorId: string;
  authorName: string;
  requirements?: string[];
  submissionsCount: number;
}
