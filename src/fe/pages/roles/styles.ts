import { FAB_POSITION, GRADIENTS } from "@/fe/pages/roles/constants/roles";

export const rolesGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(auto-fill, minmax(240px, 1fr))",
    md: "repeat(auto-fill, minmax(260px, 1fr))",
    lg: "repeat(auto-fill, minmax(280px, 1fr))",
    xl: "repeat(auto-fill, minmax(300px, 1fr))",
  },
  gap: { xs: 2, sm: 2.5, md: 3 },
  mb: { xs: 2, sm: 3 },
  width: "100%",
  alignItems: "stretch",
};

export const roleCardWrapperSx = {
  display: "flex",
  minHeight: "100%",
};

export const addRoleButtonSx = {
  minWidth: 150,
  height: 40,
  fontWeight: 600,
  textTransform: "none",
};

export const fabStyle = {
  position: "fixed",
  bottom: FAB_POSITION.bottom,
  right: FAB_POSITION.right,
  zIndex: FAB_POSITION.zIndex,
  background: GRADIENTS.button,
  color: "#fff",
  display: { xs: "flex", md: "none" },
  "&:hover": { background: GRADIENTS.buttonHover },
};
