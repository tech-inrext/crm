import React, { useEffect, useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import axios from "axios";

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
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await axios.get("/api/v0/employee/teams");
        if (response.data.success) {
          setTeamMembers(response.data.team);
        }
      } catch (error) {
        console.error("Failed to fetch team members:", error);
      }
    };

    if (anchorEl) {
      fetchTeamMembers();
    }
  }, [anchorEl]);

  const handleAssign = (user: any) => {
    onAssign(user);
    onClose();
  };

  const flattenTeamMembers = (members: any[]): any[] => {
    const flattened: any[] = [];

    const traverse = (members: any[]) => {
      members.forEach((member) => {
        flattened.push(member);
        if (member.children && member.children.length > 0) {
          traverse(member.children);
        }
      });
    };

    traverse(members);
    return flattened;
  };

  const flattenedMembers = flattenTeamMembers(teamMembers);

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{
        style: {
          maxHeight: 48 * 4.5,
          width: "20ch",
        },
      }}
    >
      {flattenedMembers.map((member) => (
        <MenuItem
          key={member._id}
          selected={assignedTo?._id === member._id}
          onClick={() => handleAssign(member)}
        >
          {member.name}
        </MenuItem>
      ))}
    </Menu>
  );
};

export default AssignedDropdown;
