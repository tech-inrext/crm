import React from "react";
import Menu, { MenuProps } from "@mui/material/Menu";
import MenuItem, { MenuItemProps } from "@mui/material/MenuItem";

interface ProfileMenuProps extends Omit<MenuProps, 'children'> {
  menuItems?: Array<{
    label: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    divider?: boolean;
  }>;
  children?: React.ReactNode;
}

interface ProfileMenuItemProps extends MenuItemProps {
  children?: React.ReactNode;
}

const ProfileMenuComponent: React.FC<ProfileMenuProps> = ({
  menuItems,
  children,
  ...props
}) => {
  return (
    <Menu {...props}>
      {menuItems ? (
        menuItems.map((item, index) => (
          <MenuItem key={index} onClick={item.onClick}>
            {item.icon && <span style={{ marginRight: 8 }}>{item.icon}</span>}
            {item.label}
          </MenuItem>
        ))
      ) : (
        children
      )}
    </Menu>
  );
};

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({
  children,
  ...props
}) => {
  return <MenuItem {...props}>{children}</MenuItem>;
};

export default ProfileMenuComponent;
export { ProfileMenuItem };
