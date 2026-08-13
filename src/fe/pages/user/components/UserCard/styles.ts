export const cardStyles = {
  container:
    "group relative w-full rounded-2xl p-5 flex flex-col gap-4 min-w-0 bg-white border border-gray-100/80 shadow-sm hover:shadow-xl hover:border-blue-200/80 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer",
  accentBanner:
    "absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity",
  header: "flex items-start justify-between relative pt-1 gap-2",
  profileInfo: "flex items-center gap-3.5 flex-1 min-w-0",
  avatarWrapper: "relative flex-shrink-0",
  avatarImage: "w-14 h-14 rounded-full object-cover shadow-md ring-2 ring-blue-500/20 group-hover:ring-blue-500/50 transition-all",
  avatarPlaceholder:
    "w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md ring-2 ring-blue-500/20 group-hover:scale-105 transition-all",
  nameSection: "flex-1 min-w-0 pr-1",
  nameTitle: "text-base font-bold text-gray-900 leading-snug truncate group-hover:text-blue-600 transition-colors",
  designationTag:
    "inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 truncate max-w-full",
  actionContainer: "flex items-center gap-1.5 flex-shrink-0",
  actionButtonView:
    "w-8 h-8 rounded-full flex items-center justify-center text-slate-500 bg-slate-50 hover:text-blue-600 hover:bg-blue-50 hover:scale-110 active:scale-95 transition-all border border-slate-200/60 shadow-xs",
  actionButtonEdit:
    "w-8 h-8 rounded-full flex items-center justify-center text-slate-500 bg-slate-50 hover:text-indigo-600 hover:bg-indigo-50 hover:scale-110 active:scale-95 transition-all border border-slate-200/60 shadow-xs",
  metadataSection: "space-y-2.5 relative border-t border-gray-100/80 pt-3 pr-8",
  metadataItem: "flex items-center gap-2.5 text-gray-600 text-xs font-medium min-w-0",
  metadataValue: "text-xs truncate font-medium text-gray-700 flex-1 min-w-0",
};
