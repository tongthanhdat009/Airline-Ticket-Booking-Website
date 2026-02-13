import { useState, useEffect } from 'react';
import { FaUserShield, FaTimes } from 'react-icons/fa';
import { FaUserShield as FaUserShieldIcon } from 'react-icons/fa6';

const RoleAssignmentModal = ({ account, roles = [], onClose, onSave }) => {
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (account && account.vaiTro) {
            setSelectedRoles(account.vaiTro || []);
        } else {
            setSelectedRoles([]);
        }
    }, [account]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedRoles.length === 0) {
            setErrorMessage('Vui lòng chọn ít nhất một vai trò!');
            return;
        }

        try {
            await onSave(selectedRoles);
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Lỗi không xác định';
            setErrorMessage(message);
        }
    };

    const handleRoleToggle = (maVaiTro) => {
        setSelectedRoles(prev => {
            const newRoles = prev.includes(maVaiTro)
                ? prev.filter(id => id !== maVaiTro)
                : [...prev, maVaiTro];
            return newRoles;
        });
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 p-4 overflow-y-auto">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto relative">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl sticky top-0 z-10">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">
                            Gán vai trò cho {account?.hoVaTen || account?.tenDangNhap}
                        </h2>
                        <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                            <FaTimes size={24} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Chọn vai trò <span className="text-red-500">*</span>
                            </label>
                            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-48 overflow-y-auto">
                                {roles.length === 0 ? (
                                    <p className="text-center text-gray-500 py-4">Đang tải danh sách vai trò...</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {roles.map(role => (
                                            <label
                                                key={role.maVaiTro}
                                                className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRoles.includes(role.maVaiTro)}
                                                    onChange={() => handleRoleToggle(role.maVaiTro)}
                                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <FaUserShieldIcon className="text-blue-600" />
                                                    <span className="font-medium text-gray-700">{role.tenVaiTro}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        {errorMessage && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
                            </div>
                        )}
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
                            Lưu vai trò
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoleAssignmentModal;
