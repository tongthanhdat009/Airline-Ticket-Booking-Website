import React from 'react';

/**
 * ResponsiveTable - Wrapper component for responsive tables with horizontal scroll
 *
 * Provides a responsive table wrapper that enables horizontal scrolling on mobile devices
 * while maintaining the full table width. Supports sticky headers for better UX when scrolling.
 *
 * @param {ReactNode} children - The table element to wrap (required)
 * @param {string} className - Additional CSS classes for the wrapper container
 * @param {boolean} stickyHeader - Enable sticky header behavior (default: true)
 * @param {string} emptyMessage - Message to display when children is null/undefined
 * @param {ReactNode} emptyState - Custom empty state component (overrides emptyMessage)
 */
const ResponsiveTable = React.memo(({
    children,
    className = '',
    stickyHeader = true,
    emptyMessage = 'Không có dữ liệu',
    emptyState = null
}) => {
    // Handle empty state
    if (!children) {
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
                            d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                    </svg>
                </div>
                <p className="text-gray-500 text-center text-lg">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={`overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
            <div className="overflow-x-auto">
                {React.Children.map(children, (child) => {
                    // Add sticky header to thead if enabled and child is a table
                    if (stickyHeader && React.isValidElement(child) && child.type === 'table') {
                        return React.cloneElement(child, {
                            className: `w-full text-sm ${child.props.className || ''}`,
                            children: React.Children.map(child.props.children, (theadChild) => {
                                if (React.isValidElement(theadChild) && theadChild.type === 'thead') {
                                    return React.cloneElement(theadChild, {
                                        className: `${theadChild.props.className || ''} sticky top-0 z-10`,
                                        children: theadChild.props.children
                                    });
                                }
                                return theadChild;
                            })
                        });
                    }
                    return child;
                })}
            </div>
        </div>
    );
});

ResponsiveTable.displayName = 'ResponsiveTable';

export default ResponsiveTable;
