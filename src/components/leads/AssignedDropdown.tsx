import React, { useEffect, useMemo, useState } from "react";
import {
  Menu,
  Box,
  Typography,
  Avatar,
  Divider,
  List,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

interface AssignedDropdownProps {
  assignedTo: any;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onAssign: (user: any) => void;
}

const AssignedDropdown: React.FC<AssignedDropdownProps> = ({
  assignedTo,
  anchorEl,
  onClose,
  onAssign,
}) => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  /* ---------- Fetch Team Members ---------- */
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const res = await axios.get("/api/v0/employee/teams");
        if (res?.data?.success) {
          setTeamMembers(res.data.team || []);
        }
      } catch (error) {
        console.error("Failed to fetch team members:", error);
      }
    };

    if (anchorEl) fetchTeamMembers();
  }, [anchorEl]);

  /* ---------- Flatten Hierarchy ---------- */
  const allMembers = useMemo(() => {
    const flattened: any[] = [];

    const traverse = (list: any[]) => {
      list?.forEach((m) => {
        flattened.push(m);
        if (m?.children?.length) traverse(m.children);
      });
    };

    traverse(teamMembers);
    return flattened;
  }, [teamMembers]);

  /* ---------- Assign Handler ---------- */
  const handleAssign = (member: any) => {
    onAssign(member);
    onClose();
  };

  /* ---------- Member Row ---------- */
  const MemberRow = ({ member }: { member: any }) => {
    const isAssigned = assignedTo?._id?.toString() === member?._id?.toString();

    return (
      <ListItemButton
        onClick={() => handleAssign(member)}
        selected={isAssigned}
        sx={{
          borderRadius: 1.5,
          mb: 0.4,
          py: 0.6,
          px: 1,
          transition: "all 0.2s ease",
          bgcolor: isAssigned ? "#F3E8FF" : "transparent",
          border: isAssigned ? "1px solid #C4B5FD" : "1px solid transparent",
          "&:hover": {
            bgcolor: isAssigned ? "#E9D5FF" : "#F9FAFB",
          },
        }}
      >
        <ListItemAvatar sx={{ minWidth: 36 }}>
          <Avatar
            src={member?.avatar}
            sx={{
              width: 30,
              height: 30,
              fontSize: 13,
              bgcolor: "#E9D5FF",
              color: "#6B21A8",
              fontWeight: 600,
            }}
          >
            {member?.name?.[0]?.toUpperCase() || "U"}
          </Avatar>
        </ListItemAvatar>

        <ListItemText
          primary={member?.name || "Unknown"}
          primaryTypographyProps={{
            fontSize: 13.5,
            fontWeight: 500,
            color: isAssigned ? "#6B21A8" : "#111827",
          }}
        />
      </ListItemButton>
    );
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      transformOrigin={{ vertical: "top", horizontal: "center" }}
      PaperProps={{
        sx: {
          width: 240,
          mt: 0.3,
          borderRadius: "12px",
          boxShadow: "0px 6px 18px rgba(0,0,0,0.08)",
          border: "1px solid #E5E7EB",
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          overflow: "hidden",
        },
      }}
    >
      {/* ---------- Suggested ---------- */}
      <Box sx={{ px: 1.5, pt: 1.4, pb: 0.6 }}>
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 600,
            color: "#9CA3AF",
            letterSpacing: 0.7,
            mb: 0.6,
          }}
        >
          SUGGESTED
        </Typography>

        {user && <MemberRow member={{ ...user, name: "Assign to Me" }} />}
      </Box>

      <Divider />

      {/* ---------- All Agents ---------- */}
      <Box sx={{ px: 1.5, pt: 0.8, pb: 0.5 }}>
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 600,
            color: "#9CA3AF",
            letterSpacing: 0.7,
            mb: 0.5,
          }}
        >
          ALL AGENTS
        </Typography>
      </Box>

      <List
        sx={{
          maxHeight: 190,
          overflowY: "auto",
          px: 1.5,
          pb: 1.5,
        }}
      >
        {allMembers.map((member) => (
          <MemberRow key={member?._id} member={member} />
        ))}
      </List>
    </Menu>
  );
};

export default AssignedDropdown;
