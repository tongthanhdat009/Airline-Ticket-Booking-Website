import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { thongTinSanBay } from '../../../services/QLSanBayServices';

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
            /[àáảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữýỵỹđ]/i.test(keyword)
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
        } catch {
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
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Thành phố</label>
                            <input
                                type="text"
                                name="thanhPhoSanBay"
                                value={formData.thanhPhoSanBay}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
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

export default SanBayModal;
