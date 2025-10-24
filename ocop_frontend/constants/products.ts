export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductOrigin {
  province: string;
  district: string;
  address: string;
}

export interface ProductProducer {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface ProductRating {
  average: number;
  count: number;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  discount: number;
  sku?: string;
  images: ProductImage[];
  category: {
    _id: string;
    name: string;
  };
  brand?: string;
  weight?: number;
  unit: string;
  stock: number;
  minStock: number;
  maxStock?: number;
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  isFeatured: boolean;
  isOCOP: boolean;
  ocopLevel: string;
  origin: ProductOrigin;
  producer: ProductProducer;
  specifications?: Array<{
    name: string;
    value: string;
  }>;
  tags?: string[];
  rating: ProductRating;
  totalSold: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    slug?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  count: number;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  data: Product[];
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  parentCategory?: string;
  subcategories?: string[];
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: {
    _id: string;
    name: string;
    images: ProductImage[];
    price: number;
    discount: number;
    stock: number;
    status: string;
  };
  quantity: number;
  price: number;
  discount: number;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: any[];
  shippingAddress: any;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  user: string;
  name: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  postalCode?: string;
  isDefault: boolean;
  addressType: string;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  isActive: boolean;
  avatar?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock categories - will be replaced by API calls
export const categories = [
  { id: '1', name: 'Trái cây', icon: '🍊' },
  { id: '2', name: 'Hạt & Đậu', icon: '🥜' },
  { id: '3', name: 'Kẹo & Bánh', icon: '🍬' },
  { id: '4', name: 'Thực phẩm khác', icon: '🍽️' },
];

// Empty arrays - will be populated by API calls
export const products: Product[] = [];
export const featuredProducts: Product[] = [];

// Helper functions - will be replaced by API calls
export const getProductsByCategory = (categoryName: string): Product[] => {
  return products.filter((product: any) => product.category?.name === categoryName);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find((product: any) => product._id === id);
};

// API helper functions for categories
export const getCategoryById = (id: string) => {
  return categories.find(cat => cat.id === id);
};

export const getCategoryByName = (name: string) => {
  return categories.find(cat => cat.name === name);
};
