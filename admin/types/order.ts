export interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'cod' | 'bank_transfer' | 'e_wallet' | 'credit_card';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: {
    _id: string;
    name: string;
    images: Array<{url: string}>;
  };
  name: string;
  image: string;
  price: number;
  discount: number;
  quantity: number;
  total: number;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  postalCode?: string;
  instructions?: string;
}

export const OrderStatusMap: Record<Order['orderStatus'], string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipped: 'Đang giao hàng',
  delivered: 'Đã giao hàng',
  cancelled: 'Đã hủy',
  refunded: 'Đã hoàn tiền',
};

export const PaymentMethodMap: Record<Order['paymentMethod'], string> = {
  cod: 'Tiền mặt khi nhận hàng',
  bank_transfer: 'Chuyển khoản ngân hàng',
  e_wallet: 'Ví điện tử',
  credit_card: 'Thẻ tín dụng',
};
