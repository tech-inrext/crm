"use client";
import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Stack,
} from "@mui/material";
import { Check, Refresh } from "@mui/icons-material";

interface MouListProps {
  items: any[];
  loading: boolean;
  onMarkComplete: (id: string) => Promise<void>;
}

const MouList: React.FC<MouListProps> = ({
  items,
  loading,
  onMarkComplete,
}) => {
  return (
    <Box>
      <Grid container spacing={2}>
        {items.map((emp) => (
          <Grid item xs={12} sm={6} md={4} key={emp._id}>
            <Paper sx={{ p: 2 }} elevation={2}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>{emp.name}</Typography>
                  <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                    {emp.email}
                  </Typography>
                  {emp.designation && (
                    <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                      {emp.designation}
                    </Typography>
                  )}
                </Box>
                <Stack direction="column" spacing={1} alignItems="flex-end">
                  <Chip
                    label={emp.mouStatus || "-"}
                    color={
                      emp.mouStatus === "Completed" ? "success" : "warning"
                    }
                    size="small"
                  />
                  <IconButton
                    size="small"
                    title="Mark Completed"
                    onClick={async () => {
                      if (!emp._id) return;
                      try {
                        await onMarkComplete(emp._id);
                      } catch (e) {
                        // swallow — caller will handle error toast
                      }
                    }}
                  >
                    <Check fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MouList;
