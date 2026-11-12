import { useState, useEffect } from 'react';
import {
 FaSearch,
 FaPlus,
 FaEdit,
 FaTrash,
 FaNewspaper,
 FaEye,
 FaEyeSlash,
 FaCalendar,
 FaTimes,
 FaSave,
 FaSpinner,
 FaRss
} from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import Toast from '../../components/common/Toast';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import TinTucService from '../../services/TinTucService';

const QuanLyBannerTinTuc = () => {
 const [tinTuc, setTinTuc] = useState([]);
 const [search, setSearch] = useState('');
 const [isFormOpen, setIsFormOpen] = useState(false);
 const [editingItem, setEditingItem] = useState(null);
 const [currentPage, setCurrentPage] = useState(1);
 const [itemsPerPage, setItemsPerPage] = useState(5);
 const [isCrawling, setIsCrawling] = useState(false);
 const [crawlSummary, setCrawlSummary] = useState(null);

 // Form state cho Tin Tuc
 const [tinTucForm, setTinTucForm] = useState({
 tieuDe: '',
 tomTat: '',
 noiDung: '',
 hinhAnh: '',
 danhMuc: 'Tin tức',
 trangThai: 'ban_nhap',
 ngayDang: '',
 tacGia: 'Admin'
 });

 // Toast & Confirm
 const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
 const [confirmDialog, setConfirmDialog] = useState({
 isVisible: false,
 title: '',
 message: '',
 type: 'warning',
 confirmText: 'Xác nhận',
 onConfirm: null
 });

 const showToast = (message, type = 'success') => {
 setToast({ isVisible: true, message, type });
 };

 // Load tin tuc from API
 const loadTinTuc = async () => {
 try {
 const data = await TinTucService.getAll();
 setTinTuc(data);
 } catch (error) {
 console.error('Lỗi khi tải danh sách tin tức:', error);
 showToast('Không thể tải danh sách tin tức', 'error');
 }
 };

 // Load tin tuc on component mount
 useEffect(() => {
 loadTinTuc();
 }, []);

 // Lọc dữ liệu
 const filteredTinTuc = tinTuc.filter(t =>
 t.tieuDe.toLowerCase().includes(search.toLowerCase())
 );

 // Mở form tạo/sửa tin tức
 const openTinTucForm = (tinTucItem = null) => {
 if (tinTucItem) {
 setEditingItem(tinTucItem);
 setTinTucForm({
 tieuDe: tinTucItem.tieuDe,
 tomTat: tinTucItem.tomTat,
 noiDung: tinTucItem.noiDung || '',
 hinhAnh: tinTucItem.hinhAnh,
 danhMuc: tinTucItem.danhMuc,
 trangThai: tinTucItem.trangThai,
 ngayDang: tinTucItem.ngayDang || '',
 tacGia: tinTucItem.tacGia || 'Admin'
 });
 } else {
 setEditingItem(null);
 setTinTucForm({
 tieuDe: '',
 tomTat: '',
 noiDung: '',
 hinhAnh: '',
 danhMuc: 'Tin tức',
 trangThai: 'ban_nhap',
 ngayDang: new Date().toISOString().split('T')[0],
 tacGia: 'Admin'
 });
 }
 setIsFormOpen(true);
 };

 // Lưu tin tức
 const handleSaveTinTuc = async () => {
 if (!tinTucForm.tieuDe.trim()) {
 showToast('Vui lòng nhập tiêu đề tin tức', 'error');
 return;
 }
 if (!tinTucForm.tomTat.trim()) {
 showToast('Vui lòng nhập tóm tắt', 'error');
 return;
 }
 try {
 if (editingItem) {
 await TinTucService.update(editingItem.id, tinTucForm);
 showToast('Cập nhật tin tức thành công!');
 } else {
 await TinTucService.create(tinTucForm);
 showToast('Thêm tin tức mới thành công!');
 }
 setIsFormOpen(false);
 loadTinTuc();
 } catch (error) {
 console.error('Lỗi khi lưu tin tức:', error);
 showToast(error.response?.data?.message || 'Không thể lưu tin tức', 'error');
 }
 };

 // Toggle publish tin tức
 const toggleTinTucPublish = async (id) => {
 try {
 await TinTucService.togglePublish(id);
 showToast('Đã cập nhật trạng thái xuất bản');
 loadTinTuc();
 } catch (error) {
 console.error('Lỗi khi cập nhật trạng thái tin tức:', error);
 showToast(error.response?.data?.message || 'Không thể cập nhật trạng thái tin tức', 'error');
 }
 };

 // Xóa tin tức
 const handleDeleteTinTuc = (id) => {
 setConfirmDialog({
 isVisible: true,
 title: 'Xóa tin tức',
 message: 'Bạn có chắc chắn muốn xóa tin tức này?',
 type: 'danger',
 confirmText: 'Xóa',
 onConfirm: async () => {
 try {
 await TinTucService.delete(id);
 showToast('Đã xóa tin tức thành công');
 loadTinTuc();
 } catch (error) {
 console.error('Lỗi khi xóa tin tức:', error);
 showToast(error.response?.data?.message || 'Không thể xóa tin tức', 'error');
 }
 setConfirmDialog(prev => ({ ...prev, isVisible: false }));
 }
 });
 };

 // Crawl tin tức ngay (RSS + LLM viết lại + dedup)
 const handleCrawlNow = async () => {
 if (isCrawling) return;
 setIsCrawling(true);
 setCrawlSummary(null);
 try {
 const summary = await TinTucService.crawlNow();
 setCrawlSummary({ ...summary, at: new Date().toLocaleString('vi-VN') });
 showToast(`Crawl xong: ${summary.created} bài mới, ${summary.skippedDuplicate} trùng, ${summary.skippedIrrelevant} không liên quan máy bay, ${summary.failed} lỗi`, 'success');
 loadTinTuc();
 } catch (error) {
 console.error('Lỗi khi crawl tin tức:', error);
 showToast(error.response?.data?.message || 'Không thể crawl tin tức lúc này', 'error');
 } finally {
 setIsCrawling(false);
 }
 };

 return (
 <Card title="Quản lý Tin tức">
 <Toast
 message={toast.message}
 type={toast.type}
 isVisible={toast.isVisible}
 onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
 />
 <ConfirmDialog
 isVisible={confirmDialog.isVisible}
 title={confirmDialog.title}
 message={confirmDialog.message}
 type={confirmDialog.type}
 confirmText={confirmDialog.confirmText}
 onConfirm={confirmDialog.onConfirm}
 onCancel={() => setConfirmDialog(prev => ({ ...prev, isVisible: false }))}
 />

 {/* Thanh tìm kiếm + nút crawl + nút thêm */}
 <div className="flex flex-wrap items-center gap-4 mb-4">
 <div className="relative flex-1 min-w-[200px]">
 <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
 <input maxLength={100}
 type="text"
 placeholder="Tìm tin tức..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
 />
 </div>
 <button onClick={handleCrawlNow}
 disabled={isCrawling}
 className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium text-sm transition-colors ${isCrawling ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
 title="Crawl RSS các báo, LLM viết lại + lọc trùng rồi lưu nháp"
 >
 {isCrawling ? <FaSpinner className="animate-spin" /> : <FaRss />}
 {isCrawling ? 'Đang crawl...' : 'Crawl ngay'}
 </button>
 <button
 onClick={() => openTinTucForm()}
 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
 >
 <FaPlus />
 Thêm tin tức
 </button>
 </div>

 {/* Kết quả crawl gần nhất */}
 {crawlSummary && (
 <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800 flex flex-wrap gap-x-5 gap-y-1">
 <span className="font-semibold">Crawl lúc {crawlSummary.at}:</span>
 <span>Quét: <strong>{crawlSummary.fetched}</strong></span>
 <span>Mới: <strong>{crawlSummary.created}</strong></span>
 <span>Trùng bỏ qua: <strong>{crawlSummary.skippedDuplicate}</strong></span>
 <span>Không liên quan máy bay: <strong>{crawlSummary.skippedIrrelevant}</strong></span>
 <span>Lỗi: <strong>{crawlSummary.failed}</strong></span>
 </div>
 )}

 {/* Phân trang header */}
 {(() => {
 return filteredTinTuc.length > 0 && (
 <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
 <div className="flex items-center gap-4">
 <span className="text-sm text-gray-600">
 Hiển thị <span className="font-bold text-blue-600">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredTinTuc.length)}</span> đến <span className="font-bold text-blue-600">{Math.min(currentPage * itemsPerPage, filteredTinTuc.length)}</span> của <span className="font-bold text-blue-600">{filteredTinTuc.length}</span>
 </span>
 <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
 className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white">
 <option value={5}>5 / trang</option>
 <option value={10}>10 / trang</option>
 <option value={20}>20 / trang</option>
 </select>
 </div>
 </div>
 );
 })()}

 {/* Danh sách tin tức */}
 {filteredTinTuc.length === 0 ? (
 <div className="text-center py-12 text-gray-500">
 <FaNewspaper className="text-4xl mx-auto mb-3 text-gray-300" />
 <p>Chưa có tin tức nào</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full border-collapse">
 <thead>
 <tr className="bg-gray-50 text-gray-600">
 <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
 <th className="px-4 py-3 text-left text-sm font-semibold">Tiêu đề</th>
 <th className="px-4 py-3 text-left text-sm font-semibold">Danh mục</th>
 <th className="px-4 py-3 text-left text-sm font-semibold">Trạng thái</th>
 <th className="px-4 py-3 text-left text-sm font-semibold">Ngày đăng</th>
 <th className="px-4 py-3 text-right text-sm font-semibold">Lượt xem</th>
 <th className="px-4 py-3 text-left text-sm font-semibold">Tác giả</th>
 <th className="px-4 py-3 text-center text-sm font-semibold">Thao tác</th>
 </tr>
 </thead>
 <tbody>
 {filteredTinTuc.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, index) => (
 <tr key={item.id} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50`}>
 <td className="px-4 py-3 text-sm text-gray-600">{item.id}</td>
 <td className="px-4 py-3">
 <div className="flex items-center gap-3">
 <img src={item.hinhAnh} alt="" className="w-16 h-10 rounded object-cover" />
 <div>
 <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.tieuDe}</p>
 <p className="text-xs text-gray-500 line-clamp-1">{item.tomTat}</p>
 </div>
 </div>
 </td>
 <td className="px-4 py-3">
 <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
 {item.danhMuc}
 </span>
 </td>
 <td className="px-4 py-3">
 <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
 item.trangThai === 'da_xuat_ban'
 ? 'bg-green-100 text-green-700'
 : 'bg-yellow-100 text-yellow-700'
 }`}>
 {item.trangThai === 'da_xuat_ban' ? 'Đã xuất bản' : 'Bản nháp'}
 </span>
 </td>
 <td className="px-4 py-3 text-sm text-gray-600">{item.ngayDang || '-'}</td>
 <td className="px-4 py-3 text-sm text-right text-gray-600">{item.luotXem.toLocaleString()}</td>
 <td className="px-4 py-3 text-sm text-gray-600">{item.tacGia}</td>
 <td className="px-4 py-3">
 <div className="flex items-center justify-center gap-1">
 <button onClick={() => toggleTinTucPublish(item.id)} className="p-2 text-green-600 hover:bg-green-100 rounded-lg" title={item.trangThai === 'da_xuat_ban' ? 'Bản nháp' : 'Xuất bản'}>
 {item.trangThai === 'da_xuat_ban' ? <FaEyeSlash /> : <FaEye />}
 </button>
 <button onClick={() => openTinTucForm(item)} className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg" title="Sửa">
 <FaEdit />
 </button>
 <button onClick={() => handleDeleteTinTuc(item.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="Xóa">
 <FaTrash />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {/* Pagination */}
 {(() => {
 const totalPages = Math.ceil(filteredTinTuc.length / itemsPerPage);
 if (totalPages <= 1) return null;
 const maxButtons = 5;
 let start = 1;
 if (totalPages > maxButtons) {
 if (currentPage <= 3) start = 1;
 else if (currentPage >= totalPages - 2) start = totalPages - maxButtons + 1;
 else start = currentPage - 2;
 }
 const end = Math.min(totalPages, start + maxButtons - 1);
 return (
 <div className="flex items-center justify-center gap-2 mt-6 px-2 max-w-full overflow-x-auto">
 <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-100 shrink-0 whitespace-nowrap">← Trước</button>
 {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(page => (
 <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-lg text-sm font-medium shrink-0 ${page === currentPage ? 'bg-blue-600 text-white' : 'border hover:bg-gray-100'}`}>{page}</button>
 ))}
 <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-100 shrink-0 whitespace-nowrap">Sau →</button>
 </div>
 );
 })()}

 {/* Modal form Tin tức */}
 {isFormOpen && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsFormOpen(false)}>
 <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
 <div className="flex justify-between items-center p-6 border-b">
 <h3 className="text-lg font-bold text-gray-800">
 {editingItem ? 'Chỉnh sửa Tin tức' : 'Thêm Tin tức mới'}
 </h3>
 <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
 <FaTimes />
 </button>
 </div>
 <div className="p-6 space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
 <input
 type="text"
 value={tinTucForm.tieuDe}
 maxLength={255}
 onChange={(e) => setTinTucForm(prev => ({ ...prev, tieuDe: e.target.value }))}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
 placeholder="VD: Thông báo chuyến bay mới..."
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Tóm tắt *</label>
 <textarea maxLength={2000}
 value={tinTucForm.tomTat}
 onChange={(e) => setTinTucForm(prev => ({ ...prev, tomTat: e.target.value }))}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
 rows={2}
 placeholder="Tóm tắt ngắn cho tin tức..."
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung chi tiết</label>
 <textarea
 value={tinTucForm.noiDung}
 maxLength={2000}
 onChange={(e) => setTinTucForm(prev => ({ ...prev, noiDung: e.target.value }))}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
 rows={8}
 placeholder="Nội dung chi tiết của tin tức..."
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">URL hình ảnh</label>
 <input
 type="url"
 value={tinTucForm.hinhAnh}
 maxLength={500}
 onChange={(e) => setTinTucForm(prev => ({ ...prev, hinhAnh: e.target.value }))}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
 placeholder="https://example.com/image.jpg"
 />
 {tinTucForm.hinhAnh && (
 <img
 src={tinTucForm.hinhAnh}
 alt="Preview"
 className="mt-2 w-full h-40 object-cover rounded-lg border"
 onError={(e) => { e.target.style.display = 'none'; }}
 />
 )}
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
 <select
 value={tinTucForm.danhMuc}
 onChange={(e) => setTinTucForm(prev => ({ ...prev, danhMuc: e.target.value }))}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
 >
 <option value="Tin tức">Tin tức</option>
 <option value="Thông báo">Thông báo</option>
 <option value="Khuyến mãi">Khuyến mãi</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
 <select
 value={tinTucForm.trangThai}
 onChange={(e) => setTinTucForm(prev => ({ ...prev, trangThai: e.target.value }))}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
 >
 <option value="ban_nhap">Bản nháp</option>
 <option value="da_xuat_ban">Đã xuất bản</option>
 </select>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đăng</label>
 <input
 type="date"
 value={tinTucForm.ngayDang}
 onChange={(e) => setTinTucForm(prev => ({ ...prev, ngayDang: e.target.value }))}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả</label>
 <input
 type="text"
 value={tinTucForm.tacGia}
 maxLength={100}
 onChange={(e) => setTinTucForm(prev => ({ ...prev, tacGia: e.target.value }))}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
 placeholder="Admin"
 />
 </div>
 </div>
 </div>
 <div className="flex justify-end gap-3 p-6 border-t">
 <button
 onClick={() => setIsFormOpen(false)}
 className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium"
 >
 Hủy
 </button>
 <button
 onClick={handleSaveTinTuc}
 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
 >
 <FaSave />
 {editingItem ? 'Cập nhật' : 'Thêm mới'}
 </button>
 </div>
 </div>
 </div>
 )}
 </Card>
 );
};

export default QuanLyBannerTinTuc;
