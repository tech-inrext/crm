import React, { useEffect, useState } from "react";
import {
  Menu,
  Box,
  Typography,
  Avatar,
  Stack,
  Divider,
} from "@mui/material";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

interface AssignedDropdownProps {
  assignedTo: any;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onAssign: (user: any) => void;
}

const ROW_HEIGHT = 52; // Height per member row
const VISIBLE_ROWS = 3;

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
        if (res.data.success) {
          setTeamMembers(res.data.team || []);
        }
      } catch (error) {
        console.error("Failed to fetch team members:", error);
      }
    };

    if (anchorEl) fetchTeamMembers();
  }, [anchorEl]);

  /* ---------- Flatten Hierarchy ---------- */
  const flattenTeamMembers = (members: any[]): any[] => {
    const flattened: any[] = [];

    const traverse = (list: any[]) => {
      list?.forEach((m) => {
        flattened.push(m);
        if (m.children?.length) traverse(m.children);
      });
    };

    traverse(members);
    return flattened;
  };

  const allMembers = flattenTeamMembers(teamMembers);

  const handleAssign = (member: any) => {
    onAssign(member);
    onClose();
  };

  /* ---------- Member Row ---------- */
  const MemberRow = ({ member }: { member: any }) => {
    const isAssigned =
      assignedTo?._id?.toString() === member?._id?.toString();

    return (
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{
          px: 2,
          py: 1,
          cursor: "pointer",
          borderRadius: 2,
          backgroundColor: isAssigned ? "#e0f2fe" : "transparent",
          "&:hover": {
            backgroundColor: "#f1f5f9",
          },
        }}
        onClick={() => handleAssign(member)}
      >
        <Avatar src={member?.avatar} sx={{ width: 32, height: 32 }}>
          {member?.name?.[0]}
        </Avatar>

        <Typography fontSize={14} fontWeight={500}>
          {member?.name}
        </Typography>
      </Stack>
    );
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      PaperProps={{
        sx: {
          width: 260,
          borderRadius: 3,
          p: 1,
        },
      }}
    >
      {/* ---------- Suggested ---------- */}
      <Typography
        sx={{
          px: 2,
          pt: 1,
          pb: 0.5,
          fontSize: 12,
          fontWeight: 600,
          color: "text.secondary",
        }}
      >
        SUGGESTED
      </Typography>

      {user && (
        <MemberRow member={{ ...user, name: "Assign to Me" }} />
      )}

      <Divider sx={{ my: 1 }} />

      {/* ---------- All Agents ---------- */}
      <Typography
        sx={{
          px: 2,
          pb: 0.5,
          fontSize: 12,
          fontWeight: 600,
          color: "text.secondary",
        }}
      >
        ALL AGENTS
      </Typography>

      <Box
        sx={{
          maxHeight: ROW_HEIGHT * VISIBLE_ROWS,
          overflowY: "auto",
        }}
      >
        {allMembers.map((member) => (
          <MemberRow key={member._id} member={member} />
        ))}
      </Box>
    </Menu>
  );
};

export default AssignedDropdown;
