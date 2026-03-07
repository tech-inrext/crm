import { useState } from "react";
import type { DepartmentAttachment } from "@/fe/pages/department/types";

// ─── Tiny icon helpers ───────────────────────────────────────────────────────

const ClipIcon = () => (
  <svg
    className="w-4 h-4 flex-shrink-0 text-blue-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
    />
  </svg>
);

const FileIcon = () => (
  <svg
    className="w-4 h-4 flex-shrink-0 text-slate-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const PencilIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const XIcon = () => (
  <svg
    className="w-4 h-4"
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
);

// ─── Saved attachment row ────────────────────────────────────────────────────

interface SavedRowProps {
  att: DepartmentAttachment;
  renamingUrl: string | null;
  onRenameToggle: (url: string) => void;
  onRenameCommit: (url: string, newName: string) => void;
  onRenameCancel: () => void;
  onRemove: (url: string) => void;
}

export const SavedAttachmentRow: React.FC<SavedRowProps> = ({
  att,
  renamingUrl,
  onRenameToggle,
  onRenameCommit,
  onRenameCancel,
  onRemove,
}) => (
  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
    <ClipIcon />

    {renamingUrl === att.url ? (
      <input
        autoFocus
        type="text"
        defaultValue={att.filename}
        onBlur={(e) => {
          const v = e.target.value.trim();
          if (v) onRenameCommit(att.url, v);
          else onRenameCancel();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") onRenameCancel();
        }}
        className="flex-1 min-w-0 bg-transparent text-sm text-slate-700 border-b border-blue-400 focus:outline-none"
      />
    ) : (
      <a
        href={att.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 text-sm text-blue-700 truncate hover:underline"
      >
        {att.filename}
      </a>
    )}

    <button
      type="button"
      onClick={() => onRenameToggle(att.url)}
      className="text-slate-400 hover:text-blue-600 transition-colors"
      aria-label="Rename"
    >
      <PencilIcon />
    </button>
    <button
      type="button"
      onClick={() => onRemove(att.url)}
      className="text-red-400 hover:text-red-600 transition-colors"
      aria-label="Remove"
    >
      <XIcon />
    </button>
  </div>
);

// ─── Pending file row ────────────────────────────────────────────────────────

interface PendingRowProps {
  id: string;
  file: File;
  customName: string;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}

export const PendingFileRow: React.FC<PendingRowProps> = ({
  id,
  file,
  customName,
  onRename,
  onRemove,
}) => {
  const [renaming, setRenaming] = useState(false);

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg border border-slate-200">
      <FileIcon />

      {renaming ? (
        <input
          autoFocus
          type="text"
          defaultValue={customName}
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v) onRename(id, v);
            setRenaming(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") setRenaming(false);
          }}
          className="flex-1 min-w-0 bg-transparent text-sm text-slate-700 border-b border-blue-400 focus:outline-none"
        />
      ) : (
        <span className="flex-1 text-sm text-slate-700 truncate">
          {customName || file.name}
        </span>
      )}

      <span className="text-xs text-slate-400 whitespace-nowrap">
        {(file.size / 1024).toFixed(0)} KB
      </span>

      <button
        type="button"
        onClick={() => setRenaming((v) => !v)}
        className="text-slate-400 hover:text-blue-600 transition-colors"
        aria-label="Rename"
      >
        <PencilIcon />
      </button>
      <button
        type="button"
        onClick={() => onRemove(id)}
        className="text-red-400 hover:text-red-600 transition-colors"
        aria-label="Remove"
      >
        <XIcon />
      </button>
    </div>
  );
};
