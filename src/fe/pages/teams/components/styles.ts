import { SxProps, Theme, alpha } from "@/components/ui/Component";

export const hierarchyHeaderSx: SxProps<Theme> = {
  p: 2,
  mb: 2,
  display: "flex",
  alignItems: "center",
  gap: 2,
  justifyContent: "space-between",
  flexWrap: "wrap",
};

export const headerStackSx: SxProps<Theme> = {
  flex: 1,
};

export const headerIconSx: SxProps<Theme> = {
  color: "#3f51b5",
  fontSize: 32,
};

export const headerTitleSx: SxProps<Theme> = {
  fontWeight: 800,
};

export const headerSubtitleSx: SxProps<Theme> = {
  color: "text.secondary",
};

export const controlsStackSx: SxProps<Theme> = {
  mt: { xs: 2, md: 0 },
  flexWrap: "wrap",
};

export const totalMembersChipSx: SxProps<Theme> = {
  fontWeight: 600,
};

export const managerAutocompleteSx: SxProps<Theme> = {
  width: 280,
};

export const searchTextFieldSx: SxProps<Theme> = {
  minWidth: 240,
};

export const searchIconSx: SxProps<Theme> = {
  mr: 1,
  color: "text.secondary",
};

export const clearButtonSx: SxProps<Theme> = {
  mr: -1,
};

export const treeHeaderSx: SxProps<Theme> = {
  mb: 3,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 2,
};

export const treeHeaderStackSx: SxProps<Theme> = {
  flexWrap: "wrap",
};

export const nodeWrapperSx: SxProps<Theme> = {
  mb: 0.5,
};

export const nodeNameSx: SxProps<Theme> = {
  fontWeight: 600,
  color: "text.primary",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const nodeChipsStackSx: SxProps<Theme> = {
  mt: 0.5,
  flexWrap: "wrap",
};

export const nodeChipSx: SxProps<Theme> = {
  fontSize: 11,
  height: 20,
};

export const childrenCollapseWrapper1Sx: SxProps<Theme> = {
  pl: 3,
  mt: 1,
  position: "relative",
};

export const nodeCardSx = (nodeColor: string, isSelected: boolean): SxProps<Theme> => ({
  borderLeft: `4px solid ${nodeColor}`,
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  bgcolor: isSelected ? alpha(nodeColor, 0.1) : "transparent",
  "&:hover": {
    bgcolor: alpha(nodeColor, 0.05),
    transform: "translateX(4px)",
    boxShadow: 1,
  }
})

export const expandButtonSx = (nodeColor: string): SxProps<Theme> => ({
  bgcolor: alpha(nodeColor, 0.1),
  "&:hover": { bgcolor: alpha(nodeColor, 0.2) },
})

export const avatarSx = (nodeColor: string): SxProps<Theme> => ({
  bgcolor: nodeColor,
  width: 40,
  height: 40,
  fontSize: 16,
  fontWeight: 600,
})

export const childrenCollapseWrapper2Sx = (nodeColor: string): SxProps<Theme> => ({
  position: "absolute",
  left: 12,
  top: 0,
  bottom: 0,
  width: 2,
  bgcolor: alpha(nodeColor, 0.2),
})

export const loadingStateSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  p: 8,
}

export const mainBoxSx: SxProps<Theme> = {
  p: { xs: 1, sm: 2, md: 3 },
  pt: { xs: 2, sm: 3, md: 4 },
  minHeight: "100vh",
  bgcolor: "background.default",
  width: "100%",
  overflow: "hidden",
}