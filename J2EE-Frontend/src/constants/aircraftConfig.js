// Aircraft layout templates
export const AIRCRAFT_TEMPLATES = {
    'A320': {
        name: 'Airbus A320 (Narrow-body)',
        layout: '3-3',
        cabins: [
            { 
                name: 'Business Class', 
                startRow: 1, 
                endRow: 4, 
                columnsLeft: ['A', 'B', 'C'], 
                columnsRight: ['D', 'E', 'F'], 
                backgroundColor: '#E3F2FD' 
            },
            { 
                name: 'Economy Class', 
                startRow: 5, 
                endRow: 30, 
                columnsLeft: ['A', 'B', 'C'], 
                columnsRight: ['D', 'E', 'F'], 
                backgroundColor: '#FAFAFA' 
            }
        ],
        exitRows: [1, 12, 13]
    },
    'B737': {
        name: 'Boeing 737 (Narrow-body)',
        layout: '3-3',
        cabins: [
            { 
                name: 'Business Class', 
                startRow: 1, 
                endRow: 3, 
                columnsLeft: ['A', 'B', 'C'], 
                columnsRight: ['D', 'E', 'F'], 
                backgroundColor: '#E3F2FD' 
            },
            { 
                name: 'Economy Class', 
                startRow: 4, 
                endRow: 33, 
                columnsLeft: ['A', 'B', 'C'], 
                columnsRight: ['D', 'E', 'F'], 
                backgroundColor: '#FAFAFA' 
            }
        ],
        exitRows: [1, 14, 15]
    },
    'B787': {
        name: 'Boeing 787 (Wide-body)',
        layout: '3-3-3',
        cabins: [
            { 
                name: 'Business Class', 
                startRow: 1, 
                endRow: 6, 
                columnsLeft: ['A', 'B', 'C'], 
                columnsMiddle: ['D', 'E', 'F'], 
                columnsRight: ['G', 'H', 'J'], 
                backgroundColor: '#E3F2FD' 
            },
            { 
                name: 'Premium Economy', 
                startRow: 7, 
                endRow: 12, 
                columnsLeft: ['A', 'B', 'C'], 
                columnsMiddle: ['D', 'E', 'F'], 
                columnsRight: ['G', 'H', 'J'], 
                backgroundColor: '#FFF9C4' 
            },
            { 
                name: 'Economy Class', 
                startRow: 13, 
                endRow: 40, 
                columnsLeft: ['A', 'B', 'C'], 
                columnsMiddle: ['D', 'E', 'F'], 
                columnsRight: ['G', 'H', 'J'], 
                backgroundColor: '#FAFAFA' 
            }
        ],
        exitRows: [1, 20, 21]
    },
    'A350': {
        name: 'Airbus A350 (Wide-body)',
        layout: '3-3-3',
        cabins: [
            { 
                name: 'Business Class', 
                startRow: 1, 
                endRow: 8, 
                columnsLeft: ['A', 'B', 'C'], 
                columnsMiddle: ['D', 'E', 'F'], 
                columnsRight: ['G', 'H', 'K'], 
                backgroundColor: '#E3F2FD' 
            },
            { 
                name: 'Premium Economy', 
                startRow: 9, 
                endRow: 15, 
                columnsLeft: ['A', 'B', 'C'], 
                columnsMiddle: ['D', 'E', 'F'], 
                columnsRight: ['G', 'H', 'K'], 
                backgroundColor: '#FFF9C4' 
            },
            { 
                name: 'Economy Class', 
                startRow: 16, 
                endRow: 45, 
                columnsLeft: ['A', 'B', 'C'], 
                columnsMiddle: ['D', 'E', 'F'], 
                columnsRight: ['G', 'H', 'K'], 
                backgroundColor: '#FAFAFA' 
            }
        ],
        exitRows: [1, 23, 24]
    }
};

// Cabin color mapping
export const CABIN_COLORS = {
    'Business Class': { 
        bg: 'bg-blue-50', 
        border: 'border-blue-200', 
        text: 'text-blue-800', 
        gradient: 'from-blue-500 to-indigo-600' 
    },
    'Premium Economy': { 
        bg: 'bg-yellow-50', 
        border: 'border-yellow-200', 
        text: 'text-yellow-800', 
        gradient: 'from-yellow-500 to-orange-500' 
    },
    'Economy Class': { 
        bg: 'bg-gray-50', 
        border: 'border-gray-200', 
        text: 'text-gray-800', 
        gradient: 'from-gray-500 to-gray-600' 
    },
    'default': { 
        bg: 'bg-gray-50', 
        border: 'border-gray-200', 
        text: 'text-gray-800', 
        gradient: 'from-gray-500 to-gray-600' 
    }
};

// Seat position types
export const SEAT_POSITIONS = {
    WINDOW: 'CỬA SỔ',
    AISLE: 'LỐI ĐI',
    MIDDLE: 'GIỮA'
};

// Common exit rows (can be overridden by aircraft template)
export const COMMON_EXIT_ROWS = [1, 12, 13, 20, 21, 23, 24];

// Default cabin config for auto-generate
export const DEFAULT_CABIN_CONFIG = {
    id: 1,
    cabinName: 'Business Class',
    maHangVe: '',
    startRow: 1,
    endRow: 4,
    columnsLeft: ['A', 'B', 'C'],
    columnsRight: ['D', 'E', 'F'],
    exitRows: [],
    backgroundColor: '#E3F2FD'
};
