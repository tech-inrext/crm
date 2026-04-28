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
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import TransgenderIcon from "@mui/icons-material/Transgender";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ShieldIcon from "@mui/icons-material/Shield";
import GroupIcon from "@mui/icons-material/Group";

import ShareMenu from "./ShareMenu";

interface ProfileProps {
  open: boolean;
  onClose: () => void;
  user: {
    _id: string;
    employeeProfileId?: string;
    name: string;
    email: string;
    phone?: string;
    photo?: string;
    roles: { name: string; _id: string }[];
    currentRole: string;
    department?: string;
    departmentName?: string;
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

const InfoRow = ({ icon: Icon, label, value, color = "text.primary" }: any) => (
  <Box 
    display="flex" 
    flexDirection={{ xs: 'column', sm: 'row' }} 
    alignItems={{ xs: 'flex-start', sm: 'center' }} 
    justifyContent="space-between" 
    mb={2}
    gap={{ xs: 0.5, sm: 2 }}
  >
    <Box display="flex" alignItems="center" gap={1.5}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: 1.5,
          bgcolor: 'rgba(59, 130, 246, 0.1)',
          color: 'primary.main',
          flexShrink: 0
        }}
      >
        <Icon sx={{ fontSize: 18 }} />
      </Box>
      <Typography variant="body2" fontWeight={500} color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
        {label}
      </Typography>
    </Box>
    <Typography 
      variant="body2" 
      fontWeight={600} 
      color={color} 
      textAlign={{ xs: 'left', sm: 'right' }}
      sx={{ 
        pl: { xs: 6, sm: 0 },
        wordBreak: 'break-word',
        fontSize: { xs: '0.8rem', sm: '0.875rem' },
        width: '100%',
        maxWidth: { xs: '100%', sm: '220px' }
      }}
    >
      {value}
    </Typography>
  </Box>
);

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
      const visitingCardUrl = `https://inrext.com/visiting-card/${user._id}`;
      window.open(visitingCardUrl, '_blank');
      onClose();
    }
  };

  if (!user) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" p={4}>
            <Typography>Loading...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  const currentRoleName = user.roles.find((r) => r._id === user.currentRole)?.name || "User";
  const allRolesList = user.roles.map((r: any) => r.name).join(", ");
  const hasPhoto = user.photo && user.photo.trim() !== '';

  const getGenderIcon = (gender?: string) => {
    switch (gender?.toLowerCase()) {
      case 'male': return MaleIcon;
      case 'female': return FemaleIcon;
      default: return TransgenderIcon;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 4 },
          margin: { xs: 0, sm: 2 },
          maxHeight: { xs: '100%', sm: 'calc(100% - 64px)' },
          overflow: "hidden",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        },
      }}
      fullScreen={typeof window !== 'undefined' && window.innerWidth < 600}
    >
      <DialogContent sx={{ p: 0, position: 'relative', bgcolor: '#fdfdfd' }}>
        {/* HEADER HERO SECTION */}
        <Box 
          sx={{ 
            height: { xs: 100, sm: 120 }, 
            background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
            position: 'relative'
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              color: "white",
              bgcolor: "rgba(255,255,255,0.2)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* PROFILE INFO OVERLAY */}
        <Box sx={{ px: { xs: 2, sm: 3 }, pb: 3, mt: -6, position: 'relative', textAlign: 'center' }}>
          <Avatar
            src={hasPhoto ? user.photo : undefined}
            alt={user.name}
            sx={{
              width: { xs: 80, sm: 100 },
              height: { xs: 80, sm: 100 },
              margin: '0 auto',
              border: "4px solid #fff",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              bgcolor: "primary.main",
              fontSize: 40,
            }}
          >
            {!hasPhoto && user.name?.[0]?.toUpperCase()}
          </Avatar>

          <Typography variant="h5" fontWeight={800} sx={{ mt: 2, color: 'text.primary', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            {user.name}
          </Typography>
          <Typography variant="body2" fontWeight={600} color="primary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>
            {user.designation || currentRoleName}
          </Typography>

          <Box display="flex" justifyContent="center" gap={1} mb={3}>
            <Box 
              sx={{ 
                px: 1.5, py: 0.5, borderRadius: 5, bgcolor: 'rgba(59, 130, 246, 0.1)', 
                display: 'flex', alignItems: 'center', gap: 0.5 
              }}
            >
              <BadgeIcon sx={{ fontSize: 14, color: 'primary.main' }} />
              <Typography variant="caption" fontWeight={700} color="primary.main">
                {user.employeeProfileId || user._id}
              </Typography>
            </Box>
          </Box>

          {/* CONTACT INFO QUICK CARDS */}
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={1.5} mb={4}>
            <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'left' }}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" fontWeight={600} color="text.secondary">Email</Typography>
              </Box>
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
                {user.email}
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'left' }}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" fontWeight={600} color="text.secondary">Phone</Typography>
              </Box>
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                {user.phone || 'N/A'}
              </Typography>
            </Box>
          </Box>

          {/* DETAILED INFO SECTION */}
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="overline" fontWeight={800} color="text.disabled" sx={{ px: 1 }}>
              Work Information
            </Typography>
            <Box sx={{ mt: 1, mb: 3, p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #f1f5f9' }}>
              <InfoRow icon={BusinessIcon} label="Department" value={user.departmentName || 'N/A'} />
              <InfoRow icon={BadgeIcon} label="Designation" value={user.designation || 'N/A'} />
              <InfoRow icon={SupervisorAccountIcon} label="Manager" value={user.managerName || 'N/A'} />
              <InfoRow 
                icon={CalendarTodayIcon} 
                label="Joined" 
                value={user.joiningDate ? new Date(user.joiningDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Recently'} 
              />
            </Box>

            <Typography variant="overline" fontWeight={800} color="text.disabled" sx={{ px: 1 }}>
              Roles & Permissions
            </Typography>
            <Box sx={{ mt: 1, mb: 3, p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #f1f5f9' }}>
              <InfoRow icon={ShieldIcon} label="Current Role" value={currentRoleName} color="primary.main" />
              <InfoRow icon={GroupIcon} label="All Roles" value={allRolesList} />
            </Box>

            <Typography variant="overline" fontWeight={800} color="text.disabled" sx={{ px: 1 }}>
              Personal Details
            </Typography>
            <Box sx={{ mt: 1, p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #f1f5f9' }}>
              <InfoRow icon={getGenderIcon(user.gender)} label="Gender" value={user.gender || 'N/A'} />
              <InfoRow icon={LocationOnIcon} label="Office Location" value={user.branch || 'Head Office'} />
              <Box mt={1.5} pt={1.5} borderTop="1px dashed #e2e8f0">
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  <LocationOnIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} /> Registered Address
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {user.address || 'Address not provided'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', gap: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<VisibilityIcon />}
          onClick={handlePreviewVisitingCard}
          sx={{ 
            py: 1.2, borderRadius: 3, fontWeight: 700, textTransform: 'none',
            borderWidth: 2, "&:hover": { borderWidth: 2 }
          }}
        >
          Preview Card
        </Button>
        <Button
          fullWidth
          variant="contained"
          startIcon={<ShareIcon />}
          onClick={handleShareOpen}
          sx={{ 
            py: 1.2, borderRadius: 3, fontWeight: 700, textTransform: 'none',
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)'
          }}
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
