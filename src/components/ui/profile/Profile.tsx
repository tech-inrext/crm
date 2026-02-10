"use client";

import React, { useState } from "react";
import Dialog from "@/components/ui/Component/Dialog";
import DialogContent from "@/components/ui/Component/DialogContent";
import DialogActions from "@/components/ui/Component/DialogActions";
import Button from "@/components/ui/Component/Button";
import Avatar from "@/components/ui/Component/Avatar";
import Typography from "@/components/ui/Component/Typography";
import Box from "@/components/ui/Component/Box";
import Divider from "@/components/ui/Component/Divider";
import IconButton from "@/components/ui/Component/IconButton";

import CloseIcon from "@mui/icons-material/Close";
import ShareIcon from "@mui/icons-material/Share";
import VisibilityIcon from "@mui/icons-material/Visibility";

import ShareMenu from "./ShareMenu";

interface ProfileProps {
  open: boolean;
  onClose: () => void;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    photo?: string;
    roles: { name: string; _id: string }[];
    currentRole: string;
    department?: string;
    altPhone?: string;
    designation?: string;
    specialization?: string;
    branch?: string;
    gender?: string;
    address?: string;
    managerName?: string;
    managerId?: string;
    joiningDate?: string;
    [key: string]: any;
  } | null;
}

// Phone formatter utility function
const formatPhoneForDisplay = (phone?: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Format Indian numbers (10 digits)
  if (digitsOnly.length === 10) {
    return `+91 ${digitsOnly.substring(0, 5)} ${digitsOnly.substring(5)}`;
  }
  
  // Format numbers with country code (12 digits for India)
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return `+${digitsOnly.substring(0, 2)} ${digitsOnly.substring(2, 7)} ${digitsOnly.substring(7)}`;
  }
  
  // If already includes +, return as is
  if (phone.includes('+')) {
    return phone;
  }
  
  // Default: add + for international format
  return `+${digitsOnly}`;
};

const Profile: React.FC<ProfileProps> = ({ open, onClose, user }) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handleShareOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleShareClose = () => {
    setAnchorEl(null);
  };

  const handlePreviewVisitingCard = () => {
  if (user?._id) {
    // Use the employee ID in the route
    const visitingCardUrl = `https://inrext.com/visiting-card/${user._id}`;
    window.open(visitingCardUrl, '_blank');
    onClose();
  }
};

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

    const hasPhoto = user.photo && user.photo.trim() !== '';

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
        {/* AVATAR */}
        <Avatar
          sx={{
            width: 90,
            height: 90,
            bgcolor: hasPhoto ? "transparent" : "primary.main",
            fontSize: 40,
            boxShadow: 2,
            border: "3px solid #fff",
            mb: 1,
            "& img": {
              objectFit: "cover",
              objectPosition: "top",
            },
          }}
          src={hasPhoto ? user.photo : undefined}
          alt={user.name}
        >
          {!hasPhoto && user.name?.[0]?.toUpperCase()}
        </Avatar>

        {/* NAME */}
        <Typography
          variant="h5"
          fontWeight={700}
          gutterBottom
          color="primary.main"
        >
          {user.name}
        </Typography>

        {/* EMAIL + PHONE */}
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

        {/* ACCOUNT DETAILS */}
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

          {user.roles?.length > 0 && (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" color="text.secondary">
                All Roles
              </Typography>
              <Typography variant="body2">
                {user.roles.map((r: any) => r.name).join(", ")}
              </Typography>
            </Box>
          )}

          {user._id && (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" color="text.secondary">
                User ID
              </Typography>
              <Typography variant="body2">{user._id}</Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ width: "100%", my: 1 }} />

        {/* PERSONAL INFO */}
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
              <Typography variant="body2">{user.gender}</Typography>
            </Box>
          )}

          {user.address && (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Address
              </Typography>
              <Typography variant="body2">{user.address}</Typography>
            </Box>
          )}

          {user.designation && (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Designation
              </Typography>
              <Typography variant="body2">{user.designation}</Typography>
            </Box>
          )}

          {user.specialization && (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Specialization
              </Typography>
              <Typography variant="body2">{user.specialization}</Typography>
            </Box>
          )}

          {(user.departmentId || user.department) && (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Department
              </Typography>
              <Typography variant="body2">
                {user.departmentId || user.department}
              </Typography>
            </Box>
          )}

          {(user.managerName || user.managerId) && (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Manager
              </Typography>
              <Typography variant="body2">
                {user.managerName || user.managerId}
              </Typography>
            </Box>
          )}

          {user.joiningDate && (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Joining Date
              </Typography>
              <Typography variant="body2">
                {typeof window !== "undefined"
                  ? new Date(user.joiningDate).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Recently"}
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
          position: "relative",
        },
      }}
    >
      {/* CLOSE BUTTON */}
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 10,
          bgcolor: "rgba(255,255,255,0.8)",
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: 0 }}>{content}</DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, display: "flex", gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<VisibilityIcon />}
          onClick={handlePreviewVisitingCard}
          sx={{ fontWeight: 600, borderRadius: 2, flex: 1 }}
          disabled={!user?._id}
        >
          Preview Card
        </Button>

        <Button
          variant="contained"
          startIcon={<ShareIcon />}
          onClick={handleShareOpen}
          sx={{ fontWeight: 600, borderRadius: 2, flex: 1 }}
        >
          Share
        </Button>

        <ShareMenu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleShareClose}
          userId={user?._id}
          userName={user?.name}
          userData={{
            phone: user?.phone,
            email: user?.email,
            altPhone: user?.altPhone,
            photo: user?.photo,
            designation: user?.designation,
            specialization: user?.specialization,
            branch: user?.branch,
          }}
        />
      </DialogActions>
    </Dialog>
  );
};

export default Profile;


