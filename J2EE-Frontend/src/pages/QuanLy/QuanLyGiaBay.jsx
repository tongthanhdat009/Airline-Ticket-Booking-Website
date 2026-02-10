import { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaMoneyBillWave, FaEye, FaPlane } from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import Toast from '../../components/common/Toast';
import ViewToggleButton from '../../components/common/ViewToggleButton';
import CardView from '../../components/common/CardView';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { useViewToggle } from '../../hooks/useViewToggle';
import ViewPriceDetailModal from '../../components/QuanLy/QuanLyGiaBay/ViewPriceDetailModal';
import GiaBayCard from '../../components/QuanLy/QuanLyGiaBay/GiaBayCard';
import { getAllGiaChuyenBay, createGiaChuyenBay, updateGiaChuyenBay, deleteGiaChuyenBay } from '../../services/QLGiaChuyenBayService';
import { getAllTuyenBay } from '../../services/QLTuyenBayServices';
import { getAllHangVe } from '../../services/QLHangVeService';

const QuanLyGiaBay = () => {
    const [prices, setPrices] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [ticketClasses, setTicketClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [currentPrice, setCurrentPrice] = useState(null);
    const [formData, setFormData] = useState({});
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
    const [priceFilter, setPriceFilter] = useState('all'); // Bộ lọc giá: all, low, medium, high
    const itemsPerPage = 10;
    const { viewMode, setViewMode: handleViewChange } = useViewToggle('ql-gia-bay-view', 'table');

    useEffect(() => {
        fetchData();
    }, []);

    // Fetch hạng vé khi mở modal thêm/sửa
    useEffect(() => {
        if (isModalOpen) {
            fetchTicketClasses();
        }
    }, [isModalOpen]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pricesRes, routesRes] = await Promise.all([
                getAllGiaChuyenBay(),
                getAllTuyenBay()
            ]);
            
            // Xử lý dữ liệu giá - có thể nằm trong data hoặc data.data
            const pricesData = pricesRes.data?.data || pricesRes.data || [];
            // Xử lý dữ liệu tuyến bay - getAllTuyenBay đã trả về data trực tiếp
            const routesData = routesRes.data || routesRes || [];
            
            console.log('Prices fetched:', pricesData);
            console.log('Routes fetched:', routesData);
            
            setPrices(Array.isArray(pricesData) ? pricesData : []);
            setRoutes(Array.isArray(routesData) ? routesData : []);
        } catch (err) {
            console.error('Error fetching data:', err);
            showToast('Không thể tải dữ liệu. Vui lòng thử lại.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Hàm refresh dữ liệu modal chi tiết
    const refreshDetailModal = async () => {
        if (!selectedRoute) return;
        
        try {
            const [pricesRes, routesRes] = await Promise.all([
                getAllGiaChuyenBay(),
                getAllTuyenBay()
            ]);
            
            // Xử lý dữ liệu giá - có thể nằm trong data hoặc data.data
            const updatedPrices = pricesRes.data?.data || pricesRes.data || [];
            // Xử lý dữ liệu tuyến bay - getAllTuyenBay đã trả về data trực tiếp
            const updatedRoutes = routesRes.data || routesRes || [];
            
            setPrices(Array.isArray(updatedPrices) ? updatedPrices : []);
            setRoutes(Array.isArray(updatedRoutes) ? updatedRoutes : []);
            
            // Cập nhật selectedRoute với dữ liệu mới
            const updatedRoute = groupedPricesByRoute.find(r => r.maTuyenBay === selectedRoute.maTuyenBay);
            if (updatedRoute) {
                setSelectedRoute(updatedRoute);
            }
        } catch (err) {
            console.error('Error refreshing data:', err);
            showToast('Không thể làm mới dữ liệu.', 'error');
        }
    };

    const fetchTicketClasses = async () => {
        try {
            const classesRes = await getAllHangVe();
            setTicketClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
        } catch (err) {
            console.error('Error fetching ticket classes:', err);
            showToast('Không thể tải danh sách hạng vé.', 'error');
        }
    };

    const groupedPricesByRoute = useMemo(() => {
        const grouped = {};
        
        // Đảm bảo routes và prices là array
        const routesArray = Array.isArray(routes) ? routes : [];
        const pricesArray = Array.isArray(prices) ? prices : [];
        
        console.log('groupedPricesByRoute - routesArray:', routesArray.length);
        console.log('groupedPricesByRoute - pricesArray:', pricesArray.length);
        
        // Khởi tạo tất cả tuyến bay từ danh sách routes
        routesArray.forEach(route => {
            grouped[route.maTuyenBay] = {
                maTuyenBay: route.maTuyenBay,
                tuyenBay: route,
                prices: [],
                totalPrice: 0,
                count: 0,
                avgPrice: 0
            };
        });
        
        // Thêm giá vào các tuyến bay tương ứng
        pricesArray.forEach(price => {
            const routeId = price.tuyenBay?.maTuyenBay;
            if (!routeId || !grouped[routeId]) return;
            
            grouped[routeId].prices.push(price);
            grouped[routeId].totalPrice += parseFloat(price.giaVe);
            grouped[routeId].count += 1;
        });
        
        // Tính giá trung bình
        Object.keys(grouped).forEach(routeId => {
            if (grouped[routeId].count > 0) {
                grouped[routeId].avgPrice = grouped[routeId].totalPrice / grouped[routeId].count;
            }
        });
        
        const result = Object.values(grouped);
        console.log('groupedPricesByRoute result:', result);
        return result;
    }, [prices, routes]);

    const filteredRoutes = useMemo(() => {
        let filtered = groupedPricesByRoute.filter(item => {
            const routeName = `${item.tuyenBay?.sanBayDi?.tenSanBay} - ${item.tuyenBay?.sanBayDen?.tenSanBay}`;
            return routeName?.toLowerCase().includes(searchTerm.toLowerCase());
        });

        // Áp dụng bộ lọc theo giá
        if (priceFilter !== 'all') {
            const allPrices = filtered.map(item => item.avgPrice).sort((a, b) => a - b);
            const min = Math.min(...allPrices);
            const max = Math.max(...allPrices);
            const range = (max - min) / 3;

            filtered = filtered.filter(item => {
                if (priceFilter === 'low') {
                    return item.avgPrice <= min + range;
                } else if (priceFilter === 'medium') {
                    return item.avgPrice > min + range && item.avgPrice <= min + 2 * range;
                } else if (priceFilter === 'high') {
                    return item.avgPrice > min + 2 * range;
                }
                return true;
            });
        }

        return filtered;
    }, [searchTerm, groupedPricesByRoute, priceFilter]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRoutes.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const showToast = (message, type = 'success') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
    };

    const adjustPageAfterDelete = (totalItemsAfterDelete) => {
        const newTotalPages = Math.ceil(totalItemsAfterDelete / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
        }
    };

    const handleViewDetail = (routeData) => {
        console.log('handleViewDetail - routeData:', routeData);
        console.log('handleViewDetail - routeData.prices:', routeData.prices);
        setSelectedRoute(routeData);
        setIsDetailModalOpen(true);
    };

    const handleOpenModal = (price = null) => {
        setCurrentPrice(price);
        if (price) {
            setFormData({
                tuyenBay: { maTuyenBay: price.tuyenBay.maTuyenBay },
                hangVe: { maHangVe: price.hangVe.maHangVe },
                giaVe: price.giaVe,
                ngayApDungTu: price.ngayApDungTu,
                ngayApDungDen: price.ngayApDungDen || ''
            });
        } else {
            setFormData({
                tuyenBay: { maTuyenBay: '' },
                hangVe: { maHangVe: '' },
                giaVe: '',
                ngayApDungTu: '',
                ngayApDungDen: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentPrice(null);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedRoute(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name === 'tuyenBay' || name === 'hangVe') {
            setFormData({ ...formData, [name]: { [`ma${name.charAt(0).toUpperCase() + name.slice(1)}`]: parseInt(value) } });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.tuyenBay.maTuyenBay || !formData.hangVe.maHangVe) {
            showToast('Vui lòng chọn đầy đủ thông tin!', 'error');
            return;
        }

        if (formData.ngayApDungDen && new Date(formData.ngayApDungDen) < new Date(formData.ngayApDungTu)) {
            showToast('Ngày kết thúc phải sau ngày bắt đầu!', 'error');
            return;
        }

        try {
            const submitData = {
                ...formData,
                giaVe: parseFloat(formData.giaVe),
                ngayApDungDen: formData.ngayApDungDen || null
            };

            if (currentPrice) {
                await updateGiaChuyenBay(currentPrice.maGia, submitData);
                showToast('Cập nhật giá chuyến bay thành công!', 'success');
            } else {
                await createGiaChuyenBay(submitData);
                showToast('Thêm giá chuyến bay thành công!', 'success');
            }
            
            // Refresh dữ liệu
            await fetchData();
            
            // Nếu đang xem chi tiết, refresh modal chi tiết và mở lại
            if (selectedRoute) {
                await refreshDetailModal();
                setIsDetailModalOpen(true);
            }
            
            handleCloseModal();
        } catch (err) {
            console.error('Error saving price:', err);
            const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi lưu giá chuyến bay.';
            showToast(errorMessage, 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa giá này?')) {
            try {
                setIsDetailModalOpen(false);
                await deleteGiaChuyenBay(id);
                showToast('Xóa giá chuyến bay thành công!', 'success');
                await fetchData();
                
                const remainingItems = filteredRoutes.length - 1;
                adjustPageAfterDelete(remainingItems);
                
                // Refresh và mở lại modal chi tiết nếu còn dữ liệu
                if (selectedRoute) {
                    await refreshDetailModal();
                    const updatedRoute = groupedPricesByRoute.find(r => r.maTuyenBay === selectedRoute.maTuyenBay);
                    if (updatedRoute && updatedRoute.prices.length > 0) {
                        setSelectedRoute(updatedRoute);
                        setIsDetailModalOpen(true);
                    }
                }
            } catch (err) {
                console.error('Error deleting price:', err);
                const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi xóa giá chuyến bay.';
                showToast(errorMessage, 'error');
                
                // Mở lại modal chi tiết khi có lỗi
                if (selectedRoute) {
                    setIsDetailModalOpen(true);
                }
            }
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Không giới hạn';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const handleEditFromDetail = (price) => {
        setIsDetailModalOpen(false);
        handleOpenModal(price);
    };

    const handleAddNewFromDetail = () => {
        setIsDetailModalOpen(false);
        setFormData({
            tuyenBay: { maTuyenBay: selectedRoute.maTuyenBay },
            hangVe: { maHangVe: '' },
            giaVe: '',
            ngayApDungTu: '',
            ngayApDungDen: ''
        });
        setCurrentPrice(null);
        setIsModalOpen(true);
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="text-lg">Đang tải...</div></div>;

    return (
        <Card title="Quản lý giá chuyến bay">
            <Toast 
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
                duration={3000}
            />

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
                <div className="flex gap-3 flex-wrap flex-1">
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tuyến bay..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                    </div>
                    <select
                        value={priceFilter}
                        onChange={(e) => {
                            setPriceFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    >
                        <option value="all">Tất cả mức giá</option>
                        <option value="low">Giá thấp</option>
                        <option value="medium">Giá trung bình</option>
                        <option value="high">Giá cao</option>
                    </select>
                    <ViewToggleButton
                        currentView={viewMode}
                        onViewChange={handleViewChange}
                        className="shrink-0"
                    />
                </div>
            </div>

            {/* View Mode: Card or Table */}
            {viewMode === 'grid' ? (
                /* Card View */
                <CardView
                    items={currentItems}
                    renderCard={(item, index) => (
                        <GiaBayCard
                            key={item.maTuyenBay || index}
                            data={item}
                            onView={handleViewDetail}
                        />
                    )}
                    emptyMessage="Không tìm thấy tuyến bay nào."
                />
            ) : (
                /* Table View */
                <ResponsiveTable>
                    <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left font-semibold">STT</th>
                                        <th scope="col" className="px-6 py-4 text-left font-semibold">Tuyến bay</th>
                                        <th scope="col" className="px-6 py-4 text-left font-semibold">Số hạng vé đang áp dụng</th>
                                        <th scope="col" className="px-6 py-4 text-center font-semibold">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((item, index) => (
                                            <tr key={item.maTuyenBay} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                                                <td className="px-6 py-4 font-semibold text-blue-600">#{indexOfFirstItem + index + 1}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <FaPlane className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {item.tuyenBay?.sanBayDi?.tenSanBay} → {item.tuyenBay?.sanBayDen?.tenSanBay}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {item.tuyenBay?.sanBayDi?.maIATA} - {item.tuyenBay?.sanBayDen?.maIATA}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-blue-600 text-lg">{item.prices.length > 0 ? new Set(item.prices.map(p => p.hangVe?.tenHangVe)).size : 0} hạng vé</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {item.prices.length > 0
                                                            ? Array.from(new Set(item.prices.map(p => p.hangVe?.tenHangVe))).join(', ')
                                                            : 'Chưa có hạng vé'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => handleViewDetail(item)}
                                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                            title="Xem chi tiết"
                                                        >
                                                            <FaEye size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-12">
                                                <div className="flex flex-col items-center gap-3">
                                                    <FaMoneyBillWave className="text-gray-300 text-5xl" />
                                                    <p className="text-gray-500 font-medium">Không tìm thấy tuyến bay nào.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </ResponsiveTable>
            )}

            {filteredRoutes.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    <span className="text-sm text-gray-600 font-medium">
                        Hiển thị <span className="font-bold text-blue-600">{indexOfFirstItem + 1}</span> đến <span className="font-bold text-blue-600">{Math.min(indexOfLastItem, filteredRoutes.length)}</span> của <span className="font-bold text-blue-600">{filteredRoutes.length}</span> kết quả
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

            {/* Modal chi tiết với component mới */}
            <ViewPriceDetailModal
                selectedRoute={selectedRoute}
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                onEdit={handleEditFromDetail}
                onDelete={handleDelete}
                onAddNew={handleAddNewFromDetail}
                onRefresh={refreshDetailModal}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
            />

            {/* Modal thêm/sửa */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={handleCloseModal}></div>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold">
                                {currentPrice ? 'Chỉnh sửa giá chuyến bay' : 'Thêm giá chuyến bay mới'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-white hover:text-gray-200">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {!selectedRoute && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tuyến bay *</label>
                                        <select
                                            name="tuyenBay"
                                            value={formData.tuyenBay?.maTuyenBay || ''}
                                            onChange={handleFormChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Chọn tuyến bay</option>
                                            {routes.map(route => (
                                                <option key={route.maTuyenBay} value={route.maTuyenBay}>
                                                    {route.sanBayDi?.tenSanBay} → {route.sanBayDen?.tenSanBay}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className={!selectedRoute ? '' : 'md:col-span-2'}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Hạng vé *</label>
                                    <select
                                        name="hangVe"
                                        value={formData.hangVe?.maHangVe || ''}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Chọn hạng vé</option>
                                        {Array.isArray(ticketClasses) && ticketClasses.map(cls => (
                                            <option key={cls.maHangVe} value={cls.maHangVe}>
                                                {cls.tenHangVe}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Giá vé (VND) *</label>
                                    <input
                                        type="number"
                                        name="giaVe"
                                        value={formData.giaVe || ''}
                                        onChange={handleFormChange}
                                        required
                                        min="0"
                                        step="1000"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="VD: 1500000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày áp dụng từ *</label>
                                    <input
                                        type="date"
                                        name="ngayApDungTu"
                                        value={formData.ngayApDungTu || ''}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ngày áp dụng đến 
                                        <span className="text-xs text-gray-500 ml-2">(Để trống nếu không giới hạn)</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="ngayApDungDen"
                                        value={formData.ngayApDungDen || ''}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    {currentPrice ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default QuanLyGiaBay;
