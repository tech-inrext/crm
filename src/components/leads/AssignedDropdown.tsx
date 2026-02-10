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
      <div
        className={`flex items-center px-4 py-2 cursor-pointer rounded-lg ${isAssigned ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
        onClick={() => handleAssign(member)}
      >
        <Avatar src={member?.avatar} className="w-8 h-8">
          {member?.name?.[0]}
        </Avatar>

        <Typography className="text-sm font-medium ml-2">
          {member?.name}
        </Typography>
      </div>
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
        className: "w-64 rounded-lg p-4 overflow-hidden", // removed mt-6
        style: { marginTop: 0 }, // ensure no extra margin
      }}
    >
      {/* ---------- Suggested ---------- */}
      <Typography className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-500">
        SUGGESTED
      </Typography>

      {user && (
        <MemberRow member={{ ...user, name: "Assign to Me" }} />
      )}

      <Divider className="my-2" />

      {/* ---------- All Agents ---------- */}
      <Typography className="px-4 pb-1 text-xs font-semibold text-gray-500">
        ALL AGENTS
      </Typography>

      <Box className="max-h-[calc(52px*3)] overflow-y-auto">
        {allMembers.map((member) => (
          <MemberRow key={member._id} member={member} />
        ))}
      </Box>
    </Menu>
  );
};

export default AssignedDropdown;
