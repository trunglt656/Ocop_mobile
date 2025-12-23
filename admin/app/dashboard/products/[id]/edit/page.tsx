'use client';

import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProduct, updateProduct } from '@/services/productService';
import { getCategories } from '@/services/categoryService';
import { CreateProductInput } from '@/types/product';
import ProductForm from '@/components/products/ProductForm';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const productId = params.id as string;

  // Fetch product
  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId),
    enabled: !!productId,
  });

  // Fetch categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: CreateProductInput) => updateProduct(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      alert('Cập nhật sản phẩm thành công!');
      router.push('/dashboard/products');
    },
    onError: (error: any) => {
      alert(
        error.response?.data?.message ||
          'Có lỗi xảy ra khi cập nhật sản phẩm!'
      );
    },
  });

  const handleSubmit = (data: CreateProductInput) => {
    updateMutation.mutate(data);
  };

  if (isLoadingProduct || isLoadingCategories) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!productData?.data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Không tìm thấy sản phẩm!</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          Quay lại
        </button>
      </div>
    );
  }

  // Transform product data to match form structure
  const initialData: Partial<CreateProductInput> = {
    name: productData.data.name,
    description: productData.data.description,
    shortDescription: productData.data.shortDescription,
    price: productData.data.price,
    originalPrice: productData.data.originalPrice,
    discount: productData.data.discount,
    category: typeof productData.data.category === 'string' 
      ? productData.data.category 
      : productData.data.category._id,
    stock: productData.data.stock,
    minStock: productData.data.minStock,
    status: productData.data.status,
    isFeatured: productData.data.isFeatured,
    isOCOP: productData.data.isOCOP,
    ocopLevel: productData.data.ocopLevel,
    images: productData.data.images,
    origin: productData.data.origin,
    producer: productData.data.producer,
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h1>
        <p className="mt-2 text-gray-600">
          Cập nhật thông tin sản phẩm: {productData.data.name}
        </p>
      </div>

      {/* Form */}
      <ProductForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        categories={categoriesData?.data || []}
      />
    </div>
  );
}
