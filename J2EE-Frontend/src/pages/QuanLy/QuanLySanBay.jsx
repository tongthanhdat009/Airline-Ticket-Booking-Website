import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaToggleOn, FaToggleOff, FaPlane, FaTimes } from 'react-icons/fa';
import { getAllSanBay, addSanBay, updateTrangThaiSanBay, thongTinSanBay } from '../../services/QLSanBayServices';
import Card from '../../components/QuanLy/CardChucNang';
import { MdLocalAirport } from 'react-icons/md';
import ViewToggleButton from '../../components/common/ViewToggleButton';
import CardView from '../../components/common/CardView';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { useViewToggle } from '../../hooks/useViewToggle';
import SanBayCard from '../../components/QuanLy/QuanLySanBay/SanBayCard';

const QuanLySanBay = () => {
    const [sanBayList, setSanBayList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const { viewMode, setViewMode: handleViewChange } = useViewToggle('ql-san-bay-view', 'table');

    const fetchSanBay = async () => {
        try {
            setLoading(true);
            const res = await getAllSanBay();
            setSanBayList(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setError('Không thể tải dữ liệu sân bay.');
            setSanBayList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSanBay();
    }, []);

    const filteredSanBayList = Array.isArray(sanBayList) ? sanBayList.filter(sb =>
        sb.tenSanBay?.toLowerCase().includes(search.toLowerCase()) ||
        sb.thanhPhoSanBay?.toLowerCase().includes(search.toLowerCase()) ||
        sb.quocGiaSanBay?.toLowerCase().includes(search.toLowerCase()) ||
        sb.maIATA?.toLowerCase().includes(search.toLowerCase()) ||
        sb.maICAO?.toLowerCase().includes(search.toLowerCase())
    ) : [];

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSanBayList.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSanBayList.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleItemsPerPageChange = (e) => {
        const newValue = parseInt(e.target.value);
        setItemsPerPage(newValue);
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    const handleOpenModalForAdd = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSave = async (sanBayData) => {
        try {
            await addSanBay(sanBayData);
            fetchSanBay();
            handleCloseModal();
        } catch (err) {
            alert(`Lỗi: Không thể lưu sân bay. ${err.message}`);
        }
    };  

    const handleToggleStatus = async (maSanBay, currentStatus) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const statusText = newStatus === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa';

        if (window.confirm(`Bạn có chắc chắn muốn ${statusText} sân bay này?`)) {
            try {
                await updateTrangThaiSanBay(maSanBay, newStatus);
                alert(`${statusText.charAt(0).toUpperCase() + statusText.slice(1)} sân bay thành công!`);
                fetchSanBay();
            } catch (err) {
                alert(`Lỗi: Không thể cập nhật trạng thái sân bay. ${err.message}`);
            }
        }
    };

    const handleViewSanBay = (sanBay) => {
        const statusText = sanBay.trangThaiHoatDong === 'ACTIVE' ? 'Hoạt động' : 'Vô hiệu';
        alert(`Chi tiết sân bay:\n\nMã: ${sanBay.maSanBay}\nIATA: ${sanBay.maIATA}\nICAO: ${sanBay.maICAO}\nTên: ${sanBay.tenSanBay}\nThành phố: ${sanBay.thanhPhoSanBay}\nQuốc gia: ${sanBay.quocGiaSanBay}\nTrạng thái: ${statusText}`);
    };

    const handleEditSanBay = (sanBay) => {
        alert(`Tính năng chỉnh sửa sân bay đang được phát triển.\n\nMã sân bay: ${sanBay.maSanBay}`);
    };

    const handleDeleteSanBay = (sanBay) => {
        handleToggleStatus(sanBay.maSanBay, sanBay.trangThaiHoatDong);
    };

    return (
        <Card title="Quản lý sân bay">
            {/* Thanh công cụ */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sân bay theo tên, thành phố, quốc gia..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    />
                    <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                </div>
                <ViewToggleButton
                    currentView={viewMode}
                    onViewChange={handleViewChange}
                    className="shrink-0"
                />
                <button
                    onClick={handleOpenModalForAdd}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold w-full md:w-auto"
                >
                    <FaPlus />
                    <span>Thêm sân bay</span>
                </button>
            </div>

            {/* Loading và Error */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-600 font-medium">{error}</p>
                </div>
            )}

            {/* View Mode: Card or Table */}
            {!loading && !error && (
                <>
                    {viewMode === 'grid' ? (
                        /* Card View */
                        <CardView
                            items={currentItems}
                            renderCard={(sanBay, index) => (
                                <SanBayCard
                                    key={sanBay.maSanBay || index}
                                    data={sanBay}
                                    onView={handleViewSanBay}
                                    onEdit={handleEditSanBay}
                                    onDelete={handleDeleteSanBay}
                                />
                            )}
                            emptyMessage="Không tìm thấy sân bay nào."
                        />
                    ) : (
                        /* Table View */
                        <ResponsiveTable>
                            <table className="w-full text-sm">
                                <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold">Mã sân bay</th>
                                        <th className="px-6 py-4 text-left font-semibold">Mã IATA</th>
                                        <th className="px-6 py-4 text-left font-semibold">Mã ICAO</th>
                                        <th className="px-6 py-4 text-left font-semibold">Tên sân bay</th>
                                        <th className="px-6 py-4 text-left font-semibold">Thành phố</th>
                                        <th className="px-6 py-4 text-left font-semibold">Quốc gia</th>
                                        <th className="px-6 py-4 text-center font-semibold">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((sb, index) => (
                                            <tr key={sb.maSanBay} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                                                <td className="px-6 py-4 font-bold text-blue-600">#{sb.maSanBay}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                        {sb.maIATA}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                                        {sb.maICAO}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                                            <MdLocalAirport className="text-blue-600 text-xl" />
                                                        </div>
                                                        <span className="font-medium text-gray-900">{sb.tenSanBay}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">{sb.thanhPhoSanBay}</td>
                                                <td className="px-6 py-4 text-gray-700">{sb.quocGiaSanBay}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center items-center gap-2">
                                                        <button
                                                            onClick={() => handleToggleStatus(sb.maSanBay, sb.trangThaiHoatDong)}
                                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                                                                sb.trangThaiHoatDong === 'ACTIVE'
                                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                            }`}
                                                            title={sb.trangThaiHoatDong === 'ACTIVE' ? 'Click để vô hiệu hóa' : 'Click để kích hoạt'}
                                                        >
                                                            {sb.trangThaiHoatDong === 'ACTIVE' ? (
                                                                <>
                                                                    <FaToggleOn size={20} />
                                                                    <span>Hoạt động</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FaToggleOff size={20} />
                                                                    <span>Vô hiệu</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-12">
                                                <div className="flex flex-col items-center gap-3">
                                                    <MdLocalAirport className="text-gray-300 text-5xl" />
                                                    <p className="text-gray-500 font-medium">Không tìm thấy sân bay nào.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </ResponsiveTable>
                    )}
                </>
            )}

            {/* Thanh phân trang */}
            {!loading && !error && filteredSanBayList.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 font-medium">
                            Hiển thị <span className="font-bold text-blue-600">{indexOfFirstItem + 1}</span> đến <span className="font-bold text-blue-600">{Math.min(indexOfLastItem, filteredSanBayList.length)}</span> của <span className="font-bold text-blue-600">{filteredSanBayList.length}</span> kết quả
                        </span>
                        <select
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
                        >
                            <option value={5}>5 / trang</option>
                            <option value={10}>10 / trang</option>
                            <option value={20}>20 / trang</option>
                            <option value={50}>50 / trang</option>
                        </select>
                    </div>
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

            {/* Modal */}
            {isModalOpen && (
                <SanBayModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </Card>
    );
};

// Modal Component
const SanBayModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        maICAO: '',
        maIATA: '',
        tenSanBay: '',
        thanhPhoSanBay: '',
        quocGiaSanBay: ''
    });

    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData({ maICAO: '', maIATA: '', tenSanBay: '', thanhPhoSanBay: '', quocGiaSanBay: '' });
            setSearchError('');
            setSearchLoading(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Hàm trích xuất tên tiếng Việt từ keywords
    const extractVietnameseName = (keywords) => {
        if (!keywords) return null;
        
        // Tách chuỗi keywords thành mảng các phần tử
        const keywordArray = keywords.split(',').map(k => k.trim());
        
        // Tìm phần tử có chứa "Sân bay" hoặc ký tự tiếng Việt
        const vietnameseName = keywordArray.find(keyword => 
            keyword.includes('Sân bay') || 
            /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(keyword)
        );
        return vietnameseName || null;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'maICAO') {
            setSearchError('');
        }
    };

    const handleIcaoBlur = async () => {
        const icaoCode = formData.maICAO.trim().toUpperCase();

        if (icaoCode.length > 0 && icaoCode.length !== 4) {
            setSearchError('Mã ICAO phải có đúng 4 ký tự.');
            return;
        }
        
        setSearchError('');
        if (icaoCode.length !== 4) return;

        setSearchLoading(true);
        try {
            const response = await thongTinSanBay(icaoCode);
            const data = response.data; // Lấy data từ response.data
            
            // Trích xuất tên tiếng Việt từ keywords
            const vietnameseName = extractVietnameseName(data.keywords);
            
            setFormData({
                maICAO: data.icao_code || icaoCode,
                maIATA: data.iata_code || '',
                tenSanBay: vietnameseName || data.name || '', // Ưu tiên tên tiếng Việt
                thanhPhoSanBay: data.municipality || '',
                quocGiaSanBay: data.country?.name || ''
            });
        } catch (error) {
            setSearchError('Không tìm thấy thông tin cho mã ICAO này.');
            setFormData(prev => ({ ...prev, maIATA: '', tenSanBay: '', thanhPhoSanBay: '', quocGiaSanBay: '' }));
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.tenSanBay) {
            setSearchError('Vui lòng nhập mã ICAO hợp lệ để tải thông tin sân bay trước khi lưu.');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Thêm sân bay mới</h2>
                        <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                            <FaTimes size={24} />
                        </button>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Mã sân bay (ICAO) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="maICAO"
                                    placeholder="Nhập mã ICAO 4 ký tự (VD: VVTS)"
                                    value={formData.maICAO}
                                    onChange={handleChange}
                                    onBlur={handleIcaoBlur}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm ${searchError ? 'border-red-500' : 'border-gray-300'}`}
                                    required
                                    maxLength="4"
                                />
                                {searchLoading && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            {searchError && <p className="text-red-500 text-sm mt-1">{searchError}</p>}
                            <p className="text-xs text-gray-500 mt-1">Nhập mã ICAO và rời khỏi ô để tự động tải thông tin</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Mã IATA</label>
                            <input
                                type="text"
                                name="maIATA"
                                value={formData.maIATA}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tên sân bay</label>
                            <input
                                type="text"
                                name="tenSanBay"
                                value={formData.tenSanBay}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Thành phố</label>
                            <input
                                type="text"
                                name="thanhPhoSanBay"
                                value={formData.thanhPhoSanBay}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Quốc gia</label>
                            <input
                                type="text"
                                name="quocGiaSanBay"
                                value={formData.quocGiaSanBay}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold transition-all shadow-lg"
                        >
                            Lưu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuanLySanBay;