export enum Platform {
  GOOGLE = 'Google',
  FACEBOOK = 'Facebook',
  INSTAGRAM = 'Instagram',
  XHS = 'Xiaohongshu',
  TIKTOK = 'TikTok'
}

export enum ReviewTone {
  WARM = 'Warm & Friendly',
  PROFESSIONAL = 'Professional',
  STORY = 'Storytelling'
}

export enum ReviewLength {
  SHORT = 'Short',
  MEDIUM = 'Medium',
  LONG = 'Detailed'
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  googlePlaceId?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: 'Manager' | 'Staff';
  branchId: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'Active' | 'Paused' | 'Ended';
  requiredPlatform: Platform;
  bonusPlatforms: Platform[];
  rewardDescription: string;
  baseRewardValue: string; // e.g., "RM20 OFF"
}

export interface GeneratedDraft {
  id: string;
  platform: Platform;
  text: string;
  tone: ReviewTone;
  length: ReviewLength;
}

export interface VerificationProof {
  platform: Platform;
  type: 'link' | 'image';
  content: string; // URL or Base64/Blob URL
  timestamp: number;
}

export interface Submission {
  id: string;
  customerName?: string;
  branchId: string;
  staffId?: string;
  staffName?: string;
  therapistId?: string;
  therapistName?: string;
  products: string[];
  highlights: string[];
  reviewLanguage?: string; // New field
  rating: number;
  platformsSelected: Platform[];
  draftsGenerated?: GeneratedDraft[];
  proofs: VerificationProof[];
  status: 'Pending' | 'Verified' | 'Rejected' | 'PrivateFeedback' | 'Archived';
  timestamp: number;
  rewardClaimed: boolean;
  luckyDrawTicket?: string;
  bonusEntries: number;
  phone?: string;
  feedback?: string;
}

export interface DashboardStats {
  totalScans: number;
  totalReviews: number;
  conversionRate: number;
  sentimentScore: number;
}