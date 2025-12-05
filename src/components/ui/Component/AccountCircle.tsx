import React from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { SvgIconProps } from "@mui/material/SvgIcon";

interface AccountCircleIconComponentProps extends SvgIconProps {}

const AccountCircleIconComponent: React.FC<AccountCircleIconComponentProps> = (props) => {
  return <AccountCircleIcon {...props} />;
};

export default AccountCircleIconComponent;
