export interface Product {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  discount: number;
  sku: string;
  images: ProductImage[];
  category: string | Category;
  shop?: string;
  createdBy?: string | {
    _id: string;
    name: string;
    email: string;
  };
  stock: number;
  minStock: number;
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  isActive: boolean;
  isFeatured: boolean;
  isOCOP: boolean;
  ocopLevel: '3 sao' | '4 sao' | '5 sao';
  origin: {
    province: string;
    district: string;
    address: string;
  };
  producer: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  rating: {
    average: number;
    count: number;
  };
  totalSold: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  parent?: string | Category;
  isActive: boolean;
  order: number;
}

export interface CreateProductInput {
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  stock: number;
  minStock?: number;
  status?: string;
  isFeatured?: boolean;
  isOCOP?: boolean;
  ocopLevel?: string;
  images?: ProductImage[];
  origin: {
    province: string;
    district: string;
    address: string;
  };
  producer: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
}
