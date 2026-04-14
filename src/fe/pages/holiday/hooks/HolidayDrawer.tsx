"use client";

import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  FormControlLabel,
  Checkbox,
  Stack,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function HolidayDrawer({ open, onClose }) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 350, p: 2 }}>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6">Holiday Details</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography sx={{ mt: 2 }}>Diwali</Typography>
        <Typography variant="body2">Nov 12, 2026</Typography>

        <Chip label="Festival" color="secondary" sx={{ mt: 1 }} />

        <Typography sx={{ mt: 2 }}>Campaign: Active</Typography>
        <Typography>Leads: 120</Typography>

        <Box sx={{ mt: 2 }}>
          <FormControlLabel control={<Checkbox />} label="Email" />
          <FormControlLabel control={<Checkbox />} label="WhatsApp" />
          <FormControlLabel control={<Checkbox />} label="SMS" />
        </Box>

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained">Run Campaign</Button>
          <Button color="error">Delete</Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
