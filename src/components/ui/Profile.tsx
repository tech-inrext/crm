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
        minHeight={200}
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
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <Avatar
          sx={{ width: 80, height: 80, bgcolor: "primary.main", fontSize: 36 }}
        >
          {user.name?.[0]?.toUpperCase()}
        </Avatar>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {user.name}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
          {user.phone && (
            <>
              <Typography variant="body2" color="text.secondary">
                &nbsp;|&nbsp;
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.phone}
              </Typography>
            </>
          )}
        </Box>
        <Divider sx={{ width: "100%", my: 2 }} />
        <Box width="100%" sx={{ mb: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Current Role
            </Typography>
            <Typography variant="body1" fontWeight={500}>
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
          {user.department && (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Department
              </Typography>
              <Typography variant="body2" color="text.primary">
                {user.department}
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
          {/* Add more fields as needed below */}
          {Object.entries(user).map(([key, value]) => {
            if (
              [
                "name",
                "email",
                "phone",
                "roles",
                "currentRole",
                "department",
                "id",
              ].includes(key)
            )
              return null;
            // Special case for manager field
            if (key === "manager") {
              let managerName = "N/A";
              if (typeof value === "object" && value !== null && value.name) {
                managerName = value.name;
              }
              return (
                <Box
                  key={key}
                  display="flex"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Manager
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    {managerName}
                  </Typography>
                </Box>
              );
            }
            if (typeof value === "object" && value !== null) return null;
            return (
              <Box
                key={key}
                display="flex"
                justifyContent="space-between"
                mb={1}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Typography>
                <Typography variant="body2" color="text.primary">
                  {String(value)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  }
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Profile</DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" fullWidth>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Profile;
