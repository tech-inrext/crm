import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    Divider,
    IconButton,
    Chip,
} from "@/components/ui/Component";
import {
    Person,
    Email,
    Phone,
    Home,
    LocationOn,
    MonetizationOn,
    AssignmentInd,
    Event,
    Notes,
    Info,
    Source,
} from "@mui/icons-material";
import MODULE_STYLES from "@/styles/moduleStyles";
import Avatar from "@/components/ui/Component/Avatar";
import { LeadFormData } from "./LeadDialog";
import { format } from "date-fns";

interface LeadDetailsDialogProps {
    lead: LeadFormData | null;
    open: boolean;
    onClose: () => void;
    users?: any[]; // List of employees to resolve assignedTo name if it's an ID
}

const LeadDetailsDialog: React.FC<LeadDetailsDialogProps> = ({
    lead,
    open,
    onClose,
    users = [],
}) => {
    if (!lead) return null;

    // Resolve assignedTo name if possible
    const assignedUser = users.find((u) => u._id === lead.assignedTo || u.id === lead.assignedTo);
    const assignedToName = assignedUser ? (assignedUser.name || assignedUser.username || assignedUser.email) : lead.assignedTo || "-";

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "new": return "info";
            case "contacted": return "primary";
            case "interested": return "success";
            case "closed": return "success";
            case "lost": return "error";
            default: return "default";
        }
    };

    const DetailItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: any }) => (
        <Box display="flex" alignItems="center" gap={1.5}>
            <Icon color="action" fontSize="small" sx={{ opacity: 0.7 }} />
            <Box>
                <Typography variant="caption" color="text.secondary" display="block" lineHeight={1}>
                    {label}
                </Typography>
                <Typography variant="body2" color="text.primary" fontWeight={500}>
                    {value || "-"}
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: 24
                }
            }}
        >
            <DialogTitle
                sx={{
                    background: MODULE_STYLES.visual.gradients.tableHeader, // Keep consistent header gradient
                    color: "#fff",
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    fontSize: { xs: 18, sm: 20 }, // Responsive font size
                    py: 2.5,
                    px: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Person sx={{ fontSize: 28 }} />
                    <span>Lead Details</span>
                </Box>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        color: "rgba(255,255,255,0.8)",
                        "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.15)" }
                    }}
                    size="small"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24"
                        viewBox="0 0 24 24"
                        width="24"
                        fill="currentColor"
                    >
                        <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                </IconButton>
            </DialogTitle>

            <DialogContent
                dividers
                sx={{
                    background: "#f8f9fa", // Slight off-white background for modern feel
                    p: 0, // Reset padding for cleaner layout control
                }}
            >
                <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
                    {/* Header Section */}
                    <Box
                        display="flex"
                        flexDirection={{ xs: "column", sm: "row" }}
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        gap={3}
                        mb={4}
                        sx={{
                            bgcolor: "#fff",
                            p: 3,
                            borderRadius: 2,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                        }}
                    >
                        <Avatar
                            sx={{
                                width: { xs: 64, sm: 80 },
                                height: { xs: 64, sm: 80 },
                                fontSize: { xs: 24, sm: 32 },
                                fontWeight: 700,
                                background: "linear-gradient(135deg, #1976d2 0%, #115293 100%)",
                                color: "white",
                                boxShadow: 3,
                            }}
                        >
                            {lead.fullName?.substring(0, 2).toUpperCase() || <Person />}
                        </Avatar>
                        <Box flex={1} width="100%">
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                                <Box>
                                    <Typography variant="h5" fontWeight={800} color="text.primary" gutterBottom sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
                                        {lead.fullName}
                                    </Typography>
                                    <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                                        <Chip
                                            label={lead.status}
                                            size="small"
                                            color={getStatusColor(lead.status) as any}
                                            sx={{
                                                textTransform: "capitalize",
                                                fontWeight: 700,
                                                height: 24,
                                                px: 1
                                            }}
                                        />
                                        {lead.source && (
                                            <Chip
                                                icon={<Source style={{ fontSize: 14 }} />}
                                                label={lead.source}
                                                size="small"
                                                variant="outlined"
                                                sx={{ height: 24, fontSize: '0.75rem', borderColor: 'divider', bgcolor: 'transparent' }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={3}>

                        {/* Contact Information Card */}
                        <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                            <Typography
                                variant="overline"
                                color="primary.main"
                                fontWeight={800}
                                sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1, letterSpacing: 1.2, fontSize: '0.75rem' }}
                            >
                                <AssignmentInd fontSize="small" />
                                CONTACT & ASSIGNMENT
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={2.5}>
                                <DetailItem icon={Email} label="Email Address" value={lead.email} />
                                <DetailItem icon={Phone} label="Phone Number" value={lead.phone} />
                                <Divider sx={{ borderStyle: 'dashed' }} />
                                <DetailItem icon={AssignmentInd} label="Assigned Agent" value={assignedToName} />
                                <DetailItem icon={Event} label="Next Follow-up" value={lead.nextFollowUp ? format(new Date(lead.nextFollowUp), "PP p") : "Not scheduled"} />
                            </Box>
                        </Box>

                        {/* Property Details Card */}
                        <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", height: 'fit-content' }}>
                            <Typography
                                variant="overline"
                                color="secondary.main"
                                fontWeight={800}
                                sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1, letterSpacing: 1.2, fontSize: '0.75rem' }}
                            >
                                <Home fontSize="small" />
                                PROPERTY CONFIGURATION
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={2.5}>
                                <DetailItem icon={Home} label="Property Name" value={lead.propertyName} />
                                <DetailItem icon={Info} label="Property Type" value={lead.propertyType} />
                                <DetailItem icon={LocationOn} label="Location" value={lead.location} />
                                <DetailItem icon={MonetizationOn} label="Budget Range" value={lead.budgetRange} />
                            </Box>
                        </Box>
                    </Box>

                    {/* Notes Section */}
                    {(lead.followUpNotes && lead.followUpNotes.length > 0) && (
                        <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", mt: 3 }}>
                            <Typography
                                variant="overline"
                                color="warning.main"
                                fontWeight={800}
                                sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, letterSpacing: 1.2, fontSize: '0.75rem' }}
                            >
                                <Notes fontSize="small" />
                                LATEST ACTIVITY & NOTES
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {lead.followUpNotes.slice().reverse().map((noteObj: any, idx: number) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            p: 2,
                                            bgcolor: "grey.50",
                                            borderRadius: 2,
                                            borderLeft: "3px solid",
                                            borderColor: idx === 0 ? "warning.light" : "grey.300"
                                        }}
                                    >
                                        <Typography variant="body2" color="text.primary">
                                            {noteObj.note || noteObj}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}

                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default LeadDetailsDialog;
