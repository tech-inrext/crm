"use client";

import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";
import { useThemeContext } from "../../contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme } = useThemeContext();

  return (
    <Tooltip title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        sx={{
          width: 40,
          height: 40,
          bgcolor: mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
          "&:hover": {
            bgcolor: mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
          },
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            initial={{ y: -20, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {mode === "light" ? (
              <MdOutlineDarkMode size={20} />
            ) : (
              <MdOutlineLightMode size={20} />
            )}
          </motion.div>
        </AnimatePresence>
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
