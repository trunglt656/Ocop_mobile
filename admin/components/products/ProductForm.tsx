'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreateProductInput } from '@/types/product';
import ImageUpload from './ImageUpload';

interface ProductFormProps {
  initialData?: Partial<CreateProductInput>;
  onSubmit: (data: CreateProductInput) => void;
  isLoading?: boolean;
  categories: Array<{ _id: string; name: string }>;
}

export default function ProductForm({
  initialData,
  onSubmit,
  isLoading = false,
  categories,
}: ProductFormProps) {
  const [images, setImages] = useState<Array<{ url: string; alt: string; isPrimary: boolean }>>(
    initialData?.images || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateProductInput>({
    defaultValues: initialData || {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      isOCOP: true,
      ocopLevel: '3 sao',
      status: 'active',
      origin: {
        province: 'Đồng Nai',
        district: '',
        address: '',
      },
      producer: {
        name: '',
        phone: '',
        email: '',
      },
    },
  });

  const isOCOP = watch('isOCOP');

  const handleFormSubmit = (data: CreateProductInput) => {
    // Add images to form data
    const formData = {
      ...data,
      images,
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Hình ảnh sản phẩm */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Hình ảnh sản phẩm <span className="text-red-500">*</span>
        </h2>
        <ImageUpload
          images={images}
          onImagesChange={setImages}
          maxImages={5}
        />
        {images.length === 0 && (
          <p className="mt-2 text-sm text-red-600">
            Vui lòng thêm ít nhất 1 ảnh sản phẩm
          </p>
        )}
      </div>

      {/* Thông tin cơ bản */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Thông tin cơ bản
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tên sản phẩm */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name', { required: 'Vui lòng nhập tên sản phẩm' })}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ví dụ: Bưởi da xanh Đồng Nai"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Mô tả ngắn */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả ngắn
            </label>
            <input
              {...register('shortDescription')}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Mô tả ngắn gọn về sản phẩm"
            />
          </div>

          {/* Mô tả chi tiết */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description', {
                required: 'Vui lòng nhập mô tả sản phẩm',
              })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Mô tả chi tiết về sản phẩm"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Danh mục */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              {...register('category', { required: 'Vui lòng chọn danh mục' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              {...register('status')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="active">Đang bán</option>
              <option value="inactive">Không hoạt động</option>
              <option value="out_of_stock">Hết hàng</option>
              <option value="discontinued">Ngừng bán</option>
            </select>
          </div>
        </div>
      </div>

      {/* Giá & Kho */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Giá & Kho hàng
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Giá bán */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá bán (VNĐ) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('price', {
                required: 'Vui lòng nhập giá',
                min: { value: 0, message: 'Giá phải lớn hơn 0' },
              })}
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="50000"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>

          {/* Giá gốc */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá gốc (VNĐ)
            </label>
            <input
              {...register('originalPrice')}
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="60000"
            />
          </div>

          {/* Giảm giá */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giảm giá (%)
            </label>
            <input
              {...register('discount', {
                min: { value: 0, message: 'Giảm giá tối thiểu là 0' },
                max: { value: 100, message: 'Giảm giá tối đa là 100' },
              })}
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="10"
            />
            {errors.discount && (
              <p className="mt-1 text-sm text-red-600">
                {errors.discount.message}
              </p>
            )}
          </div>

          {/* Số lượng */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lượng <span className="text-red-500">*</span>
            </label>
            <input
              {...register('stock', {
                required: 'Vui lòng nhập số lượng',
                min: { value: 0, message: 'Số lượng tối thiểu là 0' },
              })}
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="100"
            />
            {errors.stock && (
              <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
            )}
          </div>

          {/* Tồn kho tối thiểu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tồn kho tối thiểu
            </label>
            <input
              {...register('minStock')}
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="10"
            />
          </div>
        </div>
      </div>

      {/* Thông tin OCOP */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Thông tin OCOP
        </h2>

        <div className="space-y-4">
          {/* Checkbox OCOP */}
          <div className="flex items-center">
            <input
              {...register('isOCOP')}
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Sản phẩm có chứng nhận OCOP
            </label>
          </div>

          {/* Cấp OCOP */}
          {isOCOP && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cấp OCOP
                </label>
                <select
                  {...register('ocopLevel')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="3 sao">3 sao</option>
                  <option value="4 sao">4 sao</option>
                  <option value="5 sao">5 sao</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Xuất xứ */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Thông tin xuất xứ
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tỉnh/Thành phố <span className="text-red-500">*</span>
            </label>
            <input
              {...register('origin.province', {
                required: 'Vui lòng nhập tỉnh/thành phố',
              })}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Đồng Nai"
            />
            {errors.origin?.province && (
              <p className="mt-1 text-sm text-red-600">
                {errors.origin.province.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quận/Huyện <span className="text-red-500">*</span>
            </label>
            <input
              {...register('origin.district', {
                required: 'Vui lòng nhập quận/huyện',
              })}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Long Khánh"
            />
            {errors.origin?.district && (
              <p className="mt-1 text-sm text-red-600">
                {errors.origin.district.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ cụ thể <span className="text-red-500">*</span>
            </label>
            <input
              {...register('origin.address', {
                required: 'Vui lòng nhập địa chỉ',
              })}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="123 Đường ABC"
            />
            {errors.origin?.address && (
              <p className="mt-1 text-sm text-red-600">
                {errors.origin.address.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Nhà sản xuất */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Thông tin nhà sản xuất
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên nhà sản xuất <span className="text-red-500">*</span>
            </label>
            <input
              {...register('producer.name', {
                required: 'Vui lòng nhập tên nhà sản xuất',
              })}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Hợp tác xã XYZ"
            />
            {errors.producer?.name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.producer.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <input
              {...register('producer.phone')}
              type="tel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0123456789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              {...register('producer.email')}
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="contact@example.com"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ
            </label>
            <input
              {...register('producer.address')}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="123 Đường ABC, Quận/Huyện, Tỉnh/TP"
            />
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isLoading || images.length === 0}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Đang lưu...' : 'Lưu sản phẩm'}
        </button>
      </div>
    </form>
  );
}
