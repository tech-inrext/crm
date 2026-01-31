import React from "react";
import { Box } from "@/components/ui/Component";
import dynamic from "next/dynamic";
import { MODULE_STYLES } from "@/styles/moduleStyles";
import Pagination from "@/components/ui/Navigation/Pagination";

const LeadCard = dynamic(() => import("@/components/leads/LeadCard"), {
  ssr: false,
});

interface LeadsCardsViewProps {
  leads: any[];
  onEdit: (leadId: string) => void;
  onStatusChange: (leadId: string, status: string) => Promise<void>;
  onScheduleSiteVisit: (leadId: string) => void;
  onOpenFeedback: (leadId: string) => void;
  page: number;
  total: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const LeadsCardsView: React.FC<LeadsCardsViewProps> = ({
  leads,
  onEdit,
  onStatusChange,
  onScheduleSiteVisit,
  onOpenFeedback,
  page,
  total,
  rowsPerPage,
  onPageChange,
  onPageSizeChange,
}) => {
  return (
    <Box className="p-2 h-[calc(100%-168px)] ">
      <Box sx={MODULE_STYLES.leads.cardsGrid}>
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onEdit={() => onEdit(lead._id || lead.leadId || lead.id)}
            onStatusChange={onStatusChange}
            onScheduleSiteVisit={onScheduleSiteVisit}
            onOpenFeedback={onOpenFeedback}
          />
        ))}
      </Box>
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
          pageSizeOptions={[5, 10, 15, 25]}
        />
      </Box>
    </Box>
  );
};

export default LeadsCardsView;
