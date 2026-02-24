import { useState } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import doiSoatGiaoDichApi from '../../../services/doiSoatGiaoDichApi';

/**
 * Form cập nhật ghi chú xử lý đối soát
 * @param {number} itemId - Mã hóa đơn
 * @param {function} onSuccess - Callback khi cập nhật thành công
 * @param {function} onCancel - Callback khi hủy
 */
const ReconciliationNoteForm = ({ itemId, onSuccess, onCancel }) => {
 const [ghiChu, setGhiChu] = useState('');
 const [nguoiXuLy, setNguoiXuLy] = useState('');
 const [trangThai, setTrangThai] = useState('RESOLVED');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);

 const handleSubmit = async (e) => {
 e.preventDefault();
 
 if (!ghiChu.trim()) {
 setError('Vui lòng nhập ghi chú');
 return;
 }
 if (!nguoiXuLy.trim()) {
 setError('Vui lòng nhập ngưởi xử lý');
 return;
 }

 setLoading(true);
 setError(null);

 try {
 await doiSoatGiaoDichApi.updateReconciliationNote(itemId, {
 ghiChu: ghiChu.trim(),
 nguoiXuLy: nguoiXuLy.trim(),
 trangThai
 });
 onSuccess?.();
 } catch (err) {
 setError(err.response?.data?.message || 'Lỗi khi cập nhật ghi chú');
 } finally {
 setLoading(false);
 }
 };

 return (
 <form onSubmit={handleSubmit} className="space-y-3">
 {error && (
 <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
 {error}
 </div>
 )}

 <div>
 <label className="block text-xs font-medium text-gray-700 mb-1">
 Ghi chú xử lý <span className="text-red-500">*</span>
 </label>
 <textarea
 value={ghiChu}
 onChange={(e) => setGhiChu(e.target.value)}
 placeholder="Nhập ghi chú về việc xử lý giao dịch lệch..."
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
 rows={3}
 disabled={loading}
 />
 </div>

 <div>
 <label className="block text-xs font-medium text-gray-700 mb-1">
 Ngưởi xử lý <span className="text-red-500">*</span>
 </label>
 <input
 type="text"
 value={nguoiXuLy}
 onChange={(e) => setNguoiXuLy(e.target.value)}
 placeholder="Email hoặc tên đăng nhập"
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
 disabled={loading}
 />
 </div>

 <div>
 <label className="block text-xs font-medium text-gray-700 mb-1">
 Trạng thái xử lý
 </label>
 <select
 value={trangThai}
 onChange={(e) => setTrangThai(e.target.value)}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
 disabled={loading}
 >
 <option value="RESOLVED">Đã xử lý (RESOLVED)</option>
 <option value="IGNORED">Bỏ qua (IGNORED)</option>
 <option value="PENDING">Chờ xử lý (PENDING)</option>
 </select>
 </div>

 <div className="flex gap-2 pt-2">
 <button
 type="submit"
 disabled={loading}
 className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all ${
 loading 
 ? 'bg-gray-400 cursor-not-allowed' 
 : 'bg-blue-600 hover:bg-blue-700'
 }`}
 >
 {loading ? (
 <>
 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
 Đang lưu...
 </>
 ) : (
 <>
 <FaSave />
 Lưu ghi chú
 </>
 )}
 </button>
 <button
 type="button"
 onClick={onCancel}
 disabled={loading}
 className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-all"
 >
 <FaTimes />
 Hủy
 </button>
 </div>
 </form>
 );
};

export default ReconciliationNoteForm;
