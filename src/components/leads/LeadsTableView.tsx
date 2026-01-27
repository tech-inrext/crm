import React from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableContainer,
} from "@/components/ui/Component";
import dynamic from "next/dynamic";
import { COMMON_STYLES } from "@/constants/leads";
import { MODULE_STYLES } from "@/styles/moduleStyles";
import Pagination from "@/components/ui/Navigation/Pagination";

const LeadsTableHeader = dynamic(
  () => import("@/components/leads/LeadsTableHeader"),
  { ssr: false }
);
const LeadsTableRow = dynamic(
  () => import("@/components/leads/LeadsTableRow"),
  { ssr: false }
);

interface LeadsTableViewProps {
  leads: any[];
  header: any[];
  selectedStatuses: string[];
  onStatusesChange: (statuses: string[]) => void;
  onEdit: (leadId: string, mode?: "edit" | "view") => void;
  onStatusChange: (leadId: string, status: string) => Promise<void>;
  page: number;
  total: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const LeadsTableView: React.FC<LeadsTableViewProps> = ({
  leads,
  header,
  selectedStatuses,
  onStatusesChange,
  onEdit,
  onStatusChange,
  page,
  total,
  rowsPerPage,
  onPageChange,
  onPageSizeChange,
}) => {
  return (
    <Box sx={MODULE_STYLES.leads.tableWrapper}>
      <Paper
        elevation={8}
        sx={{
          ...COMMON_STYLES.roundedPaper,
          ...MODULE_STYLES.leads.tableContainer,
        }}
      >
        <TableContainer>
          <Table
            stickyHeader
            size={MODULE_STYLES.common.getResponsiveTableSize()}
            sx={MODULE_STYLES.leads.table}
          >
            <LeadsTableHeader
              header={header}
              selectedStatuses={selectedStatuses}
              onStatusesChange={onStatusesChange}
            />
            <TableBody>
              {leads.map((row) => (
                <LeadsTableRow
                  key={row.id}
                  row={row}
                  header={header}
                  onEdit={(_lead: any, mode?: "edit" | "view") => onEdit(row._id, mode)}
                  onDelete={() => { }}
                  onStatusChange={onStatusChange}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={MODULE_STYLES.leads.paginationWrapper}>
        <Pagination
          total={total}
          page={page + 1}
          onPageChange={(p) => onPageChange(p - 1)}
          pageSize={rowsPerPage}
          onPageSizeChange={(size) => {
            onPageSizeChange(size);
            onPageChange(0);
          }}
          pageSizeOptions={[5, 10, 15, 25, 50]}
        />
      </Box>
    </Box>
  );
};

export default LeadsTableView;
