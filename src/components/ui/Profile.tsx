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
                DepartmentId
              </Typography>
              <Typography variant="body2" color="text.primary">
                {user.departmentId || user.department}
              </Typography>
            </Box>
          )}
          {user.managerId && (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" color="text.secondary">
                ManagerId
              </Typography>
              <Typography variant="body2" color="text.primary">
                {user.managerId}
              </Typography>
            </Box>
          )}
          {user.joiningDate && (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" color="text.secondary">
                JoiningDate
              </Typography>
              <Typography variant="body2" color="text.primary">
                {user.joiningDate}
              </Typography>
            </Box>
          )}
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
