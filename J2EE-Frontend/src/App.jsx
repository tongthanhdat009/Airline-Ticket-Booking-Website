import { lazy, Suspense } from "react"
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom"
import Home from "./pages/KhachHang/TrangChu"
import Admin, { AdminSidebarProvider } from "./pages/QuanLy/TrangChuAdmin"
import LoginAdmin from "./pages/QuanLy/DangNhap"
import LoginClient from "./pages/KhachHang/DangNhap"
import ProtectedRoute, { AdminProtectedRoute } from "./components/common/ProtectedRoute"
import { LoginGuard, RegisterGuard, AdminLoginGuard } from "./components/common/AuthGuard"
import ScrollToTop from "./components/common/ScrollToTop"
import ErrorBoundary from "./components/common/ErrorBoundary"

// Customer pages are lazy-loaded so the homepage ships minimal JS.
// Home (trang chủ) stays eager; everything else splits into per-route chunks.
const SignupClient = lazy(() => import("./pages/KhachHang/DangKy"));
const QuenMatKhau = lazy(() => import("./pages/KhachHang/QuenMatKhau"));
const OAuth2Callback = lazy(() => import("./pages/OAuth2Callback"));
const CaNhan = lazy(() => import("./pages/KhachHang/CaNhan"));
const QuanLyChuyenBayClient = lazy(() => import("./pages/KhachHang/QuanLyChuyenBay"));
const LichSuGiaoDich = lazy(() => import("./pages/KhachHang/LichSuGiaoDich"));
const VerifyEmail = lazy(() => import("./pages/KhachHang/VerifyEmail"));
const PaymentResult = lazy(() => import("./pages/KhachHang/PaymentResult"));
const HoanThienThongTin = lazy(() => import("./pages/KhachHang/HoanThienThongTin"));
const TraCuuChuyenBay = lazy(() => import("./pages/KhachHang/TraCuuChuyenBay"));
const OnlineCheckIn = lazy(() => import("./pages/KhachHang/OnlineCheckIn"));
const DichVuChuyenBay = lazy(() => import("./pages/KhachHang/DichVuChuyenBay"));
const DichVuKhac = lazy(() => import("./pages/KhachHang/DichVuKhac"));
const TinTuc = lazy(() => import("./pages/KhachHang/TinTuc"));
const TinTucChiTiet = lazy(() => import("./pages/KhachHang/TinTucChiTiet"));
const ChonChuyenBay = lazy(() => import("./pages/KhachHang/DatVe/ChonChuyenBay/ChonChuyenBayDi"));
const ChonChuyenBayVe = lazy(() => import("./pages/KhachHang/DatVe/ChonChuyenBay/ChonChuyenBayVe"));
const NhapThongTin = lazy(() => import("./pages/KhachHang/DatVe/NhapThongTin"));
const ChonDichVu = lazy(() => import("./pages/KhachHang/DatVe/ChonDichVu"));
const ThanhToan = lazy(() => import("./pages/KhachHang/DatVe/ThanhToan"));

const ThongKeDoanhThu = lazy(() => import('./pages/QuanLy/ThongKeDoanhThu'));
const QuanLyKhachHang = lazy(() => import('./pages/QuanLy/QuanLyKhachHang'));
const QuanLyTuyenBay = lazy(() => import('./pages/QuanLy/QuanLyTuyenBay'));
const QuanLyChuyenBay = lazy(() => import('./pages/QuanLy/QuanLyChuyenBay'));
const ThemChuyenBay = lazy(() => import('./pages/QuanLy/ChuyenBay/ThemChuyenBay'));
const SuaChuyenBay = lazy(() => import('./pages/QuanLy/ChuyenBay/SuaChuyenBay'));
const QuanLyDichVu = lazy(() => import('./pages/QuanLy/QuanLyDichVu'));
const QuanLySanBay = lazy(() => import("./pages/QuanLy/QuanLySanBay"));
const QuanLyTKAdmin = lazy(() => import("./pages/QuanLy/QuanLyTKAdmin"));
const QuanLyGiaBay = lazy(() => import("./pages/QuanLy/QuanLyGiaBay"));
const QuanLyKhuyenMai = lazy(() => import("./pages/QuanLy/QuanLyKhuyenMai"));
const QuanLyMayBay = lazy(() => import("./pages/QuanLy/QuanLyMayBay"));
const QuanLyDonHang = lazy(() => import("./pages/QuanLy/QuanLyDonHang"));
const QuanLyDatCho = lazy(() => import("./pages/QuanLy/QuanLyDatCho"));
const QuanLyHoaDon = lazy(() => import("./pages/QuanLy/QuanLyHoaDon"));
const QuanLyHoanTien = lazy(() => import("./pages/QuanLy/QuanLyHoanTien"));
const QuanLyLichSuThaoTac = lazy(() => import("./pages/QuanLy/QuanLyLichSuThaoTac"));
const QuanLyVaiTro = lazy(() => import("./pages/QuanLy/QuanLyVaiTro"));
const QuanLyPhanQuyen = lazy(() => import("./pages/QuanLy/QuanLyPhanQuyen"));
const QuanLyHangVe = lazy(() => import("./pages/QuanLy/QuanLyHangVe"));
const ChinhSuaSoDoGhe = lazy(() => import("./pages/QuanLy/ChinhSuaSoDoGhe"));
const XuatBaoCao = lazy(() => import("./pages/QuanLy/XuatBaoCao"));
const DoiSoatGiaoDich = lazy(() => import("./pages/QuanLy/DoiSoatGiaoDich"));
const QuanLyBannerTinTuc = lazy(() => import("./pages/QuanLy/QuanLyBannerTinTuc"));
import RequireCompleteProfile from "./components/common/RequireCompleteProfile"
import Navbar from "./components/common/Navbar"

function AppContent() {
  const location = useLocation();
  const showNavbar = !location.pathname.startsWith('/admin');
  return (
    <>
      {showNavbar && <Navbar />}
      <main>
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Đang tải…</div>}>
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
          <Route path="/tin-tuc" element={<TinTuc/>}/>
          <Route path="/tin-tuc/:id" element={<TinTucChiTiet/>}/>
          {/* /ho-tro route removed - live chat widget is available on all pages */}
          
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
          
          {/* Kết quả thanh toán */}
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
          </Route>
        </Routes>
        </Suspense>
      </main>
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    </ErrorBoundary>
  )
}

export default App