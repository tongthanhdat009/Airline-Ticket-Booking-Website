import React from 'react';

/**
 * CardView - Responsive grid wrapper component for card view layouts
 *
 * Provides a responsive grid that adapts from 1 column on mobile to 4 columns on large screens.
 * Handles empty states and supports custom card rendering.
 *
 * @param {Array} items - Array of data items to render as cards
 * @param {Function} renderCard - Function that renders a single card, receives (item, index)
 * @param {string} className - Additional CSS classes for the grid container
 * @param {ReactNode} emptyState - Custom empty state component (optional)
 * @param {string} emptyMessage - Message to display when items array is empty
 */
const CardView = React.memo(({
    items = [],
    renderCard,
    className = '',
    emptyState = null,
    emptyMessage = 'Không có dữ liệu'
}) => {
    // Handle empty state
    if (!items || items.length === 0) {
        if (emptyState) {
            return emptyState;
        }

        return (
            <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-24 h-24 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                    </svg>
                </div>
                <p className="text-gray-500 text-center text-lg">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
            {items.map((item, index) => (
                <div key={item.id || index} className="w-full">
                    {renderCard(item, index)}
                </div>
            ))}
        </div>
    );
});

CardView.displayName = 'CardView';

export default CardView;
