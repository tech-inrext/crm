// =============================
"use client";

import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  CardActions,
  Button,
} from "@mui/material";

export default function ListView() {
  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      {[1, 2, 3].map((i) => (
        <Grid item xs={12} md={4} key={i}>
          <Card>
            <CardContent>
              <Typography variant="h6">Diwali</Typography>
              <Typography variant="body2">Nov 12, 2026</Typography>
              <Chip label="Festival" color="secondary" sx={{ mt: 1 }} />
            </CardContent>
            <CardActions>
              <Button size="small">Edit</Button>
              <Button size="small" variant="contained">
                Run Campaign
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
