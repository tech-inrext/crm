"use client";

import React, { useEffect, useRef, useState } from "react";
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
  Box,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import Quill from "quill";
import "quill/dist/quill.snow.css";

export default function HolidayDialog({
  open,
  onClose,
  holiday,
  setHoliday,
  onSubmit,
}) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const [editorFocused, setEditorFocused] = useState(false);

  /* ---------------- QUILL INIT ---------------- */
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      if (!editorRef.current) return;

      // cleanup old instance
      if (quillRef.current) {
        quillRef.current.off("text-change");
        quillRef.current.off("selection-change");
        quillRef.current = null;
      }

      const quill = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"],
            ["link"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["clean"],
          ],
        },
      });

      // styling same as notice
      const ql = quill.root;
      ql.style.fontSize = "1rem";
      ql.style.fontFamily =
        '"Roboto", "Helvetica", "Arial", sans-serif';
      ql.style.padding = "8.5px 14px";
      ql.style.minHeight = "56px";
      ql.style.lineHeight = "1.4375em";

      // set existing value (edit case)
      if (holiday.description) {
        quill.clipboard.dangerouslyPasteHTML(holiday.description);
      }

      quill.on("text-change", () => {
        const html = quill.root.innerHTML;
        setHoliday({
          ...holiday,
          description: html === "<p><br></p>" ? "" : html,
        });
      });

      quill.on("selection-change", (range) => {
        setEditorFocused(!!range);
      });

      quillRef.current = quill;
    }, 100);

    return () => clearTimeout(timer);
  }, [open]);

  /* ---------------- UI ---------------- */
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Add Holiday
        <IconButton
          onClick={onClose}
          className="!absolute !right-4 !top-4"
        >
          <CloseIcon />
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

          {/* ✅ QUILL DESCRIPTION (REPLACED TEXTFIELD) */}
          <FormControl
            fullWidth
            size="small"
            className={`!rounded-md !border ${
              editorFocused ? "!border-blue-500" : "!border-gray-300"
            }`}
          >
            <InputLabel
              shrink={!!holiday.description || editorFocused}
              className="!bg-white !px-1"
            >
              Description
            </InputLabel>

            <Box
              className="!rounded-md cursor-text"
              onClick={() => quillRef.current?.focus()}
            >
              <div ref={editorRef} />
            </Box>
          </FormControl>

          {!holiday.description && (
            <Typography className="text-gray-400 text-sm">
              Enter holiday description...
            </Typography>
          )}
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