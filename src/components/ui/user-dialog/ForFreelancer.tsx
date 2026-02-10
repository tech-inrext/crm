import React, { useRef, useState, useMemo, useEffect } from "react";
import { Box, MenuItem, TextField, Typography } from "@/components/ui/Component";
import { Field, FieldProps } from "formik";
import { FIELD_LABELS } from "@/constants/users";

type BranchKey = "Noida" | "Lucknow" | "Patna" | "Delhi";

const ForFreelancer: React.FC = () => {
  const slabRef = useRef<HTMLDivElement | null>(null);
  const branchRef = useRef<HTMLDivElement | null>(null);

  const [slabWidth, setSlabWidth] = useState<number | undefined>(undefined);
  const [branchWidth, setBranchWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") {
      const measure = () => {
        if (slabRef.current)
          setSlabWidth(slabRef.current.getBoundingClientRect().width);
        if (branchRef.current)
          setBranchWidth(branchRef.current.getBoundingClientRect().width);
      };
      measure();
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const slabObs = new ResizeObserver((entries) => {
      for (const e of entries)
        if (e.target === slabRef.current) setSlabWidth(e.contentRect.width);
    });
    const branchObs = new ResizeObserver((entries) => {
      for (const e of entries)
        if (e.target === branchRef.current) setBranchWidth(e.contentRect.width);
    });

    if (slabRef.current) slabObs.observe(slabRef.current);
    if (branchRef.current) branchObs.observe(branchRef.current);

    return () => {
      slabObs.disconnect();
      branchObs.disconnect();
    };
  }, []);

  const BRANCH_LABELS: Record<BranchKey, string> = useMemo(
    () => ({
      Noida:
        "Noida: 3rd floor, D4, Block -D, Sector -10, Noida, Uttar Pradesh 201301.",
      Lucknow:
        "Lucknow: 312, Felix, Square, Sushant Golf City, Lucknow 226030.",
      Patna:
        "Patna: 4th floor, Pandey Plaza, Exhibition Road, Patna, Bihar 800001.",
      Delhi: "Plot No. 29, 4th Floor, Moti Nagar, New Delhi-110015",
    }),
    []
  );

  const slabOptions = useMemo(
    () => ["", "100", "95", "90", "80", "70", "60", "50"],
    []
  );

  const renderBranchValue = (selected: string) => {
    const text =
      (BRANCH_LABELS as Record<string, string>)[selected] || selected || "";
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
            <Box ref={slabRef} sx={{ flex: 1 }}>
              <TextField
                {...field}
                label={FIELD_LABELS.SLAB_PERCENTAGE}
                select
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
                error={Boolean(meta.touched && meta.error)}
                helperText={
                  meta.touched && meta.error ? String(meta.error) : undefined
                }
                sx={{ bgcolor: "#fff", borderRadius: 1 }}
              >
                {slabOptions.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt === ""
                      ? "Select a slab"
                      : `${opt}%` +
                        (opt === "100"
                          ? " President"
                          : opt === "95"
                          ? " V.P."
                          : opt === "90"
                          ? " A.V.P. (Core Member)"
                          : opt === "80"
                          ? " General Manager"
                          : opt === "70"
                          ? " Senior Manager"
                          : opt === "60"
                          ? " Manager"
                          : " (Sales Executive)")}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}
        </Field>

        <Field name="branch">
          {({ field, meta }: FieldProps) => (
            <Box ref={branchRef} sx={{ flex: 1 }}>
              <TextField
                {...field}
                label={FIELD_LABELS.BRANCH}
                select
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
                  renderValue: renderBranchValue,
                }}
                fullWidth
                margin="normal"
                error={Boolean(meta.touched && meta.error)}
                helperText={
                  meta.touched && meta.error ? String(meta.error) : undefined
                }
                sx={{ bgcolor: "#fff", borderRadius: 1 }}
              >
                <MenuItem value="Noida">
                  <Box
                    sx={{ whiteSpace: "pre-line" }}
                  >{`Noida: 3rd floor, D4, Block -D,\nSector-10, Noida, Uttar Pradesh 201301.`}</Box>
                </MenuItem>
                <MenuItem value="Lucknow">
                  <Box
                    sx={{ whiteSpace: "pre-line" }}
                  >{`Lucknow: 312, Felix, Square,\nSushant Golf City, Lucknow 226030.`}</Box>
                </MenuItem>
                <MenuItem value="Patna">
                  <Box
                    sx={{ whiteSpace: "pre-line" }}
                  >{`Patna: 4th floor, Pandey Plaza,\nExhibition Road, Patna, Bihar 800001.`}</Box>
                </MenuItem>
                <MenuItem value="Delhi">
                  <Box
                    sx={{ whiteSpace: "pre-line" }}
                  >{`New Delhi: Plot No. 29, 4th Floor, Moti Nagar,\nNew Delhi-110015`}</Box>
                </MenuItem>
              </TextField>
            </Box>
          )}
        </Field>
      </Box>
    </>
  );
};

export default ForFreelancer;
