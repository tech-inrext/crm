"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";

export default function HolidayDialog({
  open,
  onClose,
  holiday,
  setHoliday,
  onSubmit,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Add Holiday
        <IconButton
          onClick={onClose}
          className="!absolute !right-4 !top-4"
        >
          ✕
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {/* HOLIDAY NAME */}
          <TextField
            label="Holiday Name"
            value={holiday.name}
            onChange={(e) =>
              setHoliday({ ...holiday, name: e.target.value })
            }
            fullWidth
            size="small"
          />

          {/* TYPE + IMPACT */}
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={holiday.type}
                label="Type"
                onChange={(e) =>
                  setHoliday({ ...holiday, type: e.target.value })
                }
              >
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="company">Company</MenuItem>
                <MenuItem value="optional">Optional</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Impact</InputLabel>
              <Select
                value={holiday.impact_level}
                label="Impact"
                onChange={(e) =>
                  setHoliday({
                    ...holiday,
                    impact_level: e.target.value,
                  })
                }
              >
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* APPLICABLE + DATE */}
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Applicable To</InputLabel>
              <Select
                value={holiday.applicable_to}
                label="Applicable To"
                onChange={(e) =>
                  setHoliday({
                    ...holiday,
                    applicable_to: e.target.value,
                  })
                }
              >
                <MenuItem value="all">All Employees</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
                <MenuItem value="support">Support</MenuItem>
              </Select>
            </FormControl>

            <TextField
              type="date"
              label="Holiday Date"
              InputLabelProps={{ shrink: true }}
              value={holiday.date}
              onChange={(e) =>
                setHoliday({ ...holiday, date: e.target.value })
              }
              fullWidth
              size="small"
            />
          </Stack>

          {/* DESCRIPTION */}
          <TextField
            label="Description"
            multiline
            rows={3}
            value={holiday.description}
            onChange={(e) =>
              setHoliday({
                ...holiday,
                description: e.target.value,
              })
            }
            fullWidth
            size="small"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit}>
          Save Holiday
        </Button>
      </DialogActions>
    </Dialog>
  );
}