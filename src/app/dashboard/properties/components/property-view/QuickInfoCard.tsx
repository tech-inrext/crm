"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { Property } from "@/services/propertyService";

interface QuickInfoCardProps {
  property: Property;
}

const QuickInfoCard: React.FC<QuickInfoCardProps> = ({ property }) => {
  const [derivedType, setDerivedType] = useState<string>("");
  const [derivedName, setDerivedName] = useState<string>("");

  useEffect(() => {
    if (!property?._id) return;

    let isMounted = true;

    const setData = (type = "", name = "") => {
      if (!isMounted) return;
      setDerivedType(type);
      setDerivedName(name);
    };

    // 🔹 CASE 1: Sub Property → No API call needed
    if (property.parentId) {
      if (property.propertyType && property.propertyType !== "project") {
        setData(property.propertyType, property.propertyName || "");
      } else {
        setData();
      }
      return;
    }

    // 🔹 CASE 2: Main Property → Fetch children once
    const fetchSubProperties = async () => {
      try {
        const res = await fetch(
          `/api/v0/property?parentId=${property._id}&action=subproperties`
        );

        if (!res.ok) return setData();

        const { success, data } = await res.json();

        if (!success || !Array.isArray(data)) return setData();

        const validChild = data.find(
          (item: any) =>
            item.propertyType && item.propertyType !== "project"
        );

        setData(
          validChild?.propertyType || "",
          validChild?.propertyName || ""
        );
      } catch {
        setData();
      }
    };

    fetchSubProperties();

    return () => {
      isMounted = false;
    };
  }, [property._id, property.parentId, property.propertyType]);

  const formattedType = derivedType
    ? derivedType.charAt(0).toUpperCase() + derivedType.slice(1)
    : "N/A";

  const formattedName = derivedName || "N/A";

  return (
<Card className="rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-black/5">
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: "primary.main" }}>
          ℹ️ Quick Info
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}> 
          <Box sx={{display: "flex", justifyContent: 'space-between', alignItems: "center", py: 1, }}>
            <Typography variant="body2" color="text.secondary">
              Property Type
            </Typography>

            <Chip
              label={formattedType}
              size="small"
              color="primary"
              sx={{ textTransform: "capitalize" }}
            />
          </Box>

          {/* Payment Plan */}
         <Box className="flex justify-between items-center py-1">
            <Typography variant="body2" color="text.secondary">
              Payment Plan
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {property.paymentPlan || "N/A"}
            </Typography>
          </Box>

          {/* Options */}
         <Box className="flex justify-between items-center py-1">
            <Typography variant="body2" color="text.secondary">
              Options
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formattedName}
            </Typography>
          </Box>

        </Box>
      </CardContent>
    </Card>
  );
};

export default QuickInfoCard;