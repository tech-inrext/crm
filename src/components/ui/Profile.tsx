import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";

interface ProfileProps {
  open: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    phone?: string;
    roles: { name: string; _id: string }[];
    currentRole: string;
    department?: string;
    [key: string]: any;
  } | null;
}

const Profile: React.FC<ProfileProps> = ({ open, onClose, user }) => {
  let content;
  if (!user) {
    content = (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight={220}
        sx={{
          background: "linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)",
          borderRadius: 3,
          boxShadow: 2,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Loading user info...
        </Typography>
      </Box>
    );
  } else {
    const currentRole = user.roles.find(
      (r) => r._id === user.currentRole
    )?.name;
    content = (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
        sx={{
          background: "linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)",
          borderRadius: 3,
          boxShadow: 3,
          p: 3,
        }}
      >
        <Avatar
          sx={{
            width: 90,
            height: 90,
            bgcolor: "primary.main",
            fontSize: 40,
            boxShadow: 2,
            border: "3px solid #fff",
            mb: 1,
          }}
        >
          {user.name?.[0]?.toUpperCase()}
        </Avatar>
        <Typography
          variant="h5"
          fontWeight={700}
          gutterBottom
          color="primary.main"
        >
          {user.name}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body1" color="text.secondary">
            {user.email}
          </Typography>
          {user.phone && (
            <>
              <Typography variant="body1" color="text.disabled">
                &nbsp;|&nbsp;
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user.phone}
              </Typography>
            </>
          )}
        </Box>
        <Divider sx={{ width: "100%", my: 2 }} />
        <Box width="100%" sx={{ mb: 2 }}>
          <Typography
            variant="subtitle1"
            color="primary"
            fontWeight={600}
            mb={1}
          >
            Account Details
          </Typography>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Current Role
            </Typography>
            <Typography variant="body1" fontWeight={500} color="primary.main">
              {currentRole}
            </Typography>
          </Box>
          {user.roles && user.roles.length > 0 && (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" color="text.secondary">
                All Roles
              </Typography>
              <Typography variant="body2" color="text.primary">
                {user.roles.map((role: any) => role.name).join(", ")}
              </Typography>
            </Box>
          )}
          {user.id && (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" color="text.secondary">
                User ID
              </Typography>
              <Typography variant="body2" color="text.primary">
                {user.id}
              </Typography>
            </Box>
          )}
        </Box>
        <Divider sx={{ width: "100%", my: 1 }} />
        <Box width="100%" sx={{ mb: 2 }}>
          <Typography
            variant="subtitle1"
            color="primary"
            fontWeight={600}
            mb={1}
          >
            Personal Info
          </Typography>
          {user.gender && (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Gender
              </Typography>
              <Typography variant="body2" color="text.primary">
                {user.gender}
              </Typography>
            </Box>
          )}
          {user.address && (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Address
              </Typography>
              <Typography variant="body2" color="text.primary">
                {user.address}
              </Typography>
            </Box>
          )}
          {user.designation && (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Designation
              </Typography>
              <Typography variant="body2" color="text.primary">
                {user.designation}
              </Typography>
            </Box>
          )}
          {(user.departmentId || user.department) && (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Department
              </Typography>
              <Typography variant="body2" color="text.primary">
                {user.departmentId || user.department}
              </Typography>
            </Box>
          )}
          {user.managerName || user.managerId ? (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Manager
              </Typography>
              <Typography variant="body2" color="text.primary">
                {user.managerName || user.managerId}
              </Typography>
            </Box>
          ) : null}
          {user.joiningDate && (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Joining Date
              </Typography>
              <Typography variant="body2" color="text.primary">
                {new Date(user.joiningDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  }
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
          borderRadius: 4,
          boxShadow: 6,
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: 700,
          fontSize: 24,
          color: "primary.main",
          letterSpacing: 1,
          background: "linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 1,
        }}
      >
        Profile
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>{content}</DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          fullWidth
          sx={{ fontWeight: 600, borderRadius: 2 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Profile;
