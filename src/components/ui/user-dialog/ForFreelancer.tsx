import React, { useRef, useState, useEffect } from "react";
import { Box, MenuItem, TextField, Typography } from "@mui/material";
import { Field, FieldProps } from "formik";
import { FIELD_LABELS } from "@/constants/users";

const ForFreelancer: React.FC = () => {
  const slabRef = useRef<HTMLElement | null>(null);
  const branchRef = useRef<HTMLElement | null>(null);

  const [slabWidth, setSlabWidth] = useState<number | undefined>(undefined);
  const [branchWidth, setBranchWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    const measure = () => {
      const measureEl = (el: any) => {
        if (!el) return undefined;
        if (typeof el.getBoundingClientRect === "function") {
          return el.getBoundingClientRect().width;
        }
        if (typeof el.offsetWidth === "number") return el.offsetWidth;
        if (typeof el.clientWidth === "number") return el.clientWidth;
        return undefined;
      };

      setSlabWidth(measureEl(slabRef.current));
      setBranchWidth(measureEl(branchRef.current));
    };

    const raf = requestAnimationFrame(measure);
    const onResize = () => requestAnimationFrame(measure);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  const BRANCH_LABELS: Record<string, string> = {
    Noida:
      "Noida: 3rd floor, D4, Block -D, Sector-10, Noida, Uttar Pradesh 201301.",
    Lucknow: "Lucknow: 312, Felix, Square, Sushant Golf City, Lucknow 226030.",
    Patna:
      "Patna: 4th floor, Pandey Plaza, Exhibition Road, Patna, Bihar 800001.",
  };

  return (
    <>
      <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
        {FIELD_LABELS.FOR_FREELANCER}
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mt: 1,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Field name="slabPercentage">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              label={FIELD_LABELS.SLAB_PERCENTAGE}
              select
              ref={(el: any) => (slabRef.current = el)}
              SelectProps={{
                MenuProps: {
                  disablePortal: true,
                  PaperProps: {
                    style: {
                      maxHeight: 240,
                      width: slabWidth ? slabWidth + 8 : undefined,
                      whiteSpace: "normal",
                      boxSizing: "border-box",
                    },
                  },
                },
              }}
              fullWidth
              margin="normal"
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
            >
              <MenuItem value="">Select a slab</MenuItem>
              <MenuItem value="100">100% (VP)</MenuItem>
              <MenuItem value="90">90% (AVP)</MenuItem>
              <MenuItem value="80">80% (General Manager Sales)</MenuItem>
              <MenuItem value="70">70% (Sr. Manager Sales)</MenuItem>
              <MenuItem value="60">60% (Manager Sales)</MenuItem>
              <MenuItem value="50">50% (Sales Executive)</MenuItem>
            </TextField>
          )}
        </Field>

        <Field name="branch">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              label={FIELD_LABELS.BRANCH}
              select
              ref={(el: any) => (branchRef.current = el)}
              SelectProps={{
                MenuProps: {
                  disablePortal: true,
                  PaperProps: {
                    style: {
                      maxHeight: 240,
                      width: branchWidth ? branchWidth + 8 : undefined,
                      boxSizing: "border-box",
                    },
                  },
                },
                renderValue: (selected: any) => {
                  const text = BRANCH_LABELS[selected] || selected || "";
                  return (
                    <span
                      style={{
                        display: "block",
                        fontSize: 13,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {text}
                    </span>
                  );
                },
              }}
              fullWidth
              margin="normal"
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
            >
              <MenuItem value="Noida">
                <Box sx={{ whiteSpace: "pre-line" }}>
                  {`Noida: 3rd floor, D4, Block -D,
Sector-10, Noida, Uttar Pradesh 201301.`}
                </Box>
              </MenuItem>
              <MenuItem value="Lucknow">
                <Box sx={{ whiteSpace: "pre-line" }}>
                  {`Lucknow: 312, Felix, Square,
Sushant Golf City, Lucknow 226030.`}
                </Box>
              </MenuItem>
              <MenuItem value="Patna">
                <Box sx={{ whiteSpace: "pre-line" }}>
                  {`Patna: 4th floor, Pandey Plaza,
Exhibition Road, Patna, Bihar 800001.`}
                </Box>
              </MenuItem>
            </TextField>
          )}
        </Field>
      </Box>
    </>
  );
};

export default ForFreelancer;
