import { FaPlane, FaTimes } from 'react-icons/fa';

const TuyenBayModal = ({ isOpen, onClose, onSubmit, formData, handleFormChange, airports, currentRoute }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative z-10">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">
                            {currentRoute ? 'Chỉnh sửa tuyến bay' : 'Thêm tuyến bay mới'}
                        </h2>
                        <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                            <FaTimes size={24} />
                        </button>
                    </div>
                </div>
                <form onSubmit={onSubmit} className="p-6">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="maSanBayDi">
                                <FaPlane className="inline mr-2 text-green-600 transform -rotate-45" />
                                Sân bay đi <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="maSanBayDi"
                                name="sanBayDi"
                                value={formData.sanBayDi.maSanBay}
                                onChange={handleFormChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                                required
                            >
                                <option value="">-- Chọn sân bay đi --</option>
                                {airports.map(a => (
                                    <option key={a.maSanBay} value={a.maSanBay}>
                                        {a.tenSanBay} ({a.maIATA})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="maSanBayDen">
                                <FaPlane className="inline mr-2 text-blue-600 transform rotate-45" />
                                Sân bay đến <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="maSanBayDen"
                                name="sanBayDen"
                                value={formData.sanBayDen.maSanBay}
                                onChange={handleFormChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                                required
                            >
                                <option value="">-- Chọn sân bay đến --</option>
                                {airports.map(a => (
                                    <option key={a.maSanBay} value={a.maSanBay}>
                                        {a.tenSanBay} ({a.maIATA})
                                    </option>
                                ))}
                            </select>
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
                            {currentRoute ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TuyenBayModal;
