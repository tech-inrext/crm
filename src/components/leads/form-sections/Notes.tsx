import React from "react";
import { Box, TextField, Typography, Button } from "@mui/material";
import { Field, FieldProps, FieldArray } from "formik";

interface NotesProps {
  values: any;
  setFieldValue: (field: string, value: any) => void;
}

const Notes: React.FC<NotesProps> = ({ values, setFieldValue }) => (
  <>
    <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
      Notes
    </Typography>

    <FieldArray name="followUpNotes">
      {({ push, remove }) => (
        <Box>
          {values.followUpNotes.map((note: any, index: number) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                gap: 2,
                mb: 2,
                p: 2,
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                bgcolor: "#fff",
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Field name={`followUpNotes.${index}.note`}>
                  {({ field, meta }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Note"
                      multiline
                      rows={2}
                      value={values.followUpNotes[index]?.note || ""}
                      onChange={(e) =>
                        setFieldValue(
                          `followUpNotes.${index}.note`,
                          e.target.value
                        )
                      }
                      error={meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      placeholder="Enter note..."
                      inputProps={{ "aria-label": `note ${index + 1}` }}
                      sx={{ width: "100%" }}
                    />
                  )}
                </Field>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {values.followUpNotes.length > 1 && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => remove(index)}
                    sx={{ minWidth: "auto", px: 1 }}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            </Box>
          ))}

          <Box sx={{ mt: 1 }}>
            <Button
              variant="outlined"
              onClick={() =>
                push({
                  note: "",
                  date: new Date().toISOString().split("T")[0],
                })
              }
              disabled={
                values.followUpNotes.length > 0 &&
                values.followUpNotes.some((note: any) => !note.note?.trim())
              }
            >
              Add a note
            </Button>
            {values.followUpNotes.length > 0 &&
              values.followUpNotes.some((note: any) => !note.note?.trim()) && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 1,
                    color: "text.secondary",
                    fontStyle: "italic",
                  }}
                >
                  Please fill in all existing notes before adding a new one
                </Typography>
              )}
          </Box>
        </Box>
      )}
    </FieldArray>
  </>
);

export default Notes;
