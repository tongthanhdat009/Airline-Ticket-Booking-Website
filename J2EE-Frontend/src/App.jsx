import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom"
import Home from "./pages/KhachHang/TrangChu"
import Admin, { AdminSidebarProvider } from "./pages/QuanLy/TrangChuAdmin"
import LoginAdmin from "./pages/QuanLy/DangNhap"
import LoginClient from "./pages/KhachHang/DangNhap"
import ProtectedRoute, { AdminProtectedRoute } from "./components/common/ProtectedRoute"
import { LoginGuard, RegisterGuard, AdminLoginGuard } from "./components/common/AuthGuard"

import ThongKeDoanhThu from './pages/QuanLy/ThongKeDoanhThu';
import QuanLyKhachHang from './pages/QuanLy/QuanLyKhachHang';
import QuanLyTuyenBay from './pages/QuanLy/QuanLyTuyenBay';
import QuanLyChuyenBay from './pages/QuanLy/QuanLyChuyenBay';
import ThemChuyenBay from './pages/QuanLy/ChuyenBay/ThemChuyenBay';
import SuaChuyenBay from './pages/QuanLy/ChuyenBay/SuaChuyenBay';
import QuanLyDichVu from './pages/QuanLy/QuanLyDichVu';
import QuanLySanBay from "./pages/QuanLy/QuanLySanBay"
import QuanLyTKAdmin from "./pages/QuanLy/QuanLyTKAdmin"
import QuanLyGiaBay from "./pages/QuanLy/QuanLyGiaBay"
import QuanLyKhuyenMai from "./pages/QuanLy/QuanLyKhuyenMai"
import QuanLyMayBay from "./pages/QuanLy/QuanLyMayBay"
import QuanLyDonHang from "./pages/QuanLy/QuanLyDonHang"
import QuanLyDatCho from "./pages/QuanLy/QuanLyDatCho"
import QuanLyHoaDon from "./pages/QuanLy/QuanLyHoaDon"
import QuanLyHoanTien from "./pages/QuanLy/QuanLyHoanTien"
import QuanLyLichSuThaoTac from "./pages/QuanLy/QuanLyLichSuThaoTac"
import QuanLyVaiTro from "./pages/QuanLy/QuanLyVaiTro"
import QuanLyPhanQuyen from "./pages/QuanLy/QuanLyPhanQuyen"
import QuanLyHangVe from "./pages/QuanLy/QuanLyHangVe"
import ChinhSuaSoDoGhe from "./pages/QuanLy/ChinhSuaSoDoGhe"
import XuatBaoCao from "./pages/QuanLy/XuatBaoCao"
import DoiSoatGiaoDich from "./pages/QuanLy/DoiSoatGiaoDich"
import QuanLyBannerTinTuc from "./pages/QuanLy/QuanLyBannerTinTuc"
import LichSuGiaoDichVNPay from "./pages/QuanLy/LichSuGiaoDichVNPay"
import HoTroLienHe from "./pages/QuanLy/HoTroLienHe"
import DichVuChuyenBay from "./pages/KhachHang/DichVuChuyenBay"
import DichVuKhac from "./pages/KhachHang/DichVuKhac"
import TraCuuChuyenBay from "./pages/KhachHang/TraCuuChuyenBay"
import OnlineCheckIn from "./pages/KhachHang/OnlineCheckIn"
import SignupClient from "./pages/KhachHang/DangKy"
import QuenMatKhau from "./pages/KhachHang/QuenMatKhau"
import HoTro from "./pages/KhachHang/HoTro"
import OAuth2Callback from "./pages/OAuth2Callback"
import CaNhan from "./pages/KhachHang/CaNhan"
import QuanLyChuyenBayClient from "./pages/KhachHang/QuanLyChuyenBay"
import LichSuGiaoDich from "./pages/KhachHang/LichSuGiaoDich"
import VerifyEmail from "./pages/KhachHang/VerifyEmail"
import PaymentResult from "./pages/KhachHang/PaymentResult"
import HoanThienThongTin from "./pages/KhachHang/HoanThienThongTin"
import RequireCompleteProfile from "./components/common/RequireCompleteProfile"

import ChonChuyenBay from "./pages/KhachHang/DatVe/ChonChuyenBay/ChonChuyenBayDi"
import ChonChuyenBayVe from "./pages/KhachHang/DatVe/ChonChuyenBay/ChonChuyenBayVe"
import NhapThongTin from "./pages/KhachHang/DatVe/NhapThongTin"
import ChonDichVu from "./pages/KhachHang/DatVe/ChonDichVu"
import ThanhToan from "./pages/KhachHang/DatVe/ThanhToan"
import VNPayCallback from "./pages/KhachHang/DatVe/VNPayCallback"
import Navbar from "./components/common/Navbar"

function AppContent() {
  const location = useLocation();
  const showNavbar = !location.pathname.startsWith('/admin');
  return (
    <>
      {showNavbar && <Navbar />}
      <main>
        <Routes>
          {/*public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/login" element={
            <AdminLoginGuard>
              <LoginAdmin/>
            </AdminLoginGuard>
          }/>
          <Route path="/dang-nhap-admin" element={
            <AdminLoginGuard>
              <LoginAdmin/>
            </AdminLoginGuard>
          }/>
          <Route path="/dang-nhap-client" element={
            <LoginGuard>
              <LoginClient/>
            </LoginGuard>
          }/>
          <Route path="/dang-ky-client" element={
            <RegisterGuard>
              <SignupClient/>
            </RegisterGuard>
          }/>
          <Route path="/quen-mat-khau" element={<QuenMatKhau/>}/>
          <Route path="/oauth2/callback" element={<OAuth2Callback/>}/>
          <Route path="/hoan-thien-thong-tin" element={<HoanThienThongTin/>}/>
          <Route path="/tra-cuu-chuyen-bay" element={<TraCuuChuyenBay/>}/>
          <Route path="/online-check-in" element={<OnlineCheckIn/>}/>
          <Route path="/dich-vu-chuyen-bay" element={<DichVuChuyenBay/>}/>
          <Route path="/dich-vu-khac" element={<DichVuKhac/>}/>
          <Route path="/ho-tro" element={<HoTro/>}/>
          
          {/* Trang cá nhân - Yêu cầu hoàn thiện thông tin */}
          <Route path="/ca-nhan" element={
            <RequireCompleteProfile>
              <CaNhan/>
            </RequireCompleteProfile>
          }/>
          
          {/* Quản lý chuyến bay */}
          <Route path="/quan-ly-chuyen-bay" element={
            <RequireCompleteProfile>
              <QuanLyChuyenBayClient/>
            </RequireCompleteProfile>
          }/>
          
          {/* Lịch sử giao dịch */}
          <Route path="/lich-su-giao-dich" element={
            <RequireCompleteProfile>
              <LichSuGiaoDich/>
            </RequireCompleteProfile>
          }/>
          
          {/* Kết quả thanh toán VNPay */}
          <Route path="/payment-result" element={
            <RequireCompleteProfile>
              <PaymentResult/>
            </RequireCompleteProfile>
          }/>
          
          {/* Xác thực email */}
          <Route path="/verify-email" element={<VerifyEmail/>}/>
          
          {/* Trang đặt vé */}
          <Route path="/chon-chuyen-bay" element={<ChonChuyenBay/>}/>
          <Route path="/chon-chuyen-bay-ve" element={<ChonChuyenBayVe/>}/>
          <Route path="/thong-tin-hanh-khach" element={<NhapThongTin/>}/>
          <Route path="/chon-dich-vu" element={<ChonDichVu/>}/>
          <Route path="/thanh-toan" element={<ThanhToan/>}/>
          <Route path="/vnpay-callback" element={<VNPayCallback/>}/>

          {/* Admin Routes - Bảo vệ bằng ProtectedRoute */}
          <Route path="/admin/dashboard" element={
            <AdminSidebarProvider>
              <AdminProtectedRoute><Admin /></AdminProtectedRoute>
            </AdminSidebarProvider>
          }>
            <Route index element={<ThongKeDoanhThu />} />
            <Route path="KhachHang" element={<QuanLyKhachHang />} />
            <Route path="TuyenBay" element={<QuanLyTuyenBay />} />
            <Route path="ChuyenBay" element={<QuanLyChuyenBay />} />
            <Route path="ChuyenBay/them" element={<ThemChuyenBay />} />
            <Route path="ChuyenBay/:id/sua" element={<SuaChuyenBay />} />
            <Route path="DichVu" element={<QuanLyDichVu />} />
            <Route path="ThongKe" element={<ThongKeDoanhThu />} />
            <Route path="SanBay" element={<QuanLySanBay />} />
            <Route path="QuanLyTKAdmin" element={<QuanLyTKAdmin />} />
            <Route path="GiaBay" element={<QuanLyGiaBay />} />
            <Route path="KhuyenMai" element={<QuanLyKhuyenMai />} />
            <Route path="MayBay" element={<QuanLyMayBay />} />
            <Route path="DonHang" element={<QuanLyDonHang />} />
            <Route path="DatCho" element={<QuanLyDatCho />} />
            <Route path="HoaDon" element={<QuanLyHoaDon />} />
            <Route path="HoanTien" element={<QuanLyHoanTien />} />
            <Route path="LichSuThaoTac" element={<QuanLyLichSuThaoTac />} />
            <Route path="VaiTro" element={<QuanLyVaiTro />} />
            <Route path="PhanQuyen" element={<QuanLyPhanQuyen />} />
            <Route path="HangVe" element={<QuanLyHangVe />} />
            <Route path="MayBay/:maMayBay/ghe" element={<ChinhSuaSoDoGhe />} />
            <Route path="XuatBaoCao" element={<XuatBaoCao />} />
            <Route path="DoiSoatGiaoDich" element={<DoiSoatGiaoDich />} />
            <Route path="BannerTinTuc" element={<QuanLyBannerTinTuc />} />
            <Route path="LichSuGiaoDichVNPay" element={<LichSuGiaoDichVNPay />} />
            <Route path="HoTroLienHe" element={<HoTroLienHe />} />
          </Route>
        </Routes>
      </main>
    </>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App