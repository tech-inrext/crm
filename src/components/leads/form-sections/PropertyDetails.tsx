<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { Box, TextField, Typography, MenuItem } from "@/components/ui/Component";
=======
import React from "react";
import {
  Box,
  TextField,
  Typography,
  MenuItem,
} from "@/components/ui/Component";
>>>>>>> fa33383460db150c6ab4c24480d46abbe3f90748
import { Field, FieldProps } from "formik";

const budgetRanges = [
  { value: "<1 Lakh", label: "<1 Lakh", min: 0, max: 100000 },
  { value: "1 Lakh to 10 Lakh", label: "1 Lakh to 10 Lakh", min: 100000, max: 1000000 },
  { value: "10 Lakh to 20 Lakh", label: "10 Lakh to 20 Lakh", min: 1000000, max: 2000000 },
  { value: "20 Lakh to 30 Lakh", label: "20 Lakh to 30 Lakh", min: 2000000, max: 3000000 },
  { value: "30 Lakh to 50 Lakh", label: "30 Lakh to 50 Lakh", min: 3000000, max: 5000000 },
  { value: "50 Lakh to 1 Crore", label: "50 Lakh to 1 Crore", min: 5000000, max: 10000000 },
  { value: ">1 Crore", label: ">1 Crore", min: 10000000, max: Number.POSITIVE_INFINITY },
];

interface PropertyDetailsProps {
  values: any;
  setFieldValue: (field: string, value: any) => void;
}

interface PropertyApiItem {
  _id?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  price?: string | number;
  propertyName?: string;
}

interface SubPropertyItem {
  propertyType?: string;
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
  const [propertyItems, setPropertyItems] = useState<PropertyApiItem[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [subPropertyTypeOptions, setSubPropertyTypeOptions] = useState<PropertyOption[]>([]);
  const [isLoadingSubProperties, setIsLoadingSubProperties] = useState(false);

  const mapPriceToBudgetRange = (price?: number | null) => {
    if (!price || Number.isNaN(price)) return "";

    const range = budgetRanges.find((item) => price >= item.min && price < item.max);
    return range?.value ?? "";
  };

  const extractNumericPrice = (value?: string | number | null) => {
    if (value === undefined || value === null) return null;
    if (typeof value === "number") return Number.isNaN(value) ? null : value;
    if (typeof value !== "string") return null;
    if (!value || value.toLowerCase().includes("contact")) return null;

    const numericString = value.replace(/[^\d.]/g, "");
    const parsed = parseFloat(numericString);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const formatPropertyTypeLabel = (value?: string) => {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

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
            if (!item.propertyName) return null;
            return { value: item.propertyName, label: item.propertyName };
          })
          .filter(Boolean) as PropertyOption[];

        if (isMounted) {
          setPropertyOptions(options);
          setPropertyItems(items);
        }
      } catch {
        if (isMounted) {
          setPropertyOptions([]);
          setPropertyItems([]);
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

  useEffect(() => {
    if (!values?.propertyName || propertyItems.length === 0) return;

    const selected = propertyItems.find(
      (item) => item.propertyName === values.propertyName
    );

    if (!selected) return;

    if (selected.location) {
      setFieldValue("location", selected.location);
    }

    const numericPrice =
      selected.maxPrice ??
      selected.minPrice ??
      extractNumericPrice(selected.price);

    const budgetRange = mapPriceToBudgetRange(numericPrice ?? null);
    if (budgetRange) {
      setFieldValue("budgetRange", budgetRange);
    }
  }, [values?.propertyName, propertyItems, setFieldValue]);

  useEffect(() => {
    if (!values?.propertyName || propertyItems.length === 0) return;

    const selected = propertyItems.find((item) => item.propertyName === values.propertyName);
    if (!selected?._id) return;

    let isMounted = true;

    const loadSubProperties = async () => {
      setIsLoadingSubProperties(true);
      try {
        const res = await fetch(
          `/api/v0/property?parentId=${selected._id}&search=&page=1&limit=100&action=subproperties`
        );
        const json = await res.json();

        if (!res.ok || !json?.success) {
          throw new Error(json?.message || "Failed to load sub-properties");
        }

        const items: SubPropertyItem[] = Array.isArray(json.data) ? json.data : [];
        const uniqueTypes = Array.from(
          new Set(items.map((item) => item.propertyType).filter(Boolean) as string[])
        );

        const options = uniqueTypes.map((type) => ({
          value: type,
          label: formatPropertyTypeLabel(type),
        }));

        if (isMounted) {
          setSubPropertyTypeOptions(options);

          if (options.length === 1) {
            setFieldValue("propertyType", options[0].value);
          } else if (!options.find((opt) => opt.value === values.propertyType)) {
            setFieldValue("propertyType", "");
          }
        }
      } catch {
        if (isMounted) {
          setSubPropertyTypeOptions([]);
          setFieldValue("propertyType", "");
        }
      } finally {
        if (isMounted) {
          setIsLoadingSubProperties(false);
        }
      }
    };

    loadSubProperties();

    return () => {
      isMounted = false;
    };
  }, [values?.propertyName, propertyItems, setFieldValue, values?.propertyType]);

  return (
  <>
    <Typography variant="h6" sx={{ mt: 1.5, mb: 0.75, fontWeight: 600 }}>
      Property Details
    </Typography>

    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      <Field name="propertyName">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            label="Property Name"
            size="small"
            select
            value={values.propertyName}
            onChange={(e) => setFieldValue("propertyName", e.target.value)}
            error={meta.touched && !!meta.error}
            helperText={meta.touched && meta.error}
            inputProps={{ "aria-label": "Property name" }}
<<<<<<< HEAD
            sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
            disabled={isLoadingProperties}
=======
            sx={{
              bgcolor: "#fff",
              borderRadius: 1,
              flex: 1,
              "& .MuiInputBase-root": { minHeight: 40 },
              "& .MuiInputBase-input": { py: 1 },
            }}
>>>>>>> fa33383460db150c6ab4c24480d46abbe3f90748
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
            size="small"
            select
            value={values.propertyType}
            onChange={(e) => setFieldValue("propertyType", e.target.value)}
            error={meta.touched && !!meta.error}
            helperText={meta.touched && meta.error}
            inputProps={{ "aria-label": "Property type" }}
<<<<<<< HEAD
            sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
            disabled={isLoadingSubProperties || subPropertyTypeOptions.length === 0}
=======
            sx={{
              bgcolor: "#fff",
              borderRadius: 1,
              flex: 1,
              "& .MuiInputBase-root": { minHeight: 40 },
              "& .MuiInputBase-input": { py: 1 },
            }}
>>>>>>> fa33383460db150c6ab4c24480d46abbe3f90748
          >
            <MenuItem value="">
              {isLoadingSubProperties ? "Loading property types..." : "Select property type..."}
            </MenuItem>
            {subPropertyTypeOptions.map((option) => (
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
        gap: 1.5,
        flexDirection: { xs: "column", sm: "row" },
        mt: 1.5,
      }}
    >
      <Field name="budgetRange">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            label="Budget Range"
            size="small"
            select
            value={values.budgetRange}
            onChange={(e) => setFieldValue("budgetRange", e.target.value)}
            error={meta.touched && !!meta.error}
            helperText={meta.touched && meta.error}
            inputProps={{ "aria-label": "Budget range" }}
            sx={{
              bgcolor: "#fff",
              borderRadius: 1,
              flex: 1,
              "& .MuiInputBase-root": { minHeight: 40 },
              "& .MuiInputBase-input": { py: 1 },
            }}
          >
            <MenuItem value="">Select budget range...</MenuItem>
            {budgetRanges.map((option) => (
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
            size="small"
            value={values.location}
            onChange={(e) => setFieldValue("location", e.target.value)}
            error={meta.touched && !!meta.error}
            helperText={meta.touched && meta.error}
            placeholder="e.g., Bangalore, Whitefield"
            inputProps={{ "aria-label": "Property location" }}
            sx={{
              bgcolor: "#fff",
              borderRadius: 1,
              flex: 1,
              "& .MuiInputBase-root": { minHeight: 40 },
              "& .MuiInputBase-input": { py: 1 },
            }}
          />
        )}
      </Field>
    </Box>
  </>
  );
};

export default PropertyDetails;
