'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProduct } from '@/services/productService';
import { getCategories } from '@/services/categoryService';
import { CreateProductInput } from '@/types/product';
import ProductForm from '@/components/products/ProductForm';

export default function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      alert('Tạo sản phẩm thành công!');
      router.push('/dashboard/products');
    },
    onError: (error: any) => {
      alert(
        error.response?.data?.message ||
          'Có lỗi xảy ra khi tạo sản phẩm!'
      );
    },
  });

  const handleSubmit = (data: CreateProductInput) => {
    createMutation.mutate(data);
  };

  if (isLoadingCategories) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Quay lại
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
        <p className="mt-2 text-gray-600">
          Điền thông tin chi tiết về sản phẩm OCOP
        </p>
      </div>

      {/* Form */}
      <ProductForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        categories={categoriesData?.data || []}
      />
    </div>
  );
}
