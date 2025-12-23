export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Array<any>;
  orderStats: {
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  productStats: {
    active: number;
    inactive: number;
    outOfStock: number;
    featured: number;
    ocop: number;
  };
}
