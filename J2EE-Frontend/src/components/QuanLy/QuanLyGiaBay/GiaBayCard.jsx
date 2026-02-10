import React, { memo } from 'react';
import { FaEye, FaPlane, FaMoneyBillWave, FaTicketAlt, FaArrowRight } from 'react-icons/fa';
import PropTypes from 'prop-types';

/**
 * GiaBayCard - Card component for displaying flight pricing information
 *
 * Displays key pricing details for a route in a responsive card format with action buttons.
 * Used in the card view of QuanLyGiaBay page.
 */
const GiaBayCard = memo(({
  data,
  onView
}) => {
  if (!data) {
    return null;
  }

  const {
    maTuyenBay,
    tuyenBay,
    prices,
    count,
    avgPrice
  } = data;

  // Get unique ticket classes
  const uniqueTicketClasses = prices && Array.isArray(prices)
    ? Array.from(new Set(prices.map(p => p.hangVe?.tenHangVe).filter(Boolean)))
    : [];

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Plane icon */}
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FaPlane className="text-blue-600" size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate text-sm">
              {tuyenBay?.sanBayDi?.tenSanBay || 'N/A'} → {tuyenBay?.sanBayDen?.tenSanBay || 'N/A'}
            </h3>
            <p className="text-xs text-blue-600 font-medium">
              {tuyenBay?.sanBayDi?.maIATA || 'N/A'} - {tuyenBay?.sanBayDen?.maIATA || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700">
            #{maTuyenBay}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="space-y-2 text-sm">
        {/* Route Details */}
        <div className="flex items-center gap-2 text-gray-600">
          <FaPlane className="text-gray-400 flex-shrink-0" size={12} />
          <span className="text-xs truncate">
            {tuyenBay?.sanBayDi?.thanhPhoSanBay || ''} {tuyenBay?.sanBayDi?.quocGiaSanBay ? `(${tuyenBay.sanBayDi.quocGiaSanBay})` : ''}
          </span>
        </div>

        <div className="flex items-center justify-center">
          <FaArrowRight className="text-blue-400" size={10} />
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <FaPlane className="text-gray-400 flex-shrink-0" size={12} />
          <span className="text-xs truncate">
            {tuyenBay?.sanBayDen?.thanhPhoSanBay || ''} {tuyenBay?.sanBayDen?.quocGiaSanBay ? `(${tuyenBay.sanBayDen.quocGiaSanBay})` : ''}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-2"></div>

        {/* Ticket Classes Count */}
        <div className="flex items-center gap-2 text-gray-600">
          <FaTicketAlt className="text-blue-400 flex-shrink-0" size={12} />
          <span className="text-xs">
            <span className="font-semibold text-blue-600">{uniqueTicketClasses.length}</span> hạng vé
          </span>
        </div>

        {/* Ticket Classes List */}
        {uniqueTicketClasses.length > 0 && (
          <div className="flex flex-wrap gap-1 pl-5">
            {uniqueTicketClasses.slice(0, 3).map((className, index) => (
              <span
                key={index}
                className="inline-block px-2 py-0.5 rounded text-xs bg-indigo-50 text-indigo-700"
              >
                {className}
              </span>
            ))}
            {uniqueTicketClasses.length > 3 && (
              <span className="inline-block px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                +{uniqueTicketClasses.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price Count */}
        <div className="flex items-center gap-2 text-gray-600">
          <FaMoneyBillWave className="text-green-400 flex-shrink-0" size={12} />
          <span className="text-xs">
            <span className="font-semibold text-green-600">{count || 0}</span> mức giá
          </span>
        </div>

        {/* Average Price */}
        {avgPrice && !isNaN(avgPrice) && (
          <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2 border border-green-100">
            <span className="text-xs text-gray-600 font-medium">Giá trung bình</span>
            <span className="text-sm font-bold text-green-600">
              {formatCurrency(avgPrice)}
            </span>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => onView?.(data)}
          className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5"
          title="Xem chi tiết giá"
        >
          <FaEye size={14} />
          <span className="hidden sm:inline">Xem chi tiết</span>
        </button>
      </div>
    </div>
  );
});

GiaBayCard.displayName = 'GiaBayCard';

GiaBayCard.propTypes = {
  /**
   * Route pricing data object
   */
  data: PropTypes.shape({
    maTuyenBay: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tuyenBay: PropTypes.shape({
      sanBayDi: PropTypes.shape({
        tenSanBay: PropTypes.string,
        maIATA: PropTypes.string,
        thanhPhoSanBay: PropTypes.string,
        quocGiaSanBay: PropTypes.string,
      }),
      sanBayDen: PropTypes.shape({
        tenSanBay: PropTypes.string,
        maIATA: PropTypes.string,
        thanhPhoSanBay: PropTypes.string,
        quocGiaSanBay: PropTypes.string,
      }),
    }),
    prices: PropTypes.arrayOf(
      PropTypes.shape({
        hangVe: PropTypes.shape({
          tenHangVe: PropTypes.string,
        }),
      })
    ),
    count: PropTypes.number,
    avgPrice: PropTypes.number,
  }),
  /**
   * Callback when view button is clicked
   */
  onView: PropTypes.func,
};

GiaBayCard.defaultProps = {
  data: null,
  onView: undefined,
};

export default GiaBayCard;
