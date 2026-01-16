import React from 'react';
import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa';
import { AIRCRAFT_TEMPLATES } from '../../../../constants/aircraftConfig';

const AutoGenerateModal = ({ 
    cabinConfigs, 
    setCabinConfigs, 
    hangVeList, 
    onGenerate, 
    onClose 
}) => {
    const addCabinConfig = () => {
        const newId = Math.max(...cabinConfigs.map(c => c.id), 0) + 1;
        setCabinConfigs([...cabinConfigs, {
            id: newId,
            cabinName: 'Economy Class',
            maHangVe: '',
            startRow: cabinConfigs[cabinConfigs.length - 1].endRow + 1,
            endRow: cabinConfigs[cabinConfigs.length - 1].endRow + 10,
            columnsLeft: ['A', 'B', 'C'],
            columnsRight: ['D', 'E', 'F'],
            exitRows: [],
            backgroundColor: '#FAFAFA'
        }]);
    };

    const removeCabinConfig = (id) => {
        if (cabinConfigs.length === 1) {
            alert('Phải có ít nhất 1 cabin');
            return;
        }
        setCabinConfigs(cabinConfigs.filter(c => c.id !== id));
    };

    const updateCabinConfig = (id, field, value) => {
        setCabinConfigs(cabinConfigs.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        ));
    };

    const applyTemplate = (templateKey) => {
        const template = AIRCRAFT_TEMPLATES[templateKey];
        if (!template) return;

        const newConfigs = template.cabins.map((cabin, index) => ({
            id: index + 1,
            cabinName: cabin.name,
            maHangVe: '',
            startRow: cabin.startRow,
            endRow: cabin.endRow,
            columnsLeft: cabin.columnsLeft,
            columnsRight: cabin.columnsRight,
            columnsMiddle: cabin.columnsMiddle || [],
            exitRows: template.exitRows.filter(row => row >= cabin.startRow && row <= cabin.endRow),
            backgroundColor: cabin.backgroundColor
        }));

        setCabinConfigs(newConfigs);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 rounded-t-xl sticky top-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-bold">Tự động tạo sơ đồ ghế</h3>
                            <p className="text-purple-100 text-sm mt-1">Cấu hình nhiều cabin cho máy bay</p>
                        </div>
                        <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
                            <FaTimes />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {/* Template quick select */}
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <p className="font-bold text-gray-700 mb-2">Mẫu máy bay có sẵn:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {Object.keys(AIRCRAFT_TEMPLATES).map(key => (
                                <button
                                    key={key}
                                    onClick={() => applyTemplate(key)}
                                    className="px-4 py-2 bg-white border border-purple-300 rounded-lg hover:bg-purple-100 text-sm font-medium"
                                >
                                    {AIRCRAFT_TEMPLATES[key].name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cabin configurations */}
                    {cabinConfigs.map((config, index) => (
                        <div key={config.id} className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-bold text-gray-800">Cabin {index + 1}: {config.cabinName}</h4>
                                {cabinConfigs.length > 1 && (
                                    <button
                                        onClick={() => removeCabinConfig(config.id)}
                                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Tên cabin</label>
                                    <input
                                        type="text"
                                        value={config.cabinName}
                                        onChange={(e) => updateCabinConfig(config.id, 'cabinName', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Hạng vé</label>
                                    <select
                                        value={config.maHangVe}
                                        onChange={(e) => updateCabinConfig(config.id, 'maHangVe', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                    >
                                        <option value="">Chọn hạng vé</option>
                                        {hangVeList.map(hv => (
                                            <option key={hv.maHangVe} value={hv.maHangVe}>{hv.tenHangVe}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Hàng bắt đầu</label>
                                        <input
                                            type="number"
                                            value={config.startRow}
                                            onChange={(e) => updateCabinConfig(config.id, 'startRow', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Hàng kết thúc</label>
                                        <input
                                            type="number"
                                            value={config.endRow}
                                            onChange={(e) => updateCabinConfig(config.id, 'endRow', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                            min={config.startRow}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addCabinConfig}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 font-medium flex items-center justify-center gap-2"
                    >
                        <FaPlus />
                        Thêm cabin
                    </button>
                </div>

                <div className="border-t border-gray-200 p-4 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onGenerate}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                    >
                        Tạo {cabinConfigs.reduce((sum, c) => sum + (c.endRow - c.startRow + 1) * 6, 0)} ghế
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AutoGenerateModal;
