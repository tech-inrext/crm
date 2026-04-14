import React from "react";
import Tabs, { TabsProps } from "@mui/material/Tabs";

interface TabsComponentProps extends TabsProps {
  children?: React.ReactNode;
}

const TabsComponent: React.FC<TabsComponentProps> = ({
  children,
  ...props
}) => {
  return <Tabs {...props}>{children}</Tabs>;
};

export default TabsComponent;
