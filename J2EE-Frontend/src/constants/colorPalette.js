// JadT Airline Color System
// Primary brand colors for the application
export const COLORS = {
    // Primary colors - JadT Airline Blue theme
    primary: {
        50: '#E3F2FD',   // Light backgrounds
        100: '#BBDEFB',  // Subtle highlights
        200: '#90CAF9',  // Hover states
        300: '#64B5F6',  // Secondary / Disabled states
        400: '#42A5F5',  // Active states
        500: '#2196F3',  // Links, secondary actions
        600: '#1E88E5',  // Primary buttons, main actions
        700: '#1565C0',  // Primary hover states
        800: '#0D47A1',  // Pressed states
        900: '#0A3D91',  // Dark backgrounds
        950: '#062B6E',  // Deepest backgrounds
    },

    // Secondary colors - Indigo theme
    secondary: {
        50: '#eef2ff',   // indigo-50 - Light backgrounds
        100: '#e0e7ff',  // indigo-100 - Subtle highlights
        200: '#c7d2fe',  // indigo-200 - Hover states
        300: '#a5b4fc',  // indigo-300 - Active states
        400: '#818cf8',  // indigo-400 - Links
        500: '#6366f1',  // indigo-500 - Secondary actions
        600: '#4f46e5',  // indigo-600 - Secondary buttons
        700: '#4338ca',  // indigo-700 - Secondary hover
        800: '#3730a3',  // indigo-800 - Pressed states
        900: '#312e81',  // indigo-900 - Dark backgrounds
        950: '#1e1b4b',  // indigo-950 - Deepest backgrounds
    },

    // Success colors - Green theme
    success: {
        50: '#f0fdf4',   // green-50 - Success backgrounds
        100: '#dcfce7',  // green-100 - Subtle success highlights
        200: '#bbf7d0',  // green-200 - Success hover
        300: '#86efac',  // green-300 - Success active
        400: '#4ade80',  // green-400 - Success elements
        500: '#22c55e',  // green-500 - Success buttons
        600: '#16a34a',  // green-600 - Success primary
        700: '#15803d',  // green-700 - Success hover
        800: '#166534',  // green-800 - Success pressed
        900: '#14532d',  // green-900 - Success dark
        950: '#052e16',  // green-950 - Success darkest
    },

    // Warning colors - Yellow theme
    warning: {
        50: '#fefce8',   // yellow-50 - Warning backgrounds
        100: '#fef9c3',  // yellow-100 - Warning highlights
        200: '#fef08a',  // yellow-200 - Warning hover
        300: '#fde047',  // yellow-300 - Warning active
        400: '#facc15',  // yellow-400 - Warning elements
        500: '#eab308',  // yellow-500 - Warning buttons
        600: '#ca8a04',  // yellow-600 - Warning primary
        700: '#a16207',  // yellow-700 - Warning hover
        800: '#854d0e',  // yellow-800 - Warning pressed
        900: '#713f12',  // yellow-900 - Warning dark
        950: '#422006',  // yellow-950 - Warning darkest
    },

    // Error colors - Red theme
    error: {
        50: '#fef2f2',   // red-50 - Error backgrounds
        100: '#fee2e2',  // red-100 - Error highlights
        200: '#fecaca',  // red-200 - Error hover
        300: '#fca5a5',  // red-300 - Error active
        400: '#f87171',  // red-400 - Error elements
        500: '#ef4444',  // red-500 - Error buttons
        600: '#dc2626',  // red-600 - Error primary
        700: '#b91c1c',  // red-700 - Error hover
        800: '#991b1b',  // red-800 - Error pressed
        900: '#7f1d1d',  // red-900 - Error dark
        950: '#450a0a',  // red-950 - Error darkest
    },

    // Info colors - Sky theme
    info: {
        50: '#f0f9ff',   // sky-50 - Info backgrounds
        100: '#e0f2fe',  // sky-100 - Info highlights
        200: '#bae6fd',  // sky-200 - Info hover
        300: '#7dd3fc',  // sky-300 - Info active
        400: '#38bdf8',  // sky-400 - Info elements
        500: '#0ea5e9',  // sky-500 - Info buttons
        600: '#0284c7',  // sky-600 - Info primary
        700: '#0369a1',  // sky-700 - Info hover
        800: '#075985',  // sky-800 - Info pressed
        900: '#0c4a6e',  // sky-900 - Info dark
        950: '#082f49',  // sky-950 - Info darkest
    },

    // Neutral colors - Gray theme
    neutral: {
        50: '#f9fafb',   // gray-50 - Light backgrounds
        100: '#f3f4f6',  // gray-100 - Subtle backgrounds
        200: '#e5e7eb',  // gray-200 - Borders, dividers
        300: '#d1d5db',  // gray-300 - Disabled borders
        400: '#9ca3af',  // gray-400 - Placeholders
        500: '#6b7280',  // gray-500 - Secondary text
        600: '#4b5563',  // gray-600 - Body text
        700: '#374151',  // gray-700 - Headings
        800: '#1f2937',  // gray-800 - Dark headings
        900: '#111827',  // gray-900 - Darkest text
        950: '#030712',  // gray-950 - Pure black backgrounds
    }
};

// Tailwind CSS class mappings for common patterns
export const TAILWIND_COLORS = {
    // Primary colors
    primary: {
        bg: 'bg-blue-600',
        bgHover: 'hover:bg-blue-700',
        bgLight: 'bg-blue-50',
        text: 'text-blue-600',
        textHover: 'hover:text-blue-700',
        textLight: 'text-blue-100',
        border: 'border-blue-600',
        borderLight: 'border-blue-200',
        ring: 'ring-blue-600',
        ringLight: 'ring-blue-100',
        gradient: 'bg-gradient-to-r from-blue-600 to-blue-700',
        gradientLight: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    },

    // Secondary colors
    secondary: {
        bg: 'bg-indigo-600',
        bgHover: 'hover:bg-indigo-700',
        bgLight: 'bg-indigo-50',
        text: 'text-indigo-600',
        textHover: 'hover:text-indigo-700',
        border: 'border-indigo-600',
        borderLight: 'border-indigo-200',
        ring: 'ring-indigo-600',
        ringLight: 'ring-indigo-100',
        gradient: 'bg-gradient-to-r from-indigo-600 to-indigo-700',
    },

    // Success colors
    success: {
        bg: 'bg-green-600',
        bgHover: 'hover:bg-green-700',
        bgLight: 'bg-green-50',
        text: 'text-green-600',
        textHover: 'hover:text-green-700',
        border: 'border-green-600',
        borderLight: 'border-green-200',
        ring: 'ring-green-600',
        ringLight: 'ring-green-100',
        badge: 'bg-green-100 text-green-700',
    },

    // Warning colors
    warning: {
        bg: 'bg-yellow-500',
        bgHover: 'hover:bg-yellow-600',
        bgLight: 'bg-yellow-50',
        text: 'text-yellow-600',
        textHover: 'hover:text-yellow-700',
        border: 'border-yellow-500',
        borderLight: 'border-yellow-200',
        ring: 'ring-yellow-500',
        ringLight: 'ring-yellow-100',
        badge: 'bg-yellow-100 text-yellow-700',
    },

    // Error colors
    error: {
        bg: 'bg-red-600',
        bgHover: 'hover:bg-red-700',
        bgLight: 'bg-red-50',
        text: 'text-red-600',
        textHover: 'hover:text-red-700',
        border: 'border-red-600',
        borderLight: 'border-red-200',
        ring: 'ring-red-600',
        ringLight: 'ring-red-100',
        badge: 'bg-red-100 text-red-700',
    },

    // Info colors
    info: {
        bg: 'bg-sky-600',
        bgHover: 'hover:bg-sky-700',
        bgLight: 'bg-sky-50',
        text: 'text-sky-600',
        textHover: 'hover:text-sky-700',
        border: 'border-sky-600',
        borderLight: 'border-sky-200',
        ring: 'ring-sky-600',
        ringLight: 'ring-sky-100',
        badge: 'bg-blue-100 text-blue-700',
    },

    // Neutral colors
    neutral: {
        bg: 'bg-gray-600',
        bgHover: 'hover:bg-gray-700',
        bgLight: 'bg-gray-50',
        bgLighter: 'bg-gray-100',
        text: 'text-gray-600',
        textHover: 'hover:text-gray-700',
        textLight: 'text-gray-400',
        textDark: 'text-gray-800',
        textDarker: 'text-gray-900',
        border: 'border-gray-300',
        borderLight: 'border-gray-200',
        ring: 'ring-gray-400',
    }
};

// Common gradient definitions
export const GRADIENTS = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700',
    primaryLight: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    secondary: 'bg-gradient-to-r from-indigo-600 to-indigo-700',
    secondaryLight: 'bg-gradient-to-br from-indigo-50 to-purple-50',
    success: 'bg-gradient-to-r from-green-600 to-green-700',
    successLight: 'bg-gradient-to-br from-green-50 to-emerald-50',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    warningLight: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    error: 'bg-gradient-to-r from-red-600 to-red-700',
    errorLight: 'bg-gradient-to-br from-red-50 to-pink-50',
    info: 'bg-gradient-to-r from-sky-600 to-blue-600',
    infoLight: 'bg-gradient-to-br from-sky-50 to-blue-50',
};

// Status badge color mappings for common entity states
export const STATUS_COLORS = {
    // Active/Enabled states
    active: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        dot: 'bg-green-500',
    },

    // Inactive/Disabled states
    inactive: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        dot: 'bg-gray-500',
    },

    // Pending states
    pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        dot: 'bg-yellow-500',
    },

    // Processing states
    processing: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
    },

    // Completed/Done states
    completed: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        dot: 'bg-green-500',
    },

    // Cancelled states
    cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-red-500',
    },

    // Failed/Error states
    failed: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-red-500',
    },

    // Draft states
    draft: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        dot: 'bg-gray-500',
    },

    // Published states
    published: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
    },

    // Default fallback
    default: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        dot: 'bg-gray-500',
    }
};

// Shadcn/UI style theme configuration
export const SHADCN_THEME = {
    borderRadius: '0.5rem',
    primary: COLORS.primary[600],
    secondary: COLORS.secondary[600],
    destructive: COLORS.error[600],
    muted: COLORS.neutral[100],
    mutedForeground: COLORS.neutral[500],
    accent: COLORS.primary[100],
    accentForeground: COLORS.primary[700],
    card: '#ffffff',
    'card-foreground': COLORS.neutral[900],
    popover: '#ffffff',
    'popover-foreground': COLORS.neutral[900],
    border: COLORS.neutral[200],
    input: COLORS.neutral[200],
    ring: COLORS.primary[600],
    background: COLORS.neutral[50],
    foreground: COLORS.neutral[900],
};

// Button variants
export const BUTTON_VARIANTS = {
    primary: `${TAILWIND_COLORS.primary.bg} ${TAILWIND_COLORS.primary.bgHover} ${TAILWIND_COLORS.primary.text}`,
    secondary: `${TAILWIND_COLORS.secondary.bg} ${TAILWIND_COLORS.secondary.bgHover} ${TAILWIND_COLORS.secondary.text}`,
    success: `${TAILWIND_COLORS.success.bg} ${TAILWIND_COLORS.success.bgHover} ${TAILWIND_COLORS.success.text}`,
    danger: `${TAILWIND_COLORS.error.bg} ${TAILWIND_COLORS.error.bgHover} ${TAILWIND_COLORS.error.text}`,
    outline: `${TAILWIND_COLORS.neutral.borderLight} ${TAILWIND_COLORS.neutral.textDark} hover:${TAILWIND_COLORS.neutral.bgLighter}`,
    ghost: `${TAILWIND_COLORS.neutral.text} hover:${TAILWIND_COLORS.neutral.bgLight}`,
    link: `${TAILWIND_COLORS.primary.text} hover:${TAILWIND_COLORS.primary.textHover}`,
};

// Badge variants
export const BADGE_VARIANTS = {
    active: STATUS_COLORS.active,
    inactive: STATUS_COLORS.inactive,
    pending: STATUS_COLORS.pending,
    processing: STATUS_COLORS.processing,
    completed: STATUS_COLORS.completed,
    cancelled: STATUS_COLORS.cancelled,
    failed: STATUS_COLORS.failed,
    draft: STATUS_COLORS.draft,
    published: STATUS_COLORS.published,
    success: TAILWIND_COLORS.success.badge,
    warning: TAILWIND_COLORS.warning.badge,
    error: TAILWIND_COLORS.error.badge,
    info: TAILWIND_COLORS.info.badge,
    default: TAILWIND_COLORS.neutral.bgLighter + ' ' + TAILWIND_COLORS.neutral.textDark,
};
