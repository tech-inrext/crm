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
  Work,
  CalendarToday,
  Badge,
  SupervisorAccount,
  Business,
  AccountBalance,
  Fingerprint,
  Description,
  FamilyRestroom,
} from "@mui/icons-material";
import MODULE_STYLES from "@/styles/moduleStyles";
import Avatar from "@/components/ui/Component/Avatar";
import { UserFormData } from "./UserDialog";
import { format } from "date-fns";

interface UserDetailsDialogProps {
  user: any; // User object
  open: boolean;
  onClose: () => void;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  user,
  open,
  onClose,
}) => {
  if (!user) return null;

  // Helper for safe date formatting
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "PP");
    } catch (e) {
      return dateString;
    }
  };

  const DetailItem = ({
    icon: Icon,
    label,
    value,
    isLink = false,
  }: {
    icon: any;
    label: string;
    value: any;
    isLink?: boolean;
  }) => (
    <Box display="flex" alignItems="center" gap={1.5}>
      <Icon color="action" fontSize="small" sx={{ opacity: 0.7 }} />
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          lineHeight={1}
        >
          {label}
        </Typography>
        {isLink ? (
          value && value !== "-" && value.trim() !== "" ? (
            <Typography
              variant="body2"
              component="a"
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              color="primary"
              fontWeight={500}
              sx={{ textDecoration: "underline", cursor: "pointer" }}
            >
              View Document
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              N/A
            </Typography>
          )
        ) : (
          <Typography variant="body2" color="text.primary" fontWeight={500}>
            {value || "-"}
          </Typography>
        )}
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
          boxShadow: 24,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: MODULE_STYLES.visual.gradients.tableHeader,
          color: "#fff",
          fontWeight: 700,
          letterSpacing: 0.5,
          fontSize: { xs: 18, sm: 20 },
          py: 2.5,
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Person sx={{ fontSize: 28 }} />
          <span>User Details</span>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: "rgba(255,255,255,0.8)",
            "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.15)" },
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
          background: "#f8f9fa",
          p: 0,
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
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
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
                src: user.avatarUrl,
              }}
            >
              {!user.avatarUrl &&
                (user.name?.substring(0, 2).toUpperCase() || <Person />)}
            </Avatar>
            <Box flex={1} width="100%">
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                flexWrap="wrap"
                gap={2}
              >
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    color="text.primary"
                    gutterBottom
                    sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                  >
                    {user.name}
                  </Typography>
                  <Box
                    display="flex"
                    gap={1}
                    flexWrap="wrap"
                    alignItems="center"
                  >
                    <Chip
                      label={user.designation || "No Designation"}
                      size="small"
                      color="primary"
                      sx={{
                        textTransform: "capitalize",
                        fontWeight: 700,
                        height: 24,
                        px: 1,
                      }}
                    />
                    {user.isCabVendor && (
                      <Chip
                        label="Cab Vendor"
                        size="small"
                        color="warning"
                        sx={{ height: 24 }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box
            display="grid"
            gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
            gap={3}
          >
            {/* Basic Info Card */}
            <Box
              sx={{
                bgcolor: "#fff",
                p: 3,
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <Typography
                variant="overline"
                color="primary.main"
                fontWeight={800}
                sx={{
                  mb: 2.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  letterSpacing: 1.2,
                  fontSize: "0.75rem",
                }}
              >
                <Badge fontSize="small" />
                PRIVATE & CONTACT INFO
              </Typography>
              <Box display="flex" flexDirection="column" gap={2.5}>
                <DetailItem
                  icon={Email}
                  label="Email Address"
                  value={user.email}
                />
                <DetailItem
                  icon={Phone}
                  label="Phone Number"
                  value={user.phone}
                />
                <DetailItem
                  icon={Phone}
                  label="Alternate Phone"
                  value={user.altPhone}
                />
                <DetailItem icon={Person} label="Gender" value={user.gender} />
                <DetailItem icon={CalendarToday} label="Age" value={user.age} />
                <DetailItem
                  icon={Person}
                  label="Father's Name"
                  value={user.fatherName}
                />
                <DetailItem icon={Home} label="Address" value={user.address} />
              </Box>
            </Box>

            {/* Organization & Roles Card */}
            <Box
              sx={{
                bgcolor: "#fff",
                p: 3,
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                height: "fit-content",
              }}
            >
              <Typography
                variant="overline"
                color="secondary.main"
                fontWeight={800}
                sx={{
                  mb: 2.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  letterSpacing: 1.2,
                  fontSize: "0.75rem",
                }}
              >
                <Business fontSize="small" />
                ORGANIZATION
              </Typography>
              <Box display="flex" flexDirection="column" gap={2.5}>
                <DetailItem
                  icon={Work}
                  label="Designation"
                  value={user.designation}
                />
                <DetailItem
                  icon={CalendarToday}
                  label="Joining Date"
                  value={formatDate(user.joiningDate)}
                />
                <DetailItem
                  icon={Business}
                  label="Department"
                  value={user.departmentId?.name || "N/A"}
                />
                <DetailItem
                  icon={SupervisorAccount}
                  label="Manager"
                  value={user.managerId?.name || "N/A"}
                />
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    gutterBottom
                  >
                    Roles
                  </Typography>
                  <Box display="flex" gap={0.5} flexWrap="wrap">
                    {user.roles && user.roles.length > 0 ? (
                      user.roles.map((role: any, idx: number) => (
                        <Chip
                          key={idx}
                          label={typeof role === "string" ? role : role.name}
                          size="small"
                          variant="outlined"
                        />
                      ))
                    ) : (
                      <Typography variant="body2">-</Typography>
                    )}
                  </Box>
                </Box>
                <DetailItem
                  icon={AccountBalance}
                  label="Branch"
                  value={user.branch}
                />
                <DetailItem
                  icon={AccountBalance}
                  label="Slab Percentage"
                  value={`${user.slabPercentage || 0}%`}
                />
              </Box>
            </Box>

            {/* Documents Card */}
            <Box
              sx={{
                bgcolor: "#fff",
                p: 3,
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <Typography
                variant="overline"
                color="warning.main"
                fontWeight={800}
                sx={{
                  mb: 2.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  letterSpacing: 1.2,
                  fontSize: "0.75rem",
                }}
              >
                <Description fontSize="small" />
                DOCUMENTS
              </Typography>
              <Box display="flex" flexDirection="column" gap={2.5}>
                <DetailItem
                  icon={Fingerprint}
                  label="Aadhar Card"
                  value={user.aadharUrl}
                  isLink
                />
                <DetailItem
                  icon={Description}
                  label="PAN Card"
                  value={user.panUrl}
                  isLink
                />
                <DetailItem
                  icon={AccountBalance}
                  label="Bank Proof"
                  value={user.bankProofUrl}
                  isLink
                />
                <DetailItem
                  icon={Description}
                  label="Signature"
                  value={user.signatureUrl}
                  isLink
                />
              </Box>
            </Box>

            {/* Nominee Card */}
            <Box
              sx={{
                bgcolor: "#fff",
                p: 3,
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <Typography
                variant="overline"
                color="success.main"
                fontWeight={800}
                sx={{
                  mb: 2.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  letterSpacing: 1.2,
                  fontSize: "0.75rem",
                }}
              >
                <FamilyRestroom fontSize="small" />
                NOMINEE DETAILS
              </Typography>
              <Box display="flex" flexDirection="column" gap={2.5}>
                <DetailItem
                  icon={Person}
                  label="Name"
                  value={user.nominee?.name}
                />
                <DetailItem
                  icon={Phone}
                  label="Phone"
                  value={user.nominee?.phone}
                />
                <DetailItem
                  icon={Work}
                  label="Occupation"
                  value={user.nominee?.occupation}
                />
                <DetailItem
                  icon={FamilyRestroom}
                  label="Relation"
                  value={user.nominee?.relation}
                />
                <DetailItem
                  icon={Person}
                  label="Gender"
                  value={user.nominee?.gender}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
