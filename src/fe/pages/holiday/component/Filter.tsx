"use client";

import React from "react";
import { Stack, TextField, MenuItem } from "@mui/material";

export default function Filters() {
  return (
    <Stack direction="row" spacing={2} sx={{ p: 2 }}>
      <TextField select size="small" label="Year" defaultValue="2026">
        <MenuItem value="2026">2026</MenuItem>
        <MenuItem value="2025">2025</MenuItem>
      </TextField>

      <TextField select size="small" label="Type" defaultValue="all">
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="festival">Festival</MenuItem>
        <MenuItem value="public">Public</MenuItem>
        <MenuItem value="company">Company</MenuItem>
      </TextField>

      <TextField size="small" placeholder="Search holidays..." />
    </Stack>
  );
}
