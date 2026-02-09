import { useState, useEffect, useCallback } from 'react';
import {
  FaSearch,
  FaEye,
  FaFilePdf,
  FaFileExcel,
  FaCalendar,
  FaTimes,
  FaPrint
} from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import hoaDonApi from '../../services/hoaDonApi';
import Toast from '../../components/common/Toast';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ViewToggleButton from '../../components/common/ViewToggleButton';
import CardView from '../../components/common/CardView';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { useViewToggle } from '../../hooks/useViewToggle';
import { HoaDonDetailModal } from '../../components/QuanLy/QuanLyHoaDon';
import HoaDonCard from '../../components/QuanLy/QuanLyHoaDon/HoaDonCard';

const QuanLyHoaDon = () => {
  // View toggle hook
  const { viewMode, setViewMode: handleViewChange } = useViewToggle('ql-hoa-don-view', 'table');

  // States cho dữ liệu
  const [hoaDonList, setHoaDonList] = useState([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  // States cho thống kê
  const [thongKe, setThongKe] = useState({
    tongSoHoaDon: 0,
    daPhatHanh: 0,
    daHuy: 0,
    dieuChinh: 0,
    tongDoanhThu: 0,
    tongThueVAT: 0,
    tongThanhToanThucTe: 0
  });

  // States cho pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // States cho search và filters
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    trangThai: '',
    tuNgay: '',
    denNgay: '',
  });

  // States cho modal
  const [selectedHoaDon, setSelectedHoaDon] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // States cho Toast
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });

  // States cho ConfirmDialog
  const [confirmDialog, setConfirmDialog] = useState({
    isVisible: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Xác nhận',
    onConfirm: null
  });

  // Toast handler
  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // ConfirmDialog handlers
  const _showConfirm = (title, message, type, confirmText, onConfirm) => {
    setConfirmDialog({
      isVisible: true,
      title,
      message,
      type,
      confirmText,
      onConfirm
    });
  };

  const hideConfirm = () => {
    setConfirmDialog(prev => ({ ...prev, isVisible: false }));
  };

  // Load dữ liệu từ API
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [hoaDonResponse, thongKeResponse] = await Promise.all([
        hoaDonApi.getHoaDonList(filters),
        hoaDonApi.getThongKeHoaDon()
      ]);

      if (hoaDonResponse.success && hoaDonResponse.data) {
        setHoaDonList(hoaDonResponse.data);
      } else {
        setError(hoaDonResponse.message || 'Không thể tải dữ liệu');
        showToast(hoaDonResponse.message || 'Không thể tải dữ liệu', 'error');
      }

      if (thongKeResponse.success && thongKeResponse.data) {
        setThongKe(thongKeResponse.data);
      }
    } catch (err) {
      console.error('Error loading hoa don:', err);
      const errorMsg = err.response?.data?.message || 'Lỗi khi tải dữ liệu';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load dữ liệu khi component mount hoặc filters thay đổi
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter theo search text
  const filteredHoaDon = hoaDonList.filter(hd =>
    (hd.soHoaDon?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (hd.pnr?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (hd.hoTenNguoiDat?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (hd.emailNguoiDat?.toLowerCase() || '').includes(search.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHoaDon.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHoaDon.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Export PDF
  const handleExportPdf = async (maHoaDon) => {
    try {
      setExportLoading(true);
      const pdfBlob = await hoaDonApi.exportHoaDonPdf(maHoaDon);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `hoadon_${maHoaDon}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showToast('Xuất PDF thành công!', 'success');
    } catch (err) {
      console.error('Error exporting PDF:', err);
      showToast('Lỗi khi xuất PDF', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  // Export Excel
  const handleExportExcel = async () => {
    try {
      setExportLoading(true);
      const excelBlob = await hoaDonApi.exportHoaDonExcel(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([excelBlob], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `danh_sach_hoa_don_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showToast('Xuất Excel thành công!', 'success');
    } catch (err) {
      console.error('Error exporting Excel:', err);
      showToast('Lỗi khi xuất Excel', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  // View detail - gọi API để lấy chi tiết đầy đủ
  const handleViewDetail = async (hoaDon) => {
    try {
      setLoading(true);
      const response = await hoaDonApi.getHoaDonById(hoaDon.maHoaDon);
      if (response.success && response.data) {
        setSelectedHoaDon(response.data);
        setIsDetailModalOpen(true);
      } else {
        showToast(response.message || 'Không thể tải chi tiết hóa đơn', 'error');
      }
    } catch (err) {
      console.error('Error loading hoa don detail:', err);
      showToast('Lỗi khi tải chi tiết hóa đơn', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedHoaDon(null);
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Get status text and color
  const getStatusStyle = (status) => {
    switch (status) {
      case 'DA_PHAT_HANH':
        return { text: 'Đã phát hành', color: 'bg-green-100 text-green-700' };
      case 'DA_HUY':
        return { text: 'Đã hủy', color: 'bg-red-100 text-red-700' };
      case 'DIEU_CHINH':
        return { text: 'Điều chỉnh', color: 'bg-yellow-100 text-yellow-700' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  return (
    <Card title="Quản lý hóa đơn">
      {/* Toast Component */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      {/* ConfirmDialog Component */}
      <ConfirmDialog
        isVisible={confirmDialog.isVisible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText={confirmDialog.confirmText}
        onConfirm={confirmDialog.onConfirm}
        onCancel={hideConfirm}
      />

      {/* Thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-linear-to-br from-blue-500 to-cyan-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Tổng số hóa đơn</p>
              <p className="text-3xl font-bold mt-2">{thongKe.tongSoHoaDon}</p>
            </div>
            <FaFilePdf size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-linear-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Đã phát hành</p>
              <p className="text-3xl font-bold mt-2">{thongKe.daPhatHanh}</p>
            </div>
            <FaPrint size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-linear-to-br from-red-500 to-rose-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Đã hủy</p>
              <p className="text-3xl font-bold mt-2">{thongKe.daHuy}</p>
            </div>
            <FaTimes size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-linear-to-br from-purple-500 to-violet-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Tổng doanh thu</p>
              <p className="text-xl font-bold mt-2">{formatCurrency(thongKe.tongDoanhThu)}</p>
            </div>
            <FaCalendar size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Thanh công cụ */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-3">
        <div className="relative w-full lg:w-96">
          <input
            type="text"
            placeholder="Tìm kiếm theo số HĐ, PNR, tên, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        </div>

        <ViewToggleButton
          currentView={viewMode}
          onViewChange={handleViewChange}
          className="shrink-0"
        />

        <div className="flex gap-3 w-full lg:w-auto flex-wrap">
          <select
            value={filters.trangThai}
            onChange={(e) => setFilters(prev => ({ ...prev, trangThai: e.target.value }))}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="DA_PHAT_HANH">Đã phát hành</option>
            <option value="DA_HUY">Đã hủy</option>
            <option value="DIEU_CHINH">Điều chỉnh</option>
          </select>

          <button
            onClick={handleExportExcel}
            disabled={exportLoading || hoaDonList.length === 0}
            className="flex items-center gap-2 bg-linear-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaFileExcel />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>

          <button
            onClick={() => loadData()}
            className="flex items-center gap-2 bg-linear-to-r from-blue-500 to-cyan-600 text-white px-5 py-3 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl font-semibold"
          >
            <FaCalendar />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </div>

      {/* Bảng dữ liệu / Card View */}
      {viewMode === 'grid' ? (
        /* Card View */
        <CardView
          items={currentItems}
          renderCard={(hd, index) => (
            <HoaDonCard
              key={hd.maHoaDon || index}
              data={hd}
              onView={handleViewDetail}
              onExportPdf={handleExportPdf}
            />
          )}
          emptyMessage="Không tìm thấy hóa đơn nào."
        />
      ) : (
        /* Table View */
        <ResponsiveTable>
          <table className="w-full text-sm">
            <thead className="bg-linear-to-r from-slate-700 to-slate-800 text-white">
              <tr>
                <th className="px-4 py-4 text-left font-semibold">Số HĐ</th>
                <th className="px-4 py-4 text-left font-semibold">PNR</th>
                <th className="px-4 py-4 text-left font-semibold">Khách hàng</th>
                <th className="px-4 py-4 text-left font-semibold">Ngày lập</th>
                <th className="px-4 py-4 text-right font-semibold">Tổng tiền</th>
                <th className="px-4 py-4 text-right font-semibold">Thuế VAT</th>
                <th className="px-4 py-4 text-right font-semibold">Tổng TT</th>
                <th className="px-4 py-4 text-center font-semibold">Trạng thái</th>
                <th className="px-4 py-4 text-center font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((hd, index) => {
                  const status = getStatusStyle(hd.trangThai);
                  return (
                    <tr key={hd.maHoaDon} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                      <td className="px-4 py-4 font-bold text-blue-600">{hd.soHoaDon}</td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                          {hd.pnr}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{hd.hoTenNguoiDat}</p>
                          <p className="text-xs text-gray-500">{hd.emailNguoiDat}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-700">{formatDate(hd.ngayLap)}</td>
                      <td className="px-4 py-4 text-right font-medium text-gray-900">{formatCurrency(hd.tongTien)}</td>
                      <td className="px-4 py-4 text-right text-gray-700">{formatCurrency(hd.thueVAT)}</td>
                      <td className="px-4 py-4 text-right font-bold text-blue-600">{formatCurrency(hd.tongThanhToan)}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleViewDetail(hd)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Xem chi tiết"
                          >
                            <FaEye />
                          </button>
                          {hd.trangThai === 'DA_PHAT_HANH' && (
                            <button
                              onClick={() => handleExportPdf(hd.maHoaDon)}
                              disabled={exportLoading}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                              title="In PDF"
                            >
                              <FaFilePdf />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <FaFilePdf className="text-gray-300 text-5xl" />
                      <p className="text-gray-500 font-medium">Không tìm thấy hóa đơn nào.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ResponsiveTable>
      )}

      {/* Phân trang */}
      {filteredHoaDon.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <span className="text-sm text-gray-600 font-medium">
            Hiển thị <span className="font-bold text-blue-600">{indexOfFirstItem + 1}</span> đến <span className="font-bold text-blue-600">{Math.min(indexOfLastItem, filteredHoaDon.length)}</span> của <span className="font-bold text-blue-600">{filteredHoaDon.length}</span> kết quả
          </span>
          <nav>
            <ul className="flex gap-2">
              <li>
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-sm"
                >
                  ← Trước
                </button>
              </li>
              {[...Array(totalPages)].map((_, index) => (
                <li key={index}>
                  <button
                    onClick={() => paginate(index + 1)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === index + 1
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-sm"
                >
                  Sau →
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Modal chi tiết */}
      <HoaDonDetailModal
        isOpen={isDetailModalOpen}
        hoaDon={selectedHoaDon}
        exportLoading={exportLoading}
        onClose={handleCloseDetailModal}
        onExportPdf={handleExportPdf}
      />
    </Card>
  );
};

export default QuanLyHoaDon;
