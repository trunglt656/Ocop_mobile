#  CHỨC NĂNG QUẢN LÝ SẢN PHẨM - ADMIN PANEL

##  Đã hoàn thành

Chức năng quản lý sản phẩm đã được triển khai đầy đủ với CRUD và các tính năng nâng cao.

---

##  Cấu trúc Files

### Services
```
services/
├── productService.ts      # API calls cho products
└── categoryService.ts     # API calls cho categories
```

### Components
```
components/products/
├── ProductTable.tsx       # Bảng hiển thị danh sách sản phẩm
├── ProductForm.tsx        # Form thêm/sửa sản phẩm
├── ProductFilters.tsx     # Bộ lọc sản phẩm
└── Pagination.tsx         # Phân trang
```

### Pages
```
app/dashboard/products/
├── page.tsx              # Danh sách sản phẩm
├── new/
│   └── page.tsx         # Thêm sản phẩm mới
└── [id]/
    └── edit/
        └── page.tsx     # Chỉnh sửa sản phẩm
```

---

##  Tính năng chi tiết

### 1. Danh sách sản phẩm (`/dashboard/products`)

**Hiển thị:**
-  Bảng sản phẩm với thông tin: Hình ảnh, Tên, SKU, Giá, Tồn kho, Trạng thái, OCOP
-  Stats cards: Tổng sản phẩm, Đang bán, Hết hàng, OCOP
-  Pagination với điều hướng trang
-  Loading state và Empty state

**Tìm kiếm & Lọc:**
-  Tìm theo tên sản phẩm hoặc SKU
-  Lọc theo danh mục
-  Lọc theo trạng thái (Đang bán, Hết hàng, Ngừng bán)
-  Lọc theo chứng nhận OCOP

**Actions:**
-  Thêm sản phẩm mới
-  Sửa sản phẩm
-  Xóa sản phẩm (có confirm)

### 2. Thêm sản phẩm mới (`/dashboard/products/new`)

**Form đầy đủ với validation:**

**Thông tin cơ bản:**
-  Tên sản phẩm 
-  Mô tả ngắn
-  Mô tả chi tiết 
-  Danh mục 
-  Trạng thái 

**Giá & Kho hàng:**
-  Giá bán 
-  Giá gốc
-  Giảm giá 0-100%
-  Số lượng tồn kho
-  Tồn kho tối thiểu (

**Thông tin OCOP:**
-  Checkbox: Sản phẩm có chứng nhận OCOP
-  Cấp OCOP: 3 sao / 4 sao / 5 sao

**Xuất xứ:**
-  Tỉnh/Thành phố (required)
-  Quận/Huyện (required)
-  Địa chỉ cụ thể (required)

**Nhà sản xuất:**
-  Tên nhà sản xuất (required)
-  Số điện thoại (optional)
-  Email (optional)
-  Địa chỉ (optional)

**Actions:**
-  Button "Lưu sản phẩm"
-  Button "Hủy" (quay lại)
-  Loading state khi submit

### 3. Chỉnh sửa sản phẩm (`/dashboard/products/:id/edit`)

**Tính năng:**
-  Load dữ liệu sản phẩm hiện tại
-  Form giống như thêm mới, đã điền sẵn data
-  Validation đầy đủ
-  Cập nhật và quay về danh sách
-  Loading state

---

##  API Endpoints đã sử dụng

```typescript
// Danh sách sản phẩm với filters
GET /api/products?page=1&limit=10&search=tra&category=...&status=...

// Chi tiết sản phẩm
GET /api/products/:id

// Tạo sản phẩm mới
POST /api/products
Body: CreateProductInput

// Cập nhật sản phẩm
PUT /api/products/:id
Body: Partial<CreateProductInput>

// Xóa sản phẩm
DELETE /api/products/:id

// Danh sách categories
GET /api/categories
```

---

##  Cách sử dụng

### 1. Xem danh sách sản phẩm

```
1. Truy cập: http://localhost:7000/dashboard/products
2. Xem stats tổng quan
3. Sử dụng filters để tìm kiếm
4. Click vào "Sửa" để chỉnh sửa
5. Click vào "Xóa" để xóa (có confirm)
```

### 2. Thêm sản phẩm mới

```
1. Click button "Thêm sản phẩm" ở góc trên bên phải
2. Điền đầy đủ thông tin trong form
3. Click "Lưu sản phẩm"
4. Tự động redirect về danh sách
```

### 3. Chỉnh sửa sản phẩm

```
1. Từ danh sách, click "Sửa" ở sản phẩm muốn chỉnh sửa
2. Form sẽ được điền sẵn dữ liệu hiện tại
3. Chỉnh sửa các trường cần thiết
4. Click "Lưu sản phẩm"
5. Tự động redirect về danh sách
```

### 4. Xóa sản phẩm

```
1. Từ danh sách, click "Xóa"
2. Confirm trong popup
3. Sản phẩm sẽ bị xóa và danh sách tự động reload
```

---

