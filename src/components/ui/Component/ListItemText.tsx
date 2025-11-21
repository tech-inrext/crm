import React from "react";
import ListItemText, { ListItemTextProps } from "@mui/material/ListItemText";

interface ListItemTextComponentProps extends ListItemTextProps {}

const ListItemTextComponent: React.FC<ListItemTextComponentProps> = (props) => {
  return <ListItemText {...props} />;
};

export default ListItemTextComponent;