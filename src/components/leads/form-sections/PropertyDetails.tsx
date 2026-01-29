import React, { useEffect, useState } from "react";
import { Box, TextField, Typography, MenuItem } from "@/components/ui/Component";
import { Field, FieldProps } from "formik";

const propertyTypeOptions = [
  // { value: "Rent", label: "Rent" },
  // { value: "Buy", label: "Buy" },
  // { value: "Sell", label: "Sell" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "plot", label: "Plot" },
];

const budgetRangeOptions = [
  { value: "<1 Lakh", label: "<1 Lakh" },
  { value: "1 Lakh to 10 Lakh", label: "1 Lakh to 10 Lakh" },
  { value: "10 Lakh to 20 Lakh", label: "10 Lakh to 20 Lakh" },
  { value: "20 Lakh to 30 Lakh", label: "20 Lakh to 30 Lakh" },
  { value: "30 Lakh to 50 Lakh", label: "30 Lakh to 50 Lakh" },
  { value: "50 Lakh to 1 Crore", label: "50 Lakh to 1 Crore" },
  { value: ">1 Crore", label: ">1 Crore" },
];

interface PropertyDetailsProps {
  values: any;
  setFieldValue: (field: string, value: any) => void;
}

interface PropertyApiItem {
  projectName?: string;
  propertyName?: string;
}

interface PropertyOption {
  value: string;
  label: string;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  values,
  setFieldValue,
}) => {
  const [propertyOptions, setPropertyOptions] = useState<PropertyOption[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProperties = async () => {
      setIsLoadingProperties(true);
      try {
        const res = await fetch("/api/v0/property?parentOnly=true&limit=1000");
        const json = await res.json();

        if (!res.ok || !json?.success) {
          throw new Error(json?.message || "Failed to load properties");
        }

        const items: PropertyApiItem[] = Array.isArray(json.data) ? json.data : [];
        const options = items
          .map((item) => {
            const name = item.projectName || item.propertyName;
            if (!name) return null;
            return { value: name, label: name };
          })
          .filter(Boolean) as PropertyOption[];

        if (isMounted) {
          setPropertyOptions(options);
        }
      } catch {
        if (isMounted) {
          setPropertyOptions([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingProperties(false);
        }
      }
    };

    loadProperties();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
  <>
    <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
      Property Details
    </Typography>

    <Box
      sx={{
        display: "flex",
        gap: 2,
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      <Field name="propertyName">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            label="Property Name"
            select
            value={values.propertyName}
            onChange={(e) => setFieldValue("propertyName", e.target.value)}
            error={meta.touched && !!meta.error}
            helperText={meta.touched && meta.error}
            inputProps={{ "aria-label": "Property name" }}
            sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
            disabled={isLoadingProperties}
          >
            <MenuItem value="">
              {isLoadingProperties ? "Loading properties..." : "Select property name..."}
            </MenuItem>
            {propertyOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      </Field>

      <Field name="propertyType">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            label="Property Type"
            select
            value={values.propertyType}
            onChange={(e) => setFieldValue("propertyType", e.target.value)}
            error={meta.touched && !!meta.error}
            helperText={meta.touched && meta.error}
            inputProps={{ "aria-label": "Property type" }}
            sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
          >
            <MenuItem value="">Select property type...</MenuItem>
            {propertyTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      </Field>
    </Box>
    <Box
      sx={{
        display: "flex",
        gap: 2,
        flexDirection: { xs: "column", sm: "row" },
        mt: 2,
      }}
    >
      <Field name="budgetRange">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            label="Budget Range"
            select
            value={values.budgetRange}
            onChange={(e) => setFieldValue("budgetRange", e.target.value)}
            error={meta.touched && !!meta.error}
            helperText={meta.touched && meta.error}
            inputProps={{ "aria-label": "Budget range" }}
            sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
          >
            <MenuItem value="">Select budget range...</MenuItem>
            {budgetRangeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      </Field>

      <Field name="location">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            label="Location"
            value={values.location}
            onChange={(e) => setFieldValue("location", e.target.value)}
            error={meta.touched && !!meta.error}
            helperText={meta.touched && meta.error}
            placeholder="e.g., Bangalore, Whitefield"
            inputProps={{ "aria-label": "Property location" }}
            sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
          />
        )}
      </Field>
    </Box>
  </>
  );
};

export default PropertyDetails;
