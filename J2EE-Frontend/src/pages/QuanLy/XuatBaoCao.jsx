import { useState } from 'react';
import {
  FaFileExcel,
  FaFilePdf,
  FaDownload,
  FaCalendar,
  FaPlane,
  FaUsers,
  FaDollarSign,
  FaChartLine,
  FaSpinner,
  FaInfoCircle,
  FaEye,
  FaTable,
  FaTimes
} from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import Toast from '../../components/common/Toast';
import ThongKeService from '../../services/ThongKeService';
import { getAllKhachHang } from '../../services/QLKhachHangService';

// Các loại báo cáo hỗ trợ
const reportTypes = [
  {
    key: 'doanh_thu',
    label: 'Báo cáo doanh thu',
    icon: FaDollarSign,
    color: 'text-green-600 bg-green-100',
    description: 'Tổng hợp doanh thu theo thời gian, tuyến bay, hạng vé'
  },
  {
    key: 'hanh_khach',
    label: 'Danh sách hành khách',
    icon: FaUsers,
    color: 'text-blue-600 bg-blue-100',
    description: 'Danh sách hành khách theo chuyến bay, thời gian'
  },
  {
    key: 'chuyen_bay',
    label: 'Báo cáo chuyến bay',
    icon: FaPlane,
    color: 'text-orange-600 bg-orange-100',
    description: 'Thống kê chuyến bay, tỉ lệ đặt chỗ, hủy vé'
  },
  {
    key: 'tong_hop',
    label: 'Báo cáo tổng hợp',
    icon: FaChartLine,
    color: 'text-purple-600 bg-purple-100',
    description: 'Báo cáo tổng hợp toàn bộ hoạt động kinh doanh'
  }
];

// Format tiền tệ
const formatCurrency = (value) => {
  if (!value && value !== 0) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value);
};

const XuatBaoCao = () => {
  const [selectedReportType, setSelectedReportType] = useState('doanh_thu');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [tuNgay, setTuNgay] = useState('2026-02-01');
  const [denNgay, setDenNgay] = useState('2026-02-21');
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const previewPageSize = 10;

  // Toast state
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  // Validate thời gian
  const validateDates = () => {
    if (!tuNgay || !denNgay) {
      showToast('Vui lòng chọn khoảng thời gian', 'error');
      return false;
    }
    if (new Date(tuNgay) > new Date(denNgay)) {
      showToast('Ngày bắt đầu phải trước ngày kết thúc', 'error');
      return false;
    }
    return true;
  };

  // Xem trước dữ liệu
  const handlePreview = async () => {
    if (!validateDates()) return;

    setIsLoadingPreview(true);
    setShowPreview(false);
    setPreviewData(null);
    setPreviewPage(1);

    try {
      let data = null;

      switch (selectedReportType) {
        case 'doanh_thu': {
          const [tongQuanRes, doanhThuNgayRes] = await Promise.all([
            ThongKeService.getThongKeTongQuan(tuNgay, denNgay),
            ThongKeService.getDoanhThuTheoNgay(tuNgay, denNgay)
          ]);
          data = {
            type: 'doanh_thu',
            tongQuan: tongQuanRes?.data || tongQuanRes,
            doanhThuNgay: doanhThuNgayRes?.data || doanhThuNgayRes || []
          };
          break;
        }
        case 'hanh_khach': {
          const khachHangRes = await getAllKhachHang();
          data = {
            type: 'hanh_khach',
            danhSach: khachHangRes?.data || khachHangRes || []
          };
          break;
        }
        case 'chuyen_bay': {
          const [tongQuanRes, topChangBayRes] = await Promise.all([
            ThongKeService.getThongKeTongQuan(tuNgay, denNgay),
            ThongKeService.getTopChangBay(tuNgay, denNgay, 20)
          ]);
          data = {
            type: 'chuyen_bay',
            tongQuan: tongQuanRes?.data || tongQuanRes,
            topChangBay: topChangBayRes?.data || topChangBayRes || []
          };
          break;
        }
        case 'tong_hop': {
          const [tongQuanRes, doanhThuNgayRes, hangVeRes, trangThaiRes] = await Promise.all([
            ThongKeService.getThongKeTongQuan(tuNgay, denNgay),
            ThongKeService.getDoanhThuTheoNgay(tuNgay, denNgay),
            ThongKeService.getDoanhThuTheoHangVe(tuNgay, denNgay),
            ThongKeService.getThongKeTrangThaiDonHang(tuNgay, denNgay)
          ]);
          data = {
            type: 'tong_hop',
            tongQuan: tongQuanRes?.data || tongQuanRes,
            doanhThuNgay: doanhThuNgayRes?.data || doanhThuNgayRes || [],
            hangVe: hangVeRes?.data || hangVeRes || [],
            trangThaiDonHang: trangThaiRes?.data || trangThaiRes || []
          };
          break;
        }
        default:
          break;
      }

      setPreviewData(data);
      setShowPreview(true);
      showToast('Đã tải dữ liệu xem trước thành công!', 'success');
    } catch (error) {
      console.error('Error loading preview:', error);
      showToast('Lỗi khi tải dữ liệu xem trước. Vui lòng thử lại.', 'error');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Xử lý xuất báo cáo
  const handleExport = async () => {
    if (!validateDates()) return;

    setIsExporting(true);

    try {
      if (selectedReportType === 'doanh_thu' || selectedReportType === 'tong_hop') {
        // Xuất PDF thông qua ThongKeService
        const pdfBlob = await ThongKeService.exportPdf(tuNgay, denNgay);
        const url = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        const typeLabel = reportTypes.find(r => r.key === selectedReportType)?.label || 'BaoCao';
        link.setAttribute('download', `${typeLabel}_${tuNgay}_${denNgay}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        showToast(`Đã xuất ${typeLabel} định dạng PDF thành công!`, 'success');
      } else if (selectedReportType === 'hanh_khach') {
        // Xuất PDF từ ThongKe cho hành khách (sử dụng chung endpoint)
        const pdfBlob = await ThongKeService.exportPdf(tuNgay, denNgay);
        const url = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `DanhSachHanhKhach_${tuNgay}_${denNgay}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        showToast('Đã xuất danh sách hành khách PDF thành công!', 'success');
      } else if (selectedReportType === 'chuyen_bay') {
        const pdfBlob = await ThongKeService.exportPdf(tuNgay, denNgay);
        const url = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `BaoCaoChuyenBay_${tuNgay}_${denNgay}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        showToast('Đã xuất báo cáo chuyến bay PDF thành công!', 'success');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      showToast('Lỗi khi xuất báo cáo. Vui lòng thử lại.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Preset khoảng thời gian
  const applyPreset = (preset) => {
    const now = new Date();
    let from, to;
    switch (preset) {
      case 'today':
        from = to = now.toISOString().split('T')[0];
        break;
      case 'this_week': {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1);
        from = startOfWeek.toISOString().split('T')[0];
        to = now.toISOString().split('T')[0];
        break;
      }
      case 'this_month':
        from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        to = now.toISOString().split('T')[0];
        break;
      case 'last_month': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
        from = lastMonth.toISOString().split('T')[0];
        to = lastDay.toISOString().split('T')[0];
        break;
      }
      case 'this_quarter': {
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        from = quarterStart.toISOString().split('T')[0];
        to = now.toISOString().split('T')[0];
        break;
      }
      default:
        return;
    }
    setTuNgay(from);
    setDenNgay(to);
    // Reset preview khi thay đổi thời gian
    setShowPreview(false);
    setPreviewData(null);
  };

  // Render xem trước doanh thu
  const renderDoanhThuPreview = () => {
    if (!previewData || previewData.type !== 'doanh_thu') return null;
    const { tongQuan, doanhThuNgay } = previewData;

    return (
      <div className="space-y-4">
        {/* Tổng quan */}
        {tongQuan && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-semibold">Tổng doanh thu</p>
              <p className="text-lg font-bold text-blue-800">{formatCurrency(tongQuan.tongDoanhThu)}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-600 font-semibold">Số đơn hàng</p>
              <p className="text-lg font-bold text-green-800">{tongQuan.tongDonHang || 0}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-xs text-purple-600 font-semibold">Hành khách</p>
              <p className="text-lg font-bold text-purple-800">{tongQuan.tongHanhKhach || 0}</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-xs text-orange-600 font-semibold">Chuyến bay</p>
              <p className="text-lg font-bold text-orange-800">{tongQuan.tongChuyenBay || 0}</p>
            </div>
          </div>
        )}

        {/* Bảng doanh thu theo ngày */}
        {Array.isArray(doanhThuNgay) && doanhThuNgay.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Doanh thu theo ngày ({doanhThuNgay.length} bản ghi)</p>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Ngày</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-600">Doanh thu</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-600">Số đơn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {doanhThuNgay.slice((previewPage - 1) * previewPageSize, previewPage * previewPageSize).map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 text-gray-700">{item.ngay || item.date || '-'}</td>
                      <td className="px-4 py-2 text-right font-medium text-gray-900">{formatCurrency(item.doanhThu || item.revenue)}</td>
                      <td className="px-4 py-2 text-right text-gray-600">{item.soDon || item.orders || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPreviewPagination(doanhThuNgay.length)}
          </div>
        )}
      </div>
    );
  };

  // Render xem trước hành khách
  const renderHanhKhachPreview = () => {
    if (!previewData || previewData.type !== 'hanh_khach') return null;
    const { danhSach } = previewData;

    return (
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Danh sách hành khách ({danhSach.length} người)</p>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">STT</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Mã KH</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Họ và tên</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Email</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">SĐT</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Giới tính</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Quốc gia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {danhSach.slice((previewPage - 1) * previewPageSize, previewPage * previewPageSize).map((kh, index) => (
                <tr key={kh.maHanhKhach || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2 text-gray-500">{(previewPage - 1) * previewPageSize + index + 1}</td>
                  <td className="px-3 py-2 font-medium text-blue-600">#{kh.maHanhKhach}</td>
                  <td className="px-3 py-2 text-gray-800 font-medium">{kh.hoVaTen || '-'}</td>
                  <td className="px-3 py-2 text-gray-600">{kh.email || '-'}</td>
                  <td className="px-3 py-2 text-gray-600">{kh.soDienThoai || '-'}</td>
                  <td className="px-3 py-2 text-gray-600">{kh.gioiTinh || '-'}</td>
                  <td className="px-3 py-2 text-gray-600">{kh.quocGia || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {renderPreviewPagination(danhSach.length)}
      </div>
    );
  };

  // Render xem trước chuyến bay
  const renderChuyenBayPreview = () => {
    if (!previewData || previewData.type !== 'chuyen_bay') return null;
    const { tongQuan, topChangBay } = previewData;

    return (
      <div className="space-y-4">
        {tongQuan && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-xs text-orange-600 font-semibold">Tổng chuyến bay</p>
              <p className="text-lg font-bold text-orange-800">{tongQuan.tongChuyenBay || 0}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-semibold">Tổng đơn hàng</p>
              <p className="text-lg font-bold text-blue-800">{tongQuan.tongDonHang || 0}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-600 font-semibold">Tổng doanh thu</p>
              <p className="text-lg font-bold text-green-800">{formatCurrency(tongQuan.tongDoanhThu)}</p>
            </div>
          </div>
        )}

        {Array.isArray(topChangBay) && topChangBay.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Top chặng bay phổ biến ({topChangBay.length} chặng)</p>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">STT</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Chặng bay</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-600">Số lượt</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-600">Doanh thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topChangBay.slice((previewPage - 1) * previewPageSize, previewPage * previewPageSize).map((cb, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 text-gray-500">{(previewPage - 1) * previewPageSize + index + 1}</td>
                      <td className="px-4 py-2 text-gray-800 font-medium">{cb.tenTuyenBay || cb.changBay || cb.route || '-'}</td>
                      <td className="px-4 py-2 text-right text-gray-600">{cb.soLuot || cb.count || 0}</td>
                      <td className="px-4 py-2 text-right font-medium text-gray-900">{formatCurrency(cb.doanhThu || cb.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPreviewPagination(topChangBay.length)}
          </div>
        )}
      </div>
    );
  };

  // Render xem trước tổng hợp
  const renderTongHopPreview = () => {
    if (!previewData || previewData.type !== 'tong_hop') return null;
    const { tongQuan, doanhThuNgay, hangVe, trangThaiDonHang } = previewData;

    return (
      <div className="space-y-4">
        {tongQuan && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-semibold">Tổng doanh thu</p>
              <p className="text-lg font-bold text-blue-800">{formatCurrency(tongQuan.tongDoanhThu)}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-600 font-semibold">Đơn hàng</p>
              <p className="text-lg font-bold text-green-800">{tongQuan.tongDonHang || 0}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-xs text-purple-600 font-semibold">Hành khách</p>
              <p className="text-lg font-bold text-purple-800">{tongQuan.tongHanhKhach || 0}</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-xs text-orange-600 font-semibold">Chuyến bay</p>
              <p className="text-lg font-bold text-orange-800">{tongQuan.tongChuyenBay || 0}</p>
            </div>
          </div>
        )}

        {/* Doanh thu theo hạng vé */}
        {Array.isArray(hangVe) && hangVe.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Doanh thu theo hạng vé</p>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Hạng vé</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-600">Doanh thu</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-600">Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {hangVe.map((hv, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 text-gray-800 font-medium">{hv.tenHangVe || hv.name || '-'}</td>
                      <td className="px-4 py-2 text-right font-medium text-gray-900">{formatCurrency(hv.doanhThu || hv.revenue)}</td>
                      <td className="px-4 py-2 text-right text-gray-600">{hv.tyLe || hv.percentage ? `${(hv.tyLe || hv.percentage).toFixed(1)}%` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trạng thái đơn hàng */}
        {Array.isArray(trangThaiDonHang) && trangThaiDonHang.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Thống kê trạng thái đơn hàng</p>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Trạng thái</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-600">Số lượng</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-600">Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {trangThaiDonHang.map((tt, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 text-gray-800 font-medium">{tt.trangThai || tt.status || '-'}</td>
                      <td className="px-4 py-2 text-right text-gray-600">{tt.soLuong || tt.count || 0}</td>
                      <td className="px-4 py-2 text-right text-gray-600">{tt.tyLe || tt.percentage ? `${(tt.tyLe || tt.percentage).toFixed(1)}%` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Doanh thu theo ngày */}
        {Array.isArray(doanhThuNgay) && doanhThuNgay.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Doanh thu theo ngày ({doanhThuNgay.length} bản ghi)</p>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Ngày</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-600">Doanh thu</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-600">Số đơn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {doanhThuNgay.slice((previewPage - 1) * previewPageSize, previewPage * previewPageSize).map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 text-gray-700">{item.ngay || item.date || '-'}</td>
                      <td className="px-4 py-2 text-right font-medium text-gray-900">{formatCurrency(item.doanhThu || item.revenue)}</td>
                      <td className="px-4 py-2 text-right text-gray-600">{item.soDon || item.orders || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPreviewPagination(doanhThuNgay.length)}
          </div>
        )}
      </div>
    );
  };

  // Render phân trang cho preview
  const renderPreviewPagination = (totalItems) => {
    const totalPreviewPages = Math.ceil(totalItems / previewPageSize);
    if (totalPreviewPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-gray-500">
          Hiển thị {Math.min((previewPage - 1) * previewPageSize + 1, totalItems)} - {Math.min(previewPage * previewPageSize, totalItems)} / {totalItems}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
            disabled={previewPage === 1}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ←
          </button>
          {[...Array(Math.min(totalPreviewPages, 5))].map((_, i) => {
            let pageNum;
            if (totalPreviewPages <= 5) {
              pageNum = i + 1;
            } else if (previewPage <= 3) {
              pageNum = i + 1;
            } else if (previewPage >= totalPreviewPages - 2) {
              pageNum = totalPreviewPages - 4 + i;
            } else {
              pageNum = previewPage - 2 + i;
            }
            return (
              <button
                key={pageNum}
                onClick={() => setPreviewPage(pageNum)}
                className={`px-2 py-1 text-xs rounded ${previewPage === pageNum ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setPreviewPage(p => Math.min(totalPreviewPages, p + 1))}
            disabled={previewPage === totalPreviewPages}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
      </div>
    );
  };

  // Render preview content theo loại báo cáo
  const renderPreviewContent = () => {
    if (!previewData) return null;
    switch (previewData.type) {
      case 'doanh_thu': return renderDoanhThuPreview();
      case 'hanh_khach': return renderHanhKhachPreview();
      case 'chuyen_bay': return renderChuyenBayPreview();
      case 'tong_hop': return renderTongHopPreview();
      default: return <p className="text-gray-500 text-sm">Không có dữ liệu xem trước.</p>;
    }
  };

  return (
    <Card title="Xuất báo cáo">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />

      {/* Thông tin hướng dẫn */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <FaInfoCircle className="text-blue-500 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-semibold mb-1">Hướng dẫn xuất báo cáo</p>
          <p>Chọn loại báo cáo, khoảng thời gian và định dạng file. Nhấn <strong>"Xem trước dữ liệu"</strong> để kiểm tra nội dung trước khi xuất.</p>
        </div>
      </div>

      {/* Chọn loại báo cáo */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">1. Chọn loại báo cáo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedReportType === type.key;
            return (
              <div
                key={type.key}
                onClick={() => {
                  setSelectedReportType(type.key);
                  setShowPreview(false);
                  setPreviewData(null);
                }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${type.color}`}>
                    <Icon className="text-lg" />
                  </div>
                  <span className={`font-semibold text-sm ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                    {type.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{type.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chọn khoảng thời gian */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">2. Chọn khoảng thời gian</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: 'today', label: 'Hôm nay' },
            { key: 'this_week', label: 'Tuần này' },
            { key: 'this_month', label: 'Tháng này' },
            { key: 'last_month', label: 'Tháng trước' },
            { key: 'this_quarter', label: 'Quý này' }
          ].map((preset) => (
            <button
              key={preset.key}
              onClick={() => applyPreset(preset.key)}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <FaCalendar className="text-gray-400" />
            <label className="text-sm text-gray-600">Từ ngày:</label>
            <input
              type="date"
              value={tuNgay}
              onChange={(e) => { setTuNgay(e.target.value); setShowPreview(false); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <FaCalendar className="text-gray-400" />
            <label className="text-sm text-gray-600">Đến ngày:</label>
            <input
              type="date"
              value={denNgay}
              onChange={(e) => { setDenNgay(e.target.value); setShowPreview(false); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Chọn định dạng */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">3. Chọn định dạng file</h3>
        <div className="flex gap-4">
          <label
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              exportFormat === 'pdf'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="format"
              value="pdf"
              checked={exportFormat === 'pdf'}
              onChange={(e) => setExportFormat(e.target.value)}
              className="hidden"
            />
            <FaFilePdf className={`text-2xl ${exportFormat === 'pdf' ? 'text-red-600' : 'text-gray-400'}`} />
            <div>
              <p className={`font-semibold ${exportFormat === 'pdf' ? 'text-red-700' : 'text-gray-700'}`}>PDF</p>
              <p className="text-xs text-gray-500">Phù hợp để in ấn</p>
            </div>
          </label>
          <label
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              exportFormat === 'excel'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="format"
              value="excel"
              checked={exportFormat === 'excel'}
              onChange={(e) => setExportFormat(e.target.value)}
              className="hidden"
            />
            <FaFileExcel className={`text-2xl ${exportFormat === 'excel' ? 'text-green-600' : 'text-gray-400'}`} />
            <div>
              <p className={`font-semibold ${exportFormat === 'excel' ? 'text-green-700' : 'text-gray-700'}`}>Excel</p>
              <p className="text-xs text-gray-500">Phù hợp để phân tích dữ liệu</p>
            </div>
          </label>
        </div>
      </div>

      {/* Nút xem trước + xuất báo cáo */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={handlePreview}
          disabled={isLoadingPreview}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            isLoadingPreview
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {isLoadingPreview ? (
            <>
              <FaSpinner className="animate-spin" />
              Đang tải dữ liệu...
            </>
          ) : (
            <>
              <FaEye />
              Xem trước dữ liệu
            </>
          )}
        </button>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all ${
            isExporting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {isExporting ? (
            <>
              <FaSpinner className="animate-spin" />
              Đang xuất báo cáo...
            </>
          ) : (
            <>
              <FaDownload />
              Xuất báo cáo
            </>
          )}
        </button>
      </div>

      {/* Panel xem trước dữ liệu */}
      {showPreview && previewData && (
        <div className="mb-8 border-2 border-amber-300 rounded-xl overflow-hidden">
          {/* Header panel */}
          <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaTable className="text-amber-600" />
              <h3 className="font-semibold text-amber-800">
                Xem trước dữ liệu - {reportTypes.find(r => r.key === selectedReportType)?.label}
              </h3>
              <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                {tuNgay} → {denNgay}
              </span>
            </div>
            <button
              onClick={() => { setShowPreview(false); setPreviewData(null); }}
              className="p-1.5 text-amber-600 hover:bg-amber-200 rounded-lg transition-colors"
              title="Đóng xem trước"
            >
              <FaTimes />
            </button>
          </div>

          {/* Nội dung xem trước */}
          <div className="p-5 bg-white max-h-125 overflow-y-auto">
            {renderPreviewContent()}
          </div>

          {/* Footer panel */}
          <div className="bg-amber-50 border-t border-amber-200 px-5 py-3 flex items-center justify-between">
            <p className="text-xs text-amber-700">
              Dữ liệu hiển thị ở trên sẽ được bao gồm trong báo cáo xuất ra.
            </p>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? <FaSpinner className="animate-spin" /> : <FaDownload />}
              Xuất báo cáo ngay
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default XuatBaoCao;
