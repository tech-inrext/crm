// ─── DetailItem styles ─────────────────────────────────────────────────────

export const detailItem = {
    row: "group flex items-start gap-3 p-3 rounded-lg bg-gray-50/50 hover:bg-blue-50/70 transition-all duration-200 border border-transparent hover:border-blue-100",
    iconWrap: "flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200",
    iconEl: "text-sm",
    body: "flex-1 min-w-0",
    label: "text-xs font-medium text-gray-500 uppercase tracking-wide mb-1",
    linkAnchor: "inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 group",
    linkArrow: "w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200",
    empty: "text-sm text-gray-400 font-medium",
    value: "text-sm text-gray-800 font-medium break-words",
} as const;

// ─── SectionCard color map ─────────────────────────────────────────────────

export type SectionColor = "text-blue-600" | "text-purple-600" | "text-orange-600" | "text-green-600";

export const sectionColorMap: Record<SectionColor, { bg: string; border: string; icon: string; text: string }> = {
    "text-blue-600": {
        bg: "from-blue-50 to-blue-100/50",
        border: "border-blue-200",
        icon: "from-blue-500 to-blue-600",
        text: "text-blue-700",
    },
    "text-purple-600": {
        bg: "from-purple-50 to-purple-100/50",
        border: "border-purple-200",
        icon: "from-purple-500 to-purple-600",
        text: "text-purple-700",
    },
    "text-orange-600": {
        bg: "from-orange-50 to-orange-100/50",
        border: "border-orange-200",
        icon: "from-orange-500 to-orange-600",
        text: "text-orange-700",
    },
    "text-green-600": {
        bg: "from-green-50 to-green-100/50",
        border: "border-green-200",
        icon: "from-green-500 to-green-600",
        text: "text-green-700",
    },
};

export const sectionCard = {
    wrapper: "bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden",
    headerIconWrap: (icon: string) => `w-8 h-8 rounded-lg bg-gradient-to-br ${icon} flex items-center justify-center text-white shadow-sm`,
    headerIcon: "text-sm",
    headerTitle: (text: string) => `font-semibold text-sm uppercase tracking-wide ${text}`,
    body: "p-5",
    bodyInner: "space-y-3",
} as const;

// ─── Dialog header styles ──────────────────────────────────────────────────

export const dialogHeader = {
    banner: "bg-gradient-to-r from-slate-800 to-blue-900 text-white relative overflow-hidden",
    overlay: "absolute inset-0 bg-white/5 opacity-20",
    inner: "relative z-10 flex items-center justify-between p-5",
    titleRow: "flex items-center gap-3",
    iconWrap: "w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center",
    title: "text-lg font-semibold",
    subtitle: "text-blue-200 text-sm opacity-90",
    closeBtn: "text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all duration-200",
} as const;

// ─── User header card styles ───────────────────────────────────────────────

export const userHeaderCard = {
    wrapper: "bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6",
    row: "flex flex-col sm:flex-row items-start sm:items-center gap-4",
    avatarWrap: "flex-shrink-0",
    avatar: "w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center text-xl font-bold shadow-lg",
    photo: "w-full h-full object-cover rounded-xl",
    info: "flex-1 min-w-0",
    name: "text-2xl font-bold text-gray-900 mb-2",
    designation: "text-sm text-gray-600 mb-2",
    metaRow: "flex flex-wrap gap-4 text-sm text-gray-600",
    metaItem: "flex items-center gap-1.5",
    metaIcon: "w-4 h-4 text-gray-400",
} as const;

// ─── Roles badge styles ────────────────────────────────────────────────────

export const rolesBadge = {
    wrapper: "p-3 rounded-lg bg-gray-50/50 border border-gray-100",
    label: "text-xs font-medium text-gray-500 uppercase tracking-wide mb-2",
    list: "flex flex-wrap gap-1.5",
    badge: "px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium border border-purple-200",
    empty: "text-sm text-gray-400",
} as const;

// ─── Layout ────────────────────────────────────────────────────────────────

export const layout = {
    content: "p-6",
    grid: "grid grid-cols-1 lg:grid-cols-2 gap-6",
} as const;
