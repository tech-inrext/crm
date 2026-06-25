import React, { ReactNode } from "react";
import Button, { ButtonProps } from "@mui/material/Button";

interface ButtonComponentProps extends ButtonProps {
  children?: ReactNode;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({
  children,
  sx,
  color,
  ...props
}) => {
  const isSecondary = color === "secondary";

  const defaultSx = {
    minWidth: { xs: "auto", sm: 140 },
    height: { xs: 42, sm: 38 },
    borderRadius: 1.5,
    fontWeight: 500,
    fontSize: { xs: "0.85rem", sm: "0.95rem" },
    textTransform: "none",
    backgroundColor: isSecondary ? "#f1f5f9" : "#e8f1ff",
    color: isSecondary ? "#475569" : "#1e5fbf",
    boxShadow: "none",
    border: isSecondary
      ? "1px solid rgba(71, 85, 105, 0.18)"
      : "1px solid rgba(30, 95, 191, 0.18)",
    "& .MuiButton-startIcon": {
      marginRight: "6px",
    },
    "&:hover": {
      backgroundColor: isSecondary ? "#e2e8f0" : "#deebff",
      borderColor: isSecondary
        ? "rgba(71, 85, 105, 0.28)"
        : "rgba(30, 95, 191, 0.28)",
      boxShadow: "none",
    },
  };

  return (
    <Button sx={{ ...defaultSx, ...sx }} color={color} {...props}>
      {children}
    </Button>
  );
};

export default ButtonComponent;
