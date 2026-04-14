import React from "react";
import Tab, { TabProps } from "@mui/material/Tab";

interface TabComponentProps extends TabProps {
  // Add any custom props here if needed
}

const TabComponent: React.FC<TabComponentProps> = ({
  ...props
}) => {
  return <Tab {...props} />;
};

export default TabComponent;
