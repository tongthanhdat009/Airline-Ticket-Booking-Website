# Airline Ticket Booking Website

> Hệ thống đặt vé máy bay toàn diện - Full-stack Airline Ticket Booking System

Một ứng dụng web đặt vé máy bay hoàn chỉnh với đầy đủ tính năng cho cả khách hàng và quản trị viên, được xây dựng với Spring Boot (backend) và React (frontend).

---

## Tính năng chi tiết

### 1. Chức năng dành cho KHÁCH HÀNG (23 trang)

#### 1.1. Xác thực & Tài khoản
| STT | Chức năng | Mô tả |
|-----|-----------|-------|
| 1 | **Trang chủ** | Tìm kiếm chuyến bay theo sân bay đi/đến, ngày bay, số hành khách |
| 2 | **Đăng nhập** | Đăng nhập bằng email/password hoặc Google OAuth2 |
| 3 | **Đăng ký** | Đăng ký tài khoản mới với xác thực email |
| 4 | **Quên mật khẩu** | Nhập email để nhận link reset mật khẩu |
| 5 | **Xác thực email** | Xác nhận email đăng ký tài khoản |
| 6 | **Hoàn thiện thông tin** | Cập nhật họ tên, SĐN, CCCD sau khi đăng ký |

#### 1.2. Quy trình đặt vé (6 bước)
| STT | Chức năng | Mô tả |
|-----|-----------|-------|
| 7 | **Chọn chuyến bay đi** | Hiển thị danh sách chuyến bay theo ngày, giờ, giá |
| 8 | **Chọn chuyến bay về** | Chọn chuyến bay khứ hồi (nếu có) |
| 9 | **Chọn dịch vụ** | Chọn hành lý, suất ăn, chỗ ưu tiên... |
| 10 | **Nhập thông tin hành khách** | Nhập thông tin cá nhân cho từng hành khách |
| 11 | **Thanh toán** | Chọn phương thức thanh toán (VNPay) và áp dụng mã giảm giá |
| 12 | **Kết quả thanh toán** | Hiển thị trạng thái thanh toán thành công/thất bại |
| 13 | **VNPay Callback** | Xử lý kết quả trả về từ cổng VNPay |

#### 1.3. Quản lý cá nhân
| STT | Chức năng | Mô tả |
|-----|-----------|-------|
| 14 | **Trang cá nhân** | Xem và chỉnh sửa thông tin cá nhân |
| 15 | **Thông tin cá nhân** | Cập nhật họ tên, email, SĐT, địa chỉ |
| 16 | **Bảo mật** | Đổi mật khẩu, xem lịch sử đăng nhập |
| 17 | **Profile Card** | Hiển thị thông tin profile nhanh |

#### 1.4. Dịch vụ chuyến bay
| STT | Chức năng | Mô tả |
|-----|-----------|-------|
| 18 | **Check-in Online** | Check-in trực tuyến, chọn ghế và lấy vé điện tử (PDF) |
| 19 | **Tra cứu chuyến bay** | Tìm kiếm chuyến bay theo mã đặt chỗ hoặc tuyến bay |
| 20 | **Dịch vụ chuyến bay** | Thêm dịch vụ bổ sung cho chuyến bay đã đặt |
| 21 | **Dịch vụ khác** | Xem các dịch vụ khác của hãng |
| 22 | **Quản lý chuyến bay** | Xem danh sách chuyến bay đã đặt, trạng thái |
| 23 | **Lịch sử giao dịch** | Xem lịch sử thanh toán, hóa đơn |

---

### 2. Chức năng dành cho QUẢN TRỊ VIÊN (30 trang)

#### 2.1. Quản lý hệ thống (6 trang)
| STT | Chức năng | File | Mô tả |
|-----|-----------|------|-------|
| 1 | **Trang chủ Admin** | TrangChuAdmin | Dashboard với thống kê tổng quan |
| 2 | **Quản lý TK Admin** | QuanLyTKAdmin | Thêm/sửa/xóa tài khoản admin |
| 3 | **Quản lý vai trò** | QuanLyVaiTro | Tạo roles với các quyền hạn khác nhau |
| 4 | **Quản lý phân quyền** | QuanLyPhanQuyen | Gán quyền cho từng role và menu |
| 5 | **Lịch sử thao tác** | QuanLyLichSuThaoTac | Audit log - xem tất cả thao tác của admin |
| 6 | **Quản lý Menu** | Menu | Tùy chỉnh menu điều hướng cho admin |

#### 2.2. Quản lý chuyến bay (9 trang)
| STT | Chức năng | File | Mô tả |
|-----|-----------|------|-------|
| 7 | **Quản lý sân bay** | QuanLySanBay | Thêm/sửa/xóa sân bay (mã, tên, địa điểm) |
| 8 | **Quản lý đường bay** | QuanLyTuyenBay | Tạo tuyến bay giữa 2 sân bay, khoảng cách |
| 9 | **Quản lý máy bay** | QuanLyMayBay | Quản lý danh mục máy bay, số hiệu |
| 10 | **Quản lý chuyến bay** | QuanLyChuyenBay | Danh sách, thêm, sửa, hủy chuyến bay |
| 11 | **Thêm chuyến bay** | ThemChuyenBay | Tạo chuyến bay mới với đầy đủ thông tin |
| 12 | **Sửa chuyến bay** | SuaChuyenBay | Chỉnh sửa thông tin chuyến bay |
| 13 | **Chỉnh sửa sơ đồ ghế** | ChinhSuaSoDoGhe | Thiết kế layout ghế cho từng loại máy bay |
| 14 | **Quản lý hạng vé** | QuanLyHangVe | Phổ thông, Thương gia, Hạng nhất |
| 15 | **Quản lý giá bay** | QuanLyGiaBay | Định giá vé theo hạng, thời điểm |

#### 2.3. Quản lý dịch vụ & khuyến mãi (2 trang)
| STT | Chức năng | File | Mô tả |
|-----|-----------|------|-------|
| 16 | **Quản lý dịch vụ** | QuanLyDichVu | Tạo dịch vụ: hành lý, suất ăn, chỗ ưu tiên... |
| 17 | **Quản lý khuyến mãi** | QuanLyKhuyenMai | Tạo mã giảm giá, coupon, điều kiện áp dụng |

#### 2.4. Quản lý đặt vé & khách hàng (4 trang)
| STT | Chức năng | File | Mô tả |
|-----|-----------|------|-------|
| 18 | **Quản lý khách hàng** | QuanLyKhachHang | Xem danh sách, chi tiết, khóa/mở khóa tài khoản |
| 19 | **Quản lý đặt chỗ** | QuanLyDatCho | Xem/ hủy đặt chỗ, thay đổi trạng thái |
| 20 | **Quản lý đơn hàng** | QuanLyDonHang | Quản lý orders, chi tiết đơn hàng |
| 21 | **Quản lý hành khách** | QuanLyHanhKhach | Thông tin hành khách trên các chuyến bay |

#### 2.5. Quản lý tài chính (6 trang)
| STT | Chức năng | File | Mô tả |
|-----|-----------|------|-------|
| 22 | **Quản lý hóa đơn** | QuanLyHoaDon | Xuất/xem/ gửi hóa đơn điện tử |
| 23 | **Quản lý thanh toán** | ThanhToan | Xem danh sách thanh toán |
| 24 | **Quản lý hoàn tiền** | QuanLyHoanTien | Xử lý yêu cầu hoàn tiền |
| 25 | **Lịch sử giao dịch VNPay** | LichSuGiaoDichVNPay | Log chi tiết các giao dịch VNPay |
| 26 | **Đối soát giao dịch** | DoiSoatGiaoDich | Kiểm tra sự khớp lệ giữa hệ thống và VNPay |
| 27 | **Quản lý giá chuyến bay** | GiaChuyenBay | Cấu hình giá theo từng chuyến |

#### 2.6. Báo cáo & Hỗ trợ (4 trang)
| STT | Chức năng | File | Mô tả |
|-----|-----------|------|-------|
| 28 | **Thống kê doanh thu** | ThongKeDoanhThu | Biểu đồ doanh thu theo tháng/quý/năm |
| 29 | **Xuất báo cáo** | XuatBaoCao | Xuất báo cáo PDF/Excel |
| 30 | **Quản lý Chat** | QuanLyChat | Hỗ trợ khách hàng trực tuyến |
| 31 | **Quản lý Banner/Tin tức** | QuanLyBannerTinTuc | Quản lý nội dung banner, tin tức |

---

## 3. Công nghệ sử dụng

### Backend (pom.xml)
| Công nghệ | Phiên bản | Mục đích |
|-----------|----------|---------|
| **Java** | 21 | Ngôn ngữ chính |
| **Spring Boot** | 3.5.5 | Framework chính |
| **Spring Security** | - | Xác thực, phân quyền JWT |
| **Spring Data JPA** | - | ORM, truy cập database |
| **Spring WebSocket** | - | Real-time chat (STOMP) |
| **Spring Mail** | - | Gửi email xác thực |
| **Spring OAuth2** | - | Google Login |
| **Spring AI** | 1.0.0 | Tích hợp AI chatbot (OpenRouter) |
| **Spring Cache** | - | Caching với Caffeine |
| **MySQL** | 8.x | Database chính |
| **Flyway** | - | Database migration (21 versions) |
| **JJWT** | 0.11.5 | JWT token generation/validation |
| **JasperReports** | 6.21.3 | Xuất báo cáo PDF |
| **Apache POI** | 5.2.5 | Xuất báo cáo Excel |
| **Lombok** | - | Giảm code boilerplate |
| **dotenv-java** | 3.0.0 | Load environment variables |

### Frontend (package.json)
| Công nghệ | Phiên bản | Mục đích |
|-----------|----------|---------|
| **React** | 19.1.1 | UI Framework |
| **Vite** | 7.1.2 | Build tool & dev server |
| **Tailwind CSS** | 4.1.13 | CSS Framework |
| **Ant Design** | 5.28.0 | UI Components |
| **React Router** | 7.9.1 | Client-side routing |
| **Axios** | 1.12.2 | HTTP client |
| **Recharts** | 3.2.1 | Biểu đồ thống kê |
| **STOMP.js** | 7.2.1 | WebSocket client cho chat |
| **SockJS** | 1.6.1 | WebSocket fallback |
| **i18next** | 25.6.3 | Đa ngôn ngữ (VN/EN) |
| **react-i18next** | 16.3.5 | React integration cho i18next |
| **Framer Motion** | 12.23.24 | Animation library |
| **AOS** | 2.3.4 | Scroll animations |
| **React Slick** | 0.31.0 | Carousel/Slider |
| **React DatePicker** | 8.9.0 | Chọn ngày tháng |
| **js-cookie** | 3.0.5 | Quản lý cookies |
| **html2canvas** | 1.4.1 | Chụp ảnh element |
| **xlsx** | 0.18.5 | Xử lý file Excel |
| **adm-zip** | 0.5.16 | Xử lý file ZIP |
| **Heroicons** | 2.2.0 | Icon set |
| **React Icons** | 5.5.0 | Icon collections |

---

## 4. Tích hợp bên thứ ba

| Dịch vụ | Mục đích |
|---------|----------|
| **VNPay** | Cổng thanh toán trực tuyến |
| **Google OAuth2** | Đăng nhập bằng tài khoản Google |
| **OpenRouter AI** | AI chatbot hỗ trợ khách hàng (RAG) |
| **Gmail SMTP** | Gửi email xác thực, reset password |
| **WebSocket (STOMP)** | Chat thời gian thực |

---

## 5. Cấu trúc dự án

```
Airline-Ticket-Booking-Website/
├── J2EE-Backend/              # Spring Boot backend
│   ├── src/main/java/com/example/j2ee/
│   │   ├── config/           # Cấu hình ứng dụng (Security, JWT, OAuth2, WebSocket)
│   │   ├── controller/       # REST API controllers (49 controllers)
│   │   ├── service/          # Business logic (52 services)
│   │   ├── repository/       # JPA repositories
│   │   ├── entity/           # JPA entities (40+ entities)
│   │   ├── dto/              # Data transfer objects
│   │   └── security/         # JWT, OAuth2 security
│   ├── src/main/resources/
│   │   ├── db/migration/     # Flyway migrations (V1-V21)
│   │   ├── static/           # Static files
│   │   └── application.properties
│   ├── .env.example          # Environment template
│   └── pom.xml
├── J2EE-Frontend/            # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── KhachHang/    # 23 trang khách hàng
│   │   │   └── QuanLy/       # 30 trang admin
│   │   ├── components/
│   │   │   ├── KhachHang/    # Components khách hàng
│   │   │   ├── QuanLy/       # Components admin
│   │   │   └── Common/       # Components chung
│   │   ├── config/           # API config
│   │   ├── contexts/         # React contexts (Auth, Theme...)
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # Utility functions
│   │   └── locales/          # i18n translations (VN/EN)
│   ├── public/
│   ├── .env.example          # Environment template
│   ├── package.json
│   └── vite.config.js
├── deploy/                   # Deployment scripts
├── .github/                  # CI/CD workflows
├── README.md                 # This file
└── README_ENV_SETUP.md       # Environment setup guide
```

---

## 6. Thống kê dự án

| Hạng mục | Số lượng |
|----------|----------|
| **Trang khách hàng** | 23 |
| **Trang quản trị** | 30 |
| **Backend Services** | 52 |
| **Backend Controllers** | 49 |
| **JPA Entities** | 40+ |
| **Flyway Migrations** | 21 |
| **React Components** | 100+ |
| **Tích hợp bên thứ 3** | 5 |
| **Tổng số thư viện** | ~70 |

---

## 7. Hướng dẫn cài đặt

### Yêu cầu
- **Java 21**
- **Node.js 20+**
- **pnpm 9**
- **MySQL 8.x**

### Cài đặt Backend

1. **Tạo database MySQL:**
   ```sql
   CREATE DATABASE datvemaybay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Cấu hình environment:**
   ```bash
   cd J2EE-Backend
   cp .env.example .env
   ```

3. **Chỉnh sửa file `.env` với các giá trị thực tế:**
   - Database connection (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`)
   - JWT secret (`JWT_SECRET`)
   - API keys (OpenRouter, VNPay, Google OAuth2)
   - Email configuration

   Xem [README_ENV_SETUP.md](README_ENV_SETUP.md) để biết chi tiết.

4. **Chạy backend:**
   ```bash
   ./mvnw spring-boot:run
   ```
   Backend sẽ chạy tại `http://localhost:8080/api`

### Cài đặt Frontend

1. **Cài đặt dependencies:**
   ```bash
   cd J2EE-Frontend
   pnpm install
   ```

2. **Cấu hình environment:**
   ```bash
   cp .env.example .env
   ```

3. **Chạy development server:**
   ```bash
   pnpm run dev
   ```
   Frontend sẽ chạy tại `http://localhost:5173`

---

## 8. Build cho Production

### Backend
```bash
cd J2EE-Backend
./mvnw package -DskipTests
java -jar target/J2EE-Backend-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd J2EE-Frontend
pnpm run build
# Output sẽ nằm ở thư mục dist/
```

---

## 9. Tài liệu tham khảo

- [Environment Setup Guide](README_ENV_SETUP.md) - Hướng dẫn chi tiết cấu hình environment variables
- [Backend API Documentation](http://localhost:8080/swagger-ui.html) - Swagger UI (khi chạy backend)

---

## 10. Đóng góp

Đóng góp dự án này xin vui lòng tạo pull request hoặc issue.

## 11. Giấy phép

This project is for educational purposes.
