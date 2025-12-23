# OCOP FRONTEND

Frontend ứng dụng thương mại điện tử cho sản phẩm OCOP Đồng Nai, xây dựng trên nền tảng React Native và Expo.

## TÍNH NĂNG CHÍNH

- Trang chủ hiển thị sản phẩm nổi bật và danh mục phân loại.
- Giỏ hàng cập nhật thời gian thực, quản lý đơn hàng và trạng thái vận chuyển.
- Xác thực người dùng (Đăng nhập, Đăng ký, Quên mật khẩu).
- Quản lý địa chỉ giao hàng và hồ sơ cá nhân.
- Danh sách yêu thích, tìm kiếm và lọc sản phẩm chi tiết.
- Hiển thị huy hiệu chứng nhận OCOP cho sản phẩm.

## CÔNG NGHỆ SỬ DỤNG

- **Framework**: React Native kết hợp với Expo.
- **Điều hướng**: Expo Router.
- **Giao diện**: NativeWind (Tailwind CSS cho React Native).
- **Quản lý trạng thái**: React Context và useReducer.
- **API Client**: Tùy chỉnh với cơ chế tự động thử lại (retry) và xử lý lỗi.
- **Ngôn ngữ**: TypeScript đảm bảo an toàn dữ liệu.

## HƯỚNG DẪN CÀI ĐẶT

- **Bước 1**: Cài đặt các thư viện phụ thuộc bằng lệnh `npm install`.
- **Bước 2**: Cấu hình kết nối Backend. Đảm bảo backend chạy tại cổng 5000. Nếu khác, cập nhật đường dẫn trong file `constants/api.ts`.
- **Bước 3**: Khởi chạy ứng dụng bằng lệnh `npm start`.
- **Bước 4**: Chọn môi trường chạy mong muốn (Android, iOS hoặc Web) từ menu của Expo.

## TÍCH HỢP API

- **Cấu hình**: Mọi endpoint và đường dẫn API được định nghĩa tập trung tại `constants/api.ts`.
- **Dịch vụ**: Thư mục `services/` chứa các module gọi API riêng biệt (Auth, Product, Cart, Order...).
- **Cách dùng**: Import service cần thiết và gọi hàm bất đồng bộ (ví dụ: `authService.login`).

## CẤU TRÚC DỰ ÁN

- **app/**: Chứa mã nguồn màn hình và cấu hình điều hướng (Tab, Stack).
- **components/**: Các thành phần giao diện nhỏ có thể tái sử dụng.
- **constants/**: Chứa các biến hằng số, cấu hình API, màu sắc giao diện.
- **contexts/**: Quản lý trạng thái toàn cục (ví dụ: trạng thái đăng nhập).
- **services/**: Chứa logic xử lý việc gọi API.
- **hooks/**: Chứa các custom hooks của React.
