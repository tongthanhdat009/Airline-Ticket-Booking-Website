import React, { useState } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaFighterJet, FaTimes } from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';

const QuanLyMayBay = () => {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAircraft, setSelectedAircraft] = useState(null);
    const itemsPerPage = 5;

    // Dữ liệu mẫu hard code
    const [aircrafts, setAircrafts] = useState([
        {
            maMayBay: 'MB001',
            tenMayBay: 'Boeing 787-9 Dreamliner',
            loaiMayBay: 'Commercial',
            hangSanXuat: 'Boeing',
            namSanXuat: 2019,
            soGheHangNhat: 24,
            soGheHangHai: 48,
            soGhePhoThong: 210,
            tongSoGhe: 282,
            trangThai: 'ACTIVE',
            anhMayBay: '/images/boeing787.jpg'
        },
        {
            maMayBay: 'MB002',
            tenMayBay: 'Airbus A350-900',
            loaiMayBay: 'Commercial',
            hangSanXuat: 'Airbus',
            namSanXuat: 2020,
            soGheHangNhat: 32,
            soGheHangHai: 64,
            soGhePhoThong: 235,
            tongSoGhe: 331,
            trangThai: 'ACTIVE',
            anhMayBay: '/images/airbus350.jpg'
        },
        {
            maMayBay: 'MB003',
            tenMayBay: 'Boeing 777-300ER',
            loaiMayBay: 'Commercial',
            hangSanXuat: 'Boeing',
            namSanXuat: 2018,
            soGheHangNhat: 8,
            soGheHangHai: 42,
            soGhePhoThong: 306,
            tongSoGhe: 356,
            trangThai: 'ACTIVE',
            anhMayBay: '/images/boeing777.jpg'
        },
        {
            maMayBay: 'MB004',
            tenMayBay: 'Airbus A321neo',
            loaiMayBay: 'Commercial',
            hangSanXuat: 'Airbus',
            namSanXuat: 2021,
            soGheHangNhat: 0,
            soGheHangHai: 16,
            soGhePhoThong: 180,
            tongSoGhe: 196,
            trangThai: 'ACTIVE',
            anhMayBay: '/images/airbus321.jpg'
        },
        {
            maMayBay: 'MB005',
            tenMayBay: 'Boeing 737 MAX 8',
            loaiMayBay: 'Commercial',
            hangSanXuat: 'Boeing',
            namSanXuat: 2022,
            soGheHangNhat: 0,
            soGheHangHai: 12,
            soGhePhoThong: 162,
            tongSoGhe: 174,
            trangThai: 'MAINTENANCE',
            anhMayBay: '/images/boeing737.jpg'
        }
    ]);

    const filteredAircrafts = aircrafts.filter(mb =>
        mb.tenMayBay?.toLowerCase().includes(search.toLowerCase()) ||
        mb.hangSanXuat?.toLowerCase().includes(search.toLowerCase()) ||
        mb.maMayBay?.toLowerCase().includes(search.toLowerCase()) ||
        mb.loaiMayBay?.toLowerCase().includes(search.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAircrafts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAircrafts.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleOpenModalForAdd = () => {
        setSelectedAircraft(null);
        setIsModalOpen(true);
    };

    const handleOpenModalForEdit = (aircraft) => {
        setSelectedAircraft(aircraft);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAircraft(null);
    };

    const handleDelete = (maMayBay) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa máy bay này?')) {
            setAircrafts(aircrafts.filter(mb => mb.maMayBay !== maMayBay));
        }
    };

    const getTrangThaiText = (trangThai) => {
        switch (trangThai) {
            case 'ACTIVE': return { text: 'Hoạt động', color: 'bg-green-100 text-green-700' };
            case 'MAINTENANCE': return { text: 'Bảo trì', color: 'bg-yellow-100 text-yellow-700' };
            case 'INACTIVE': return { text: 'Vô hiệu', color: 'bg-red-100 text-red-700' };
            default: return { text: trangThai, color: 'bg-gray-100 text-gray-700' };
        }
    };

    return (
        <Card title="Quản lý máy bay">
            {/* Thanh công cụ */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Tìm kiếm máy bay theo tên, hãng sản xuất..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm"
                    />
                    <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                </div>
                <button
                    onClick={handleOpenModalForAdd}
                    className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-5 py-3 rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold w-full md:w-auto"
                >
                    <FaPlus />
                    <span>Thêm máy bay</span>
                </button>
            </div>

            {/* Thống kê tổng quan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Tổng số máy bay</p>
                            <p className="text-3xl font-bold mt-2">{aircrafts.length}</p>
                        </div>
                        <FaFighterJet size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Đang hoạt động</p>
                            <p className="text-3xl font-bold mt-2">{aircrafts.filter(a => a.trangThai === 'ACTIVE').length}</p>
                        </div>
                        <FaFighterJet size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Đang bảo trì</p>
                            <p className="text-3xl font-bold mt-2">{aircrafts.filter(a => a.trangThai === 'MAINTENANCE').length}</p>
                        </div>
                        <FaFighterJet size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Tổng số ghế</p>
                            <p className="text-3xl font-bold mt-2">{aircrafts.reduce((sum, a) => sum + a.tongSoGhe, 0).toLocaleString()}</p>
                        </div>
                        <FaFighterJet size={40} className="opacity-80" />
                    </div>
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-sky-600 to-blue-700 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left font-semibold">Mã máy bay</th>
                                <th className="px-6 py-4 text-left font-semibold">Tên máy bay</th>
                                <th className="px-6 py-4 text-left font-semibold">Hãng SX</th>
                                <th className="px-6 py-4 text-left font-semibold">Năm SX</th>
                                <th className="px-6 py-4 text-center font-semibold">Hạng nhất</th>
                                <th className="px-6 py-4 text-center font-semibold">Hạng hai</th>
                                <th className="px-6 py-4 text-center font-semibold">Phổ thông</th>
                                <th className="px-6 py-4 text-center font-semibold">Tổng</th>
                                <th className="px-6 py-4 text-center font-semibold">Trạng thái</th>
                                <th className="px-6 py-4 text-center font-semibold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentItems.length > 0 ? (
                                currentItems.map((mb, index) => {
                                    const status = getTrangThaiText(mb.trangThai);
                                    return (
                                        <tr key={mb.maMayBay} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-sky-50 transition-colors`}>
                                            <td className="px-6 py-4 font-bold text-sky-600">#{mb.maMayBay}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                                                        <FaFighterJet className="text-sky-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{mb.tenMayBay}</p>
                                                        <p className="text-xs text-gray-500">{mb.loaiMayBay}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{mb.hangSanXuat}</td>
                                            <td className="px-6 py-4 text-gray-700">{mb.namSanXuat}</td>
                                            <td className="px-6 py-4 text-center font-semibold text-yellow-600">{mb.soGheHangNhat}</td>
                                            <td className="px-6 py-4 text-center font-semibold text-orange-600">{mb.soGheHangHai}</td>
                                            <td className="px-6 py-4 text-center font-semibold text-blue-600">{mb.soGhePhoThong}</td>
                                            <td className="px-6 py-4 text-center font-bold text-sky-600">{mb.tongSoGhe}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                                    {status.text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button
                                                        onClick={() => handleOpenModalForEdit(mb)}
                                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(mb.maMayBay)}
                                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="10" className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <FaFighterJet className="text-gray-300 text-5xl" />
                                            <p className="text-gray-500 font-medium">Không tìm thấy máy bay nào.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Thanh phân trang */}
            {filteredAircrafts.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    <span className="text-sm text-gray-600 font-medium">
                        Hiển thị <span className="font-bold text-sky-600">{indexOfFirstItem + 1}</span> đến <span className="font-bold text-sky-600">{Math.min(indexOfLastItem, filteredAircrafts.length)}</span> của <span className="font-bold text-sky-600">{filteredAircrafts.length}</span> kết quả
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
                                                ? 'bg-sky-600 text-white shadow-lg'
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
                <MayBayModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    aircraft={selectedAircraft}
                    onSave={(data) => {
                        const tongSoGhe = (parseInt(data.soGheHangNhat) || 0) + (parseInt(data.soGheHangHai) || 0) + (parseInt(data.soGhePhoThong) || 0);
                        const aircraftWithTotal = { ...data, tongSoGhe };
                        if (selectedAircraft) {
                            setAircrafts(aircrafts.map(mb => mb.maMayBay === selectedAircraft.maMayBay ? aircraftWithTotal : mb));
                        } else {
                            setAircrafts([...aircrafts, { ...aircraftWithTotal, maMayBay: `MB00${aircrafts.length + 1}` }]);
                        }
                        handleCloseModal();
                    }}
                />
            )}
        </Card>
    );
};

// Modal Component
const MayBayModal = ({ isOpen, onClose, onSave, aircraft }) => {
    const [formData, setFormData] = useState({
        tenMayBay: '',
        loaiMayBay: 'Commercial',
        hangSanXuat: '',
        namSanXuat: '',
        soGheHangNhat: 0,
        soGheHangHai: 0,
        soGhePhoThong: 0,
        trangThai: 'ACTIVE',
        anhMayBay: ''
    });

    React.useEffect(() => {
        if (isOpen && aircraft) {
            setFormData(aircraft);
        } else if (isOpen) {
            setFormData({
                tenMayBay: '',
                loaiMayBay: 'Commercial',
                hangSanXuat: '',
                namSanXuat: '',
                soGheHangNhat: 0,
                soGheHangHai: 0,
                soGhePhoThong: 0,
                trangThai: 'ACTIVE',
                anhMayBay: ''
            });
        }
    }, [isOpen, aircraft]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-sky-600 to-blue-700 text-white p-6 rounded-t-xl sticky top-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">{aircraft ? 'Cập nhật máy bay' : 'Thêm máy bay mới'}</h2>
                        <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                            <FaTimes size={24} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Tên máy bay <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="tenMayBay"
                                value={formData.tenMayBay}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm"
                                placeholder="VD: Boeing 787-9 Dreamliner"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Hãng sản xuất <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="hangSanXuat"
                                value={formData.hangSanXuat}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm"
                                required
                            >
                                <option value="">Chọn hãng</option>
                                <option value="Boeing">Boeing</option>
                                <option value="Airbus">Airbus</option>
                                <option value="Embraer">Embraer</option>
                                <option value="Bombardier">Bombardier</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Loại máy bay <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="loaiMayBay"
                                value={formData.loaiMayBay}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm"
                                required
                            >
                                <option value="Commercial">Commercial</option>
                                <option value="Private">Private</option>
                                <option value="Cargo">Cargo</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Năm sản xuất <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="namSanXuat"
                                value={formData.namSanXuat}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm"
                                placeholder="VD: 2020"
                                min="1970"
                                max="2030"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Trạng thái
                            </label>
                            <select
                                name="trangThai"
                                value={formData.trangThai}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm"
                            >
                                <option value="ACTIVE">Hoạt động</option>
                                <option value="MAINTENANCE">Bảo trì</option>
                                <option value="INACTIVE">Vô hiệu</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Số ghế hạng nhất
                            </label>
                            <input
                                type="number"
                                name="soGheHangNhat"
                                value={formData.soGheHangNhat}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Số ghế hạng hai
                            </label>
                            <input
                                type="number"
                                name="soGheHangHai"
                                value={formData.soGheHangHai}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Số ghế phổ thông <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="soGhePhoThong"
                                value={formData.soGhePhoThong}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm"
                                min="0"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                URL ảnh máy bay
                            </label>
                            <input
                                type="text"
                                name="anhMayBay"
                                value={formData.anhMayBay}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm"
                                placeholder="/images/aircraft.jpg"
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
                            className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 font-semibold transition-all shadow-lg"
                        >
                            {aircraft ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuanLyMayBay;
