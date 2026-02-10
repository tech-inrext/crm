export const GRADIENTS = {
  primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  paper: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  button: "linear-gradient(45deg, #667eea, #764ba2)",
  buttonHover: "linear-gradient(45deg, #5a6fd8, #6a42a0)",
};

export const COMMON_STYLES = {
  roundedPaper: {
    borderRadius: 4,
    background: GRADIENTS.paper,
    border: "1px solid rgba(255,255,255,0.2)",
    backdropFilter: "blur(10px)",
  },
  iconButton: (bg: string, hover?: string) => ({
    backgroundColor: bg,
    color: "white",
    "&:hover": { backgroundColor: hover || `${bg}99` },
  }),
  gradientText: {
    background: GRADIENTS.button,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
};
