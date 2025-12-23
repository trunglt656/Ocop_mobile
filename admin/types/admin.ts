export interface News {
  _id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  thumbnail?: string;
  images?: string[];
  category: 'announcement' | 'news' | 'event' | 'promotion' | 'guide';
  status: 'draft' | 'published' | 'archived';
  isPinned: boolean;
  viewCount: number;
  author: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  publishedAt?: string;
  tags?: string[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface NewsFormData {
  title: string;
  content: string;
  summary?: string;
  thumbnail?: string;
  images?: string[];
  category: News['category'];
  status: News['status'];
  isPinned?: boolean;
  tags?: string[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

export interface NewsStats {
  statusStats: Array<{
    _id: string;
    count: number;
  }>;
  categoryStats: Array<{
    _id: string;
    count: number;
  }>;
  totalViews: number;
  topNews: Array<{
    _id: string;
    title: string;
    viewCount: number;
    publishedAt: string;
  }>;
}

export interface Shop {
  _id: string;
  name: string;
  slug?: string;
  owner: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  admins?: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  staff?: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  contact?: {
    phone?: string;
    email?: string;
  };
  address?: string;
  description?: string;
  logo?: string;
  banner?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'active';
  verificationDocuments?: Array<{
    _id: string;
    type: string;
    url: string;
    filename?: string;
    verified: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
    notes?: string;
  }>;
  commission: number;
  rating?: {
    average: number;
    count: number;
  };
  totalProducts: number;
  totalSales: number;
  isActive: boolean;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserType {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator' | 'shop_owner' | 'shop_admin' | 'shop_staff';
  shop?: {
    _id: string;
    name: string;
    slug?: string;
  };
  shopRole?: 'owner' | 'admin' | 'staff' | null;
  permissions?: string[];
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  recentRegistrations: number;
  roleBreakdown: Array<{
    _id: string;
    count: number;
    activeCount: number;
  }>;
}
