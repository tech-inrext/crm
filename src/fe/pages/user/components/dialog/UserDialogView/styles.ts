// ─── Field Color Configs ───────────────────────────────────────────────────

export const iconBadgeColors: Record<string, string> = {
  blue: "bg-gradient-to-br from-blue-50 to-indigo-50/80 text-blue-600 border border-blue-200/60 shadow-2xs",
  emerald: "bg-gradient-to-br from-emerald-50 to-teal-50/80 text-emerald-600 border border-emerald-200/60 shadow-2xs",
  green: "bg-gradient-to-br from-green-50 to-emerald-50/80 text-green-600 border border-green-200/60 shadow-2xs",
  purple: "bg-gradient-to-br from-purple-50 to-indigo-50/80 text-purple-600 border border-purple-200/60 shadow-2xs",
  rose: "bg-gradient-to-br from-rose-50 to-pink-50/80 text-rose-600 border border-rose-200/60 shadow-2xs",
  indigo: "bg-gradient-to-br from-indigo-50 to-blue-50/80 text-indigo-600 border border-indigo-200/60 shadow-2xs",
  amber: "bg-gradient-to-br from-amber-50 to-orange-50/80 text-amber-600 border border-amber-200/60 shadow-2xs",
  slate: "bg-gradient-to-br from-slate-100 to-slate-200/80 text-slate-700 border border-slate-300/60 shadow-2xs",
  sky: "bg-gradient-to-br from-sky-50 to-blue-50/80 text-sky-600 border border-sky-200/60 shadow-2xs",
  violet: "bg-gradient-to-br from-violet-50 to-purple-50/80 text-violet-600 border border-violet-200/60 shadow-2xs",
  teal: "bg-gradient-to-br from-teal-50 to-cyan-50/80 text-teal-600 border border-teal-200/60 shadow-2xs",
  cyan: "bg-gradient-to-br from-cyan-50 to-sky-50/80 text-cyan-600 border border-cyan-200/60 shadow-2xs",
  orange: "bg-gradient-to-br from-orange-50 to-amber-50/80 text-orange-600 border border-orange-200/60 shadow-2xs",
};

// ─── Dialog backdrop & paper ──────────────────────────────────────────────

export const dialogProps = {
  backdrop: {
    sx: {
      backdropFilter: "blur(6px)",
      backgroundColor: "rgba(15, 23, 42, 0.45)",
    },
  },
  paper: {
    sx: {
      maxHeight: { xs: "100vh", sm: "90vh" },
      borderRadius: { xs: 0, sm: 4 },
      boxShadow: "0 25px 30px -5px rgba(0, 0, 0, 0.12), 0 15px 15px -5px rgba(0, 0, 0, 0.04)",
      overflow: "hidden",
      backgroundColor: "#f8fafc",
    },
  },
} as const;

// ─── Profile Header ────────────────────────────────────────────────────────

export const profileHeader = {
  container: "relative bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 space-y-3.5 shadow-xs hover:border-slate-300/80 transition-all",
  closeBtn: "text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full p-2 transition-all active:scale-95 shadow-2xs border border-slate-200/60 bg-white",
  mainCard: "flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left pt-0",
  avatarWrap: "relative flex-shrink-0",
  avatarImg: "w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover shadow-md ring-4 ring-indigo-500/15 border-2 border-white",
  avatarInitial: "w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center font-black text-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md ring-4 ring-indigo-500/15 border-2 border-white",
  info: "flex-1 min-w-0 space-y-1.5",
  name: "text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight",
  tagGroup: "flex flex-wrap items-center justify-center sm:justify-start gap-2",
  designationPill: "inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs",
  branchPill: "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100/90 text-slate-700 border border-slate-200/80 shadow-2xs",
  actionRow: "flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-3 border-t border-slate-100/80 mt-1",
  actionBtn: "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100/90 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 transition-all active:scale-95 cursor-pointer shadow-2xs",
} as const;

// ─── Section & Row Items ───────────────────────────────────────────────────

export const sectionStyles = {
  card: "bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-4 hover:border-slate-300/80 transition-all",
  titleRow: "flex items-center gap-3 border-b border-slate-100/90 pb-3",
  titleIcon: "w-8 h-8 rounded-xl flex items-center justify-center text-white font-extrabold shadow-sm",
  titleText: "text-xs font-black text-slate-800 tracking-wider uppercase",
  list: "space-y-2",
} as const;

export const infoRowStyles = {
  row: "flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50/70 hover:bg-white hover:shadow-2xs border border-slate-100 hover:border-slate-200/90 transition-all min-w-0",
  leftGroup: "flex items-center gap-3 min-w-0 flex-shrink-0",
  iconBubble: "w-8.5 h-8.5 rounded-xl flex items-center justify-center flex-shrink-0 font-bold",
  label: "text-xs font-bold uppercase tracking-wide text-slate-500 truncate",
  value: "text-xs sm:text-sm font-extrabold text-slate-900 break-all text-right max-w-[60%] leading-snug",
} as const;
