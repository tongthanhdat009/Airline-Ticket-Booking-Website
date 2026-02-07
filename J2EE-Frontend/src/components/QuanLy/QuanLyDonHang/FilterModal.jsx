import React from 'react';

const FilterModal = ({
  isVisible,
  filters,
  onFilterChange,
  onApply,
  onClear,
  onClose
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-cyan-700 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Bộ lọc đơn hàng</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* Trạng thái */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={filters.trangThai}
                onChange={(e) => onFilterChange({ ...filters, trangThai: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả</option>
                <option value="CHỜ THANH TOÁN">Chờ thanh toán</option>
                <option value="ĐÃ THANH TOÁN">Đã thanh toán</option>
                <option value="ĐÃ HỦY">Đã hủy</option>
              </select>
            </div>

            {/* Bộ lọc ngày */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Từ ngày
                </label>
                <input
                  type="datetime-local"
                  value={filters.tuNgay}
                  onChange={(e) => onFilterChange({ ...filters, tuNgay: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Đến ngày
                </label>
                <input
                  type="datetime-local"
                  value={filters.denNgay}
                  onChange={(e) => onFilterChange({ ...filters, denNgay: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Bộ lọc giá */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Từ giá (VND)
                </label>
                <input
                  type="number"
                  value={filters.tuGia}
                  onChange={(e) => onFilterChange({ ...filters, tuGia: e.target.value })}
                  placeholder="VD: 1000000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Đến giá (VND)
                </label>
                <input
                  type="number"
                  value={filters.denGia}
                  onChange={(e) => onFilterChange({ ...filters, denGia: e.target.value })}
                  placeholder="VD: 10000000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClear}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              Xóa bộ lọc
            </button>
            <button
              onClick={onApply}
              className="px-6 py-3 bg-linear-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 font-semibold transition-all shadow-lg"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
