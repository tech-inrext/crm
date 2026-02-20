// src/components/leads/LeadsActionBar/ActionButtonsRow.tsx
import React from "react";
import {
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  CircularProgress,
} from "@/components/ui/Component";
import {
  PersonAdd,
  DownloadIcon,
  UploadFile,
  AssignmentInd,
  History,
  Add,
} from "@/components/ui/Component";
import { MoreVert } from "@mui/icons-material";
import PermissionGuard from "@/components/PermissionGuard";
import dynamic from "next/dynamic";
import { FilterState } from "../types/LeadsActionBarTypes";

const BulkUpload = dynamic(() => import("@/components/leads/bulkUpload"), {
  ssr: false,
});
const BulkAssign = dynamic(() => import("@/components/leads/BulkAssign"), {
  ssr: false,
});

interface ActionButtonsRowProps {
  isTablet: boolean;
  onAdd: () => void;
  saving: boolean;
  loadLeads: () => void;
  filterState: FilterState;
  onOpenActionsMenu: (e: React.MouseEvent<HTMLElement>) => void;
  onCloseActionsMenu: () => void;
  onSetUploadStatusOpen: (open: boolean) => void;
}

const ActionButtonsRow: React.FC<ActionButtonsRowProps> = ({
  isTablet,
  onAdd,
  saving,
  loadLeads,
  filterState,
  onOpenActionsMenu,
  onCloseActionsMenu,
  onSetUploadStatusOpen,
}) => {
  const handleDownloadTemplate = async () => {
    try {
      const XLSX = await import("xlsx");
      const data = [
        ["fullName", "email", "phone"],
        ["Sample Lead Name 1", "lead1@gmail.com", "7500000001"],
        ["Sample Lead Name 2", "(leave blank if not available)", "7500000002"],
        ["Sample Lead Name 3", "lead3@gmail.com", "7500000003"],
        ["Sample Lead Name 4", "(leave blank if not available)", "7500000004"],
        ["(leave blank if not available)", "lead5@gmail.com", "7500000005"],
      ];
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.writeFile(wb, "lead_upload_template.xlsx");
    } catch (error) {
      console.error("Error downloading template:", error);
    }
  };

  return (
    <PermissionGuard module="lead" action="write" fallback={<></>}>
      <div className="flex items-center gap-1 justify-center sm:justify-end order-3 sm:order-3">
        {!isTablet && (
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={onAdd}
            disabled={saving}
            className="min-w-[140px] h-[42px] sm:h-[38px] rounded-xl font-medium text-sm sm:text-sm normal-case bg-blue-50 text-primary-main shadow-none border border-blue-200 hover:bg-blue-100 hover:border-blue-300 hover:shadow-none"
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : "Add Lead"}
          </Button>
        )}
        <Tooltip title="Lead actions">
          <IconButton
            size="small"
            onClick={onOpenActionsMenu}
            className="bg-white shadow-sm"
            aria-controls={filterState.actionsAnchor ? "lead-actions-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={!!filterState.actionsAnchor}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu
          id="lead-actions-menu"
          anchorEl={filterState.actionsAnchor}
          open={!!filterState.actionsAnchor}
          onClose={onCloseActionsMenu}
          MenuListProps={{ className: "p-0.5" }}
          PaperProps={{ className: "rounded-lg shadow-xl mt-1 overflow-hidden" }}
        >
          <div className="flex flex-col gap-1 min-w-[220px]">
            <MenuItem
              onClick={() => {
                handleDownloadTemplate();
                onCloseActionsMenu();
              }}
              className="rounded gap-3 py-2 px-3 text-sm font-semibold hover:bg-action-hover"
            >
              <DownloadIcon fontSize="small" />
              {isTablet ? "Template" : "Download Template"}
            </MenuItem>

            <MenuItem
              onClick={() => {
                onCloseActionsMenu();
                const input = document.getElementById("bulk-upload-excel") as HTMLInputElement | null;
                input?.click();
              }}
              className="rounded gap-3 py-2 px-3 text-sm font-semibold hover:bg-action-hover"
            >
              <UploadFile fontSize="small" />
              Bulk Upload
            </MenuItem>

            <MenuItem
              onClick={() => {
                onCloseActionsMenu();
                setTimeout(() => {
                  const trigger = document.getElementById("bulk-assign-trigger");
                  trigger?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
                }, 0);
              }}
              className="rounded gap-3 py-2 px-3 text-sm font-semibold hover:bg-action-hover"
            >
              <AssignmentInd fontSize="small" />
              Bulk Assign
            </MenuItem>

            <MenuItem
              onClick={() => {
                onSetUploadStatusOpen(true);
                onCloseActionsMenu();
              }}
              className="rounded gap-3 py-2 px-3 text-sm font-semibold hover:bg-action-hover"
            >
              <History fontSize="small" />
              {isTablet ? "Upload Status" : "Check Upload Status"}
            </MenuItem>

            {isTablet && (
              <MenuItem
                onClick={() => {
                  onAdd();
                  onCloseActionsMenu();
                }}
                disabled={saving}
                className="rounded gap-3 py-2 px-3 text-sm font-semibold hover:bg-action-hover"
              >
                {saving ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <>
                    <Add fontSize="small" />
                    Add Lead
                  </>
                )}
              </MenuItem>
            )}
          </div>
        </Menu>
        <div className="absolute w-0 h-0 overflow-hidden">
          <BulkUpload loadLeads={loadLeads} hideButton />
          <BulkAssign onSuccess={loadLeads} hideButton buttonId="bulk-assign-trigger" />
        </div>
      </div>
    </PermissionGuard>
  );
};

export default ActionButtonsRow;