import {Box, Typography, IconButton, Avatar, CloseIcon} from "@/components/ui/Component";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
export default function FollowUpHeader({leadInfo, handleDialogClose, isMobile}: {leadInfo: any, handleDialogClose: () => void, isMobile: boolean}) {
    return (
        <div>
            <Box
        sx={{
          bgcolor: "#fff",
          borderBottom: "1px solid #f3f4f6",
          pt: "10px",
        }}
      >
        {/* Title row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 1.5,
            pb: 1,
            px: 2.5,
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: isMobile ? "0.95rem" : "1rem",
              color: "text.primary",
            }}
          >
            Updates & Reminders
          </Typography>
          <IconButton
            onClick={handleDialogClose}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Lead info strip */}
        {leadInfo && (
          <Box
            sx={{
              px: 2.5,
              pb: 1.25,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
          {isMobile && (
            <ChevronLeftIcon 
              onClick={handleDialogClose}
              sx={{ cursor: "pointer", ml: -1 }}
            />
          )}

            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: "0.75rem",
                fontWeight: 700,
                bgcolor: "#eff6ff",
                color: "#2563eb",
                border: "1.5px solid #dbeafe",
              }}
            >
              {leadInfo.fullName
                ? leadInfo.fullName.substring(0, 2).toUpperCase()
                : "?"}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#111827",
                  lineHeight: 1.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {leadInfo.fullName || "Unknown Lead"}
              </Typography>
              {leadInfo.phone && (
                <Typography
                  component="a"
                  href={`tel:${leadInfo.phone}`}
                  sx={{
                    fontSize: "0.7rem",
                    color: "#6b7280",
                    textDecoration: "none",
                    "&:hover": { color: "#2563eb" },
                  }}
                >
                  {leadInfo.phone}
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Box>
        </div>
    );
}