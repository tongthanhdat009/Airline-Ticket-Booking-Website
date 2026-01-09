# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Flight Status Calculation

### Cách tính trạng thái chuyến bay

Hệ thống tự động cập nhật trạng thái chuyến bay dựa trên thời gian hiện tại và thông tin chuyến bay. Các logic tính toán như sau:

#### 1. Trạng thái "Đã bay"
- **Điều kiện**: Thời gian đến hiệu quả < thời gian hiện tại và trạng thái hiện tại là "Đang mở bán".
- **Thời gian đến hiệu quả**: 
  - Nếu có thời gian đến thực tế (`thoiGianDenThucTe`), sử dụng giá trị này.
  - Nếu không, sử dụng thời gian đến dự kiến (tính từ `ngayDen` và `gioDen`).
- **Scheduler**: Chạy mỗi 60 giây để kiểm tra và cập nhật tự động.

#### 2. Trạng thái "Delay"
- **Điều kiện**: Thời gian đến thực tế > thời gian đến dự kiến + 30 phút, và trạng thái hiện tại chưa phải "Delay" hoặc "Đã bay".
- **Threshold**: 30 phút (có thể điều chỉnh trong code).
- **Cập nhật**: Có thể tự động bởi scheduler hoặc thủ công qua giao diện admin (nhập lý do delay và thời gian thực tế).

#### 3. Quy trình cập nhật thủ công
- Admin có thể thay đổi trạng thái chuyến bay qua dropdown trong bảng quản lý.
- Khi chọn "Delay", hệ thống sẽ mở modal để nhập:
  - Lý do delay (bắt buộc).
  - Thời gian đi thực tế (tùy chọn).
  - Thời gian đến thực tế (bắt buộc).
- Sau khi cập nhật, trạng thái chuyến bay sẽ được set thành "Delay" cùng với thông tin chi tiết.

#### 4. Lưu ý
- Thời gian được tính dựa trên múi giờ hệ thống.
- Để đảm bảo chính xác, khuyến nghị cập nhật thời gian thực tế ngay khi có thông tin từ sân bay hoặc hệ thống giám sát.
