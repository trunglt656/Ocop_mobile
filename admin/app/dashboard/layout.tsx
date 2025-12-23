'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: '👑 Quản trị viên',
    moderator: '🛡️ Kiểm duyệt viên',
    shop_owner: '🏪 Chủ shop',
    shop_admin: '📋 Quản lý shop',
    shop_staff: '👤 Nhân viên shop',
  };
  return labels[role] || role;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">OCOP Admin</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-700">
                  Xin chào, <span className="font-medium">{user.name}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {getRoleLabel(user.role)}
                  {user.shop && typeof user.shop === 'object' && (user.shop as any).name && (
                    <span className="ml-1">• {(user.shop as any).name}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => useAuthStore.getState().logout()}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-1">
            <NavLink href="/dashboard" icon="dashboard">
              Dashboard
            </NavLink>
            
            {/* Sản phẩm - Admin & Shop roles */}
            {['admin', 'moderator', 'shop_owner', 'shop_admin'].includes(user.role) && (
              <NavLink href="/dashboard/products" icon="box">
                Sản phẩm
              </NavLink>
            )}
            
            {/* Đơn hàng - Admin & Shop roles */}
            {['admin', 'shop_owner', 'shop_admin', 'shop_staff'].includes(user.role) && (
              <NavLink href="/dashboard/orders" icon="shopping-bag">
                Đơn hàng
              </NavLink>
            )}
            
            {/* Danh mục - Admin & Moderator */}
            {['admin', 'moderator'].includes(user.role) && (
              <NavLink href="/dashboard/categories" icon="grid">
                Danh mục
              </NavLink>
            )}
            
            {/* Tin tức - Chỉ Admin */}
            {user.role === 'admin' && (
              <NavLink href="/dashboard/news" icon="newspaper">
                Tin tức
              </NavLink>
            )}
            
            {/* Cửa hàng - Admin & Moderator */}
            {['admin', 'moderator'].includes(user.role) && (
              <NavLink href="/dashboard/shops" icon="store">
                Cửa hàng
              </NavLink>
            )}
            
            {/* Người dùng - Chỉ Admin */}
            {user.role === 'admin' && (
              <NavLink href="/dashboard/users" icon="users">
                Người dùng
              </NavLink>
            )}
          </nav>
        </aside>

        {/* Page Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isActive = typeof window !== 'undefined' && window.location.pathname === href;

  return (
    <button
      onClick={() => router.push(href)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
        isActive
          ? 'bg-primary-50 text-primary-700 font-medium'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon name={icon} />
      <span>{children}</span>
    </button>
  );
}

function Icon({ name }: { name: string }) {
  const icons: Record<string, JSX.Element> = {
    dashboard: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    box: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
    'shopping-bag': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
    grid: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    ),
    users: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    store: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
    newspaper: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
        />
      </svg>
    ),
  };

  return icons[name] || null;
}
