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
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
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
  const [search, setSearch] = useState("");

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

  /* ---------- Filtered Members ---------- */
  const filteredMembers = useMemo(() => {
    if (!search.trim()) return allMembers;

    return allMembers.filter((member) =>
      member?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, allMembers]);

  /* ---------- Assign Handler ---------- */
  const handleAssign = (member: any) => {
    onAssign(member);
    onClose();
  };

  /* ---------- Member Row ---------- */
  const MemberRow = ({ member }: { member: any }) => {
    const isAssigned =
      assignedTo?._id?.toString() === member?._id?.toString();

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
          border: isAssigned
            ? "1px solid #C4B5FD"
            : "1px solid transparent",
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
        className: `
          w-[240px]
          mt-[2px]
          rounded-xl
          shadow-[0px_6px_18px_rgba(0,0,0,0.08)]
          border border-gray-200
          rounded-tl-none
          rounded-tr-none
          overflow-hidden
        `,
      }}
    >
      {/* ---------- Suggested ---------- */}
      <Box className="px-1.5 pt-[5.6px] pb-[2.4px]">
        <Typography className="text-[10.5px] font-semibold text-gray-400 tracking-[0.7px] mb-[2.4px]">
          SUGGESTED
        </Typography>

        {user && <MemberRow member={{ ...user, name: "Assign to Me" }} />}
      </Box>

      <Divider />

      {/* ---------- All Agents ---------- */}
      <Box className="px-1.5 pt-[3.2px] pb-[2px]">
        <Typography className="text-[10.5px] font-semibold text-gray-400 tracking-[0.7px] mb-[4px]">
          ALL AGENTS
        </Typography>

        {/* Search Field */}
        <TextField
          size="small"
          fullWidth
          placeholder="Search team member..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
         className="mb-1 [&_.MuiOutlinedInput-root]:rounded-lg 
           [&_.MuiOutlinedInput-root]:text-[13px] 
           [&_.MuiOutlinedInput-root]:h-[34px]"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <List className="max-h-[170px] overflow-y-auto px-1.5 pb-1.5">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <MemberRow key={member?._id} member={member} />
          ))
        ) : (
          <Typography
            sx={{
              fontSize: 12,
              color: "#9CA3AF",
              textAlign: "center",
              py: 1,
            }}
          >
            No members found
          </Typography>
        )}
      </List>
    </Menu>
  );
};

export default AssignedDropdown;