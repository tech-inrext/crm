import React, { ReactNode } from "react";
import Button, { ButtonProps } from "@mui/material/Button";

interface ButtonComponentProps extends ButtonProps {
  children?: ReactNode;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({
  children,
  sx,
  ...props
}) => {
  const defaultSx = {
    minWidth: { xs: "auto", sm: 140 },
    height: { xs: 42, sm: 38 },
    borderRadius: 1.5,
    fontWeight: 500,
    fontSize: { xs: "0.85rem", sm: "0.95rem" },
    textTransform: "none",
    backgroundColor: "#e8f1ff",
    // color: "#1e5fbf",
    boxShadow: "none",
    border: "1px solid rgba(30, 95, 191, 0.18)",
    "& .MuiButton-startIcon": {
      marginRight: "6px",
    },
    "&:hover": {
      backgroundColor: "#deebff",
      borderColor: "rgba(30, 95, 191, 0.28)",
      boxShadow: "none",
    },
  };

  return (
    <Button sx={{ ...defaultSx, ...sx }} {...props}>
      {children}
    </Button>
  );
};

export default ButtonComponent;
