import React, { useState } from 'react';
import { FaPlus, FaTrash, FaTimes, FaCog } from 'react-icons/fa';
import { AIRCRAFT_TEMPLATES } from '../../../../constants/aircraftConfig';

const AutoGenerateModal = ({
 cabinConfigs,
 setCabinConfigs,
 hangVeList,
 onGenerate,
 onClose,
 currentMaxRow = 0 // Số hàng hiện có trên máy bay
}) => {
 const [showCustomMode, setShowCustomMode] = useState(false);
 const [columnInputs, setColumnInputs] = useState({}); // Store raw input values

 // Auto-calculate startRow and endRow based on previous cabins and numberOfRows
 const calculateRowRanges = (configs) => {
 let currentRow = currentMaxRow + 1; // Bắt đầu từ hàng tiếp theo sau hàng lớn nhất hiện có
 return configs.map(config => {
 const startRow = currentRow;
 const numberOfRows = config.numberOfRows || 10;
 const endRow = startRow + numberOfRows - 1;
 currentRow = endRow + 1;
 return {
 ...config,
 startRow,
 endRow
 };
 });
 };

 // Calculate all row ranges once for display
 const calculatedConfigs = calculateRowRanges(cabinConfigs);

 // Handle generate with calculated configs
 const handleGenerate = () => {
 onGenerate(calculatedConfigs);
 };

 // Preset layouts for quick configuration
 const PRESET_LAYOUTS = [
 { name: '3-3 (Narrow Body)', columnsLeft: ['A', 'B', 'C'], columnsMiddle: [], columnsRight: ['D', 'E', 'F'], total: 6 },
 { name: '3-4-3 (Wide Body)', columnsLeft: ['A', 'B', 'C'], columnsMiddle: ['D', 'E', 'F', 'G'], columnsRight: ['H', 'J', 'K'], total: 10 },
 { name: '2-4-2 (Wide Body)', columnsLeft: ['A', 'B'], columnsMiddle: ['C', 'D', 'E', 'F'], columnsRight: ['G', 'H'], total: 8 },
 { name: '2-5-2 (A380)', columnsLeft: ['A', 'B'], columnsMiddle: ['C', 'D', 'E', 'F', 'G'], columnsRight: ['H', 'J'], total: 9 },
 { name: '3-3-3 (B777)', columnsLeft: ['A', 'B', 'C'], columnsMiddle: ['D', 'E', 'F'], columnsRight: ['G', 'H', 'J'], total: 9 },
 { name: '2-2 (Regional)', columnsLeft: ['A', 'B'], columnsMiddle: [], columnsRight: ['C', 'D'], total: 4 }
 ];

 const addCabinConfig = () => {
 const newId = Math.max(...cabinConfigs.map(c => c.id), 0) + 1;
 setCabinConfigs([...cabinConfigs, {
 id: newId,
 cabinName: 'Economy Class',
 maHangVe: '',
 numberOfRows: 10,
 columnsLeft: ['A', 'B', 'C'],
 columnsMiddle: [],
 columnsRight: ['D', 'E', 'F'],
 exitRows: [],
 backgroundColor: '#FAFAFA'
 }]);
 };

 const removeCabinConfig = (id) => {
 setCabinConfigs(cabinConfigs.filter(c => c.id !== id));
 };

 const updateCabinConfig = (id, field, value) => {
 setCabinConfigs(cabinConfigs.map(c =>
 c.id === id ? { ...c, [field]: value } : c
 ));
 };

 // Update raw input value immediately for smooth typing
 const handleColumnInputChange = (id, side, value) => {
 setColumnInputs(prev => ({
 ...prev,
 [`${id}-${side}`]: value
 }));
 };

 // Process and update cabin config when input loses focus
 const handleColumnInputBlur = (id, side, value) => {
 if (!value || value.trim() === '') {
 setCabinConfigs(cabinConfigs.map(c =>
 c.id === id ? { ...c, [side]: [] } : c
 ));
 return;
 }

 const columns = value
 .split(',')
 .map(col => col.trim().toUpperCase())
 .filter(col => col && col.match(/^[A-Z]+$/));

 setCabinConfigs(cabinConfigs.map(c =>
 c.id === id ? { ...c, [side]: columns } : c
 ));

 // Update the input with processed value
 setColumnInputs(prev => ({
 ...prev,
 [`${id}-${side}`]: columns.join(', ')
 }));
 };

 // Get the display value for column input
 const getColumnInputValue = (id, side, configValue) => {
 const key = `${id}-${side}`;
 return columnInputs[key] !== undefined
 ? columnInputs[key]
 : configValue?.join(', ') || '';
 };

 const applyTemplate = (templateKey) => {
 const template = AIRCRAFT_TEMPLATES[templateKey];
 if (!template) return;

 const newConfigs = template.cabins.map((cabin, index) => ({
 id: index + 1,
 cabinName: cabin.name,
 maHangVe: '',
 numberOfRows: cabin.endRow - cabin.startRow + 1,
 columnsLeft: cabin.columnsLeft,
 columnsRight: cabin.columnsRight,
 columnsMiddle: cabin.columnsMiddle || [],
 exitRows: [],
 backgroundColor: cabin.backgroundColor
 }));

 setCabinConfigs(newConfigs);
 };

 // Apply preset layout to a cabin configuration
 const applyPresetLayout = (configId, preset) => {
 const updatedConfigs = cabinConfigs.map(config => {
 if (config.id === configId) {
 return {
 ...config,
 columnsLeft: preset.columnsLeft,
 columnsMiddle: preset.columnsMiddle,
 columnsRight: preset.columnsRight
 };
 }
 return config;
 });
 setCabinConfigs(updatedConfigs);
 
 // Update column inputs state
 setColumnInputs(prev => ({
 ...prev,
 [configId]: {
 columnsLeft: preset.columnsLeft.join(', '),
 columnsMiddle: preset.columnsMiddle.join(', '),
 columnsRight: preset.columnsRight.join(', ')
 }
 }));
 };

 const switchToCustomMode = () => {
 setShowCustomMode(true);
 // Initialize with a 3-3-3 wide-body config (Boeing 777 style)
 setCabinConfigs([{
 id: 1,
 cabinName: 'Cabin Tùy Chỉnh',
 maHangVe: '',
 numberOfRows: 10,
 columnsLeft: ['A', 'B', 'C'],
 columnsMiddle: ['D', 'E', 'F'],
 columnsRight: ['G', 'H', 'K'],
 exitRows: [],
 backgroundColor: '#FAFAFA'
 }]);
 
 // Initialize column inputs
 setColumnInputs({
 1: {
 columnsLeft: 'A, B, C',
 columnsMiddle: 'D, E, F',
 columnsRight: 'G, H, K'
 }
 });
 };

 return (
 <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 p-4">
 <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
 <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
 <div className="bg-purple-600 text-white p-6 rounded-t-xl sticky top-0">
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
 {/* Mode Selector */}
 <div className="flex gap-2 mb-4">
 <button
 onClick={() => setShowCustomMode(false)}
 className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
 !showCustomMode
 ? 'bg-blue-600 text-white shadow-md'
 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
 }`}
 >
 📋 Mẫu có sẵn
 </button>
 <button
 onClick={switchToCustomMode}
 className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
 showCustomMode
 ? 'bg-blue-600 text-white shadow-md'
 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
 }`}
 >
 <FaCog />
 Tùy biến
 </button>
 </div>

 {/* Template quick select - Only show in template mode */}
 {!showCustomMode && (
 <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
 <p className="font-bold text-gray-700 mb-2">Mẫu máy bay có sẵn:</p>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
 {Object.keys(AIRCRAFT_TEMPLATES).map(key => (
 <button
 key={key}
 onClick={() => applyTemplate(key)}
 className="px-4 py-2 bg-white border border-blue-300 rounded-lg hover:bg-blue-100 text-sm font-medium"
 >
 {AIRCRAFT_TEMPLATES[key].name}
 </button>
 ))}
 </div>
 </div>
 )}

 {/* Custom mode instructions */}
 {showCustomMode && (
 <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
 <p className="font-bold text-blue-900 mb-2">💡 Hướng dẫn tùy biến:</p>
 <ul className="text-sm text-blue-800 space-y-1">
 <li>• Nhập số lượng hàng cho mỗi cabin (hệ thống tự động tính hàng bắt đầu/kết thúc)</li>
 <li>• Các cabin sẽ được sắp xếp liên tiếp không bị chồng lấn</li>
 <li>• Nhập các cột phân cách bằng dấu phẩy (ví dụ: A, B, C hoặc A,B,C)</li>
 <li>• Cột trái và cột phải sẽ tạo lối đi ở giữa</li>
 <li>• Chọn hạng vé tương ứng cho mỗi cabin</li>
 </ul>
 </div>
 )}

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

 <div>
 <label className="block text-xs font-bold text-gray-600 mb-1">Số lượng hàng</label>
 <input
 type="number"
 value={config.numberOfRows || 10}
 onChange={(e) => updateCabinConfig(config.id, 'numberOfRows', parseInt(e.target.value) || 1)}
 className="w-full px-3 py-2 border rounded-lg text-sm"
 min="1"
 />
 </div>

 <div className="col-span-2 md:col-span-3">
 <div className="bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-200">
 <span className="text-xs font-bold text-indigo-700">
 📍 Hàng: {calculatedConfigs.find(c => c.id === config.id)?.startRow ?? 1} - {calculatedConfigs.find(c => c.id === config.id)?.endRow ?? 10}
 </span>
 </div>
 </div>
 </div>

 {/* Custom column configuration - Only show in custom mode */}
 {showCustomMode && (
 <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
 {/* Preset layout selector */}
 <div>
 <label className="block text-xs font-bold text-gray-600 mb-2">
 🎯 Mẫu cấu hình nhanh:
 </label>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
 {PRESET_LAYOUTS.map((preset, idx) => (
 <button
 key={idx}
 type="button"
 onClick={() => applyPresetLayout(config.id, preset)}
 className="px-3 py-2 text-xs bg-white border-2 border-indigo-200 rounded-lg hover:border-purple-400 hover:bg-indigo-50 transition-all text-left"
 >
 <div className="font-bold text-purple-700">{preset.name}</div>
 <div className="text-gray-500 mt-0.5">Tổng: {preset.total} cột</div>
 </button>
 ))}
 </div>
 </div>

 {/* Manual column configuration */}
 <div>
 <p className="text-xs font-bold text-gray-600 mb-2">✏️ Hoặc tùy chỉnh thủ công:</p>
 <div className="grid grid-cols-3 gap-3">
 <div>
 <label className="block text-xs font-medium text-gray-600 mb-1">
 Cột trái
 <span className="text-gray-400 ml-1">(A,B,C)</span>
 </label>
 <input
 type="text"
 value={getColumnInputValue(config.id, 'columnsLeft', config.columnsLeft)}
 onChange={(e) => handleColumnInputChange(config.id, 'columnsLeft', e.target.value)}
 onBlur={(e) => handleColumnInputBlur(config.id, 'columnsLeft', e.target.value)}
 placeholder="A, B, C"
 className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-gray-600 mb-1">
 Cột giữa
 <span className="text-gray-400 ml-1">(D,E,F)</span>
 </label>
 <input
 type="text"
 value={getColumnInputValue(config.id, 'columnsMiddle', config.columnsMiddle)}
 onChange={(e) => handleColumnInputChange(config.id, 'columnsMiddle', e.target.value)}
 onBlur={(e) => handleColumnInputBlur(config.id, 'columnsMiddle', e.target.value)}
 placeholder="D, E, F (tùy chọn)"
 className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-gray-600 mb-1">
 Cột phải
 <span className="text-gray-400 ml-1">(G,H,K)</span>
 </label>
 <input
 type="text"
 value={getColumnInputValue(config.id, 'columnsRight', config.columnsRight)}
 onChange={(e) => handleColumnInputChange(config.id, 'columnsRight', e.target.value)}
 onBlur={(e) => handleColumnInputBlur(config.id, 'columnsRight', e.target.value)}
 placeholder="G, H, K"
 className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
 />
 </div>
 </div>
 </div>

 {/* Preview */}
 <div className="mt-2 space-y-2">
 <div className="flex items-center gap-2 text-xs text-gray-500 bg-indigo-50 p-2 rounded-lg">
 <span>📊 Preview:</span>
 <div className="flex items-center gap-1 flex-wrap">
 {config.columnsLeft?.map((col, idx) => (
 <span 
 key={`left-${idx}`} 
 className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono text-xs"
 title={idx === 0 ?"Cửa sổ" : idx === config.columnsLeft.length - 1 ?"Lối đi" :"Giữa"}
 >
 {col}
 </span>
 ))}
 {config.columnsMiddle && config.columnsMiddle.length > 0 ? (
 <>
 <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">🚶 Lối đi 1</span>
 {config.columnsMiddle?.map((col, idx) => (
 <span 
 key={`mid-${idx}`} 
 className="px-2 py-1 bg-green-100 text-green-700 rounded font-mono text-xs"
 title={idx === 0 || idx === config.columnsMiddle.length - 1 ?"Lối đi" :"Giữa"}
 >
 {col}
 </span>
 ))}
 <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">🚶 Lối đi 2</span>
 </>
 ) : (
 <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">🚶 Lối đi</span>
 )}
 {config.columnsRight?.map((col, idx) => (
 <span 
 key={`right-${idx}`} 
 className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono text-xs"
 title={idx === 0 ?"Lối đi" : idx === config.columnsRight.length - 1 ?"Cửa sổ" :"Giữa"}
 >
 {col}
 </span>
 ))}
 </div>
 </div>
 
 {/* Position legend */}
 <div className="flex items-center gap-3 text-xs bg-indigo-50 p-2 rounded-lg border border-indigo-200">
 <span className="font-semibold text-indigo-700">🎯 Vị trí ghế:</span>
 <div className="flex items-center gap-1">
 <span className="w-2 h-2 rounded-full bg-blue-500"></span>
 <span>Đầu/Cuối = Cửa sổ</span>
 </div>
 <div className="flex items-center gap-1">
 <span className="w-2 h-2 rounded-full bg-amber-500"></span>
 <span>Cạnh lối đi = Lối đi</span>
 </div>
 <div className="flex items-center gap-1">
 <span className="w-2 h-2 rounded-full bg-gray-400"></span>
 <span>Ở giữa = Giữa</span>
 </div>
 </div>
 </div>
 
 {/* Tips */}
 <div className="text-xs text-gray-500 bg-amber-50 p-2 rounded-lg border border-amber-200">
 <p className="font-semibold text-amber-700 mb-1">💡 Mẹo cấu hình:</p>
 <ul className="space-y-1">
 <li>• <strong>Máy bay nhỏ (2-2):</strong> Trái: A,B | Phải: C,D</li>
 <li>• <strong>Máy bay vừa (3-3):</strong> Trái: A,B,C | Phải: D,E,F</li>
 <li>• <strong>Máy bay lớn (3-3-3):</strong> Trái: A,B,C | Giữa: D,E,F | Phải: G,H,K</li>
 <li>• <strong>Máy bay rất lớn (3-4-3):</strong> Trái: A,B,C | Giữa: D,E,F,G | Phải: H,J,K</li>
 <li className="text-indigo-600 font-semibold">• Ghế đầu mỗi phần = CỬA SỔ, ghế cạnh lối đi = LỐI ĐI, ghế ở giữa = GIỮA</li>
 </ul>
 </div>
 </div>
 )}
 </div>
 ))}

 {/* Add cabin button - only show in custom mode */}
 {showCustomMode && (
 <button
 onClick={addCabinConfig}
 className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 font-medium flex items-center justify-center gap-2"
 >
 <FaPlus />
 Thêm cabin
 </button>
 )}
 </div>

 <div className="border-t border-gray-200 p-4 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
 <button
 onClick={onClose}
 className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
 >
 Hủy
 </button>
 <button
 onClick={handleGenerate}
 className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
 >
 Tạo {calculatedConfigs.reduce((sum, c) => {
 const totalCols = (c.columnsLeft?.length || 0) + (c.columnsMiddle?.length || 0) + (c.columnsRight?.length || 0);
 return sum + (c.endRow - c.startRow + 1) * totalCols;
 }, 0)} ghế
 </button>
 </div>
 </div>
 </div>
 );
};

export default AutoGenerateModal;
