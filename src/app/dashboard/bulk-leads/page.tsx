"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  CloudUpload,
  ArrowBack,
  CheckCircle,
  Error,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import axios from "axios";
import * as XLSX from "xlsx";

interface BulkLeadData {
  fullName: string;
  email: string;
  phone: string;
  propertyType: string;
  location: string;
  budgetRange: string;
  status: string;
  source: string;
  assignedTo?: string;
  nextFollowUp?: string;
}

interface UploadResult {
  success: boolean;
  data?: BulkLeadData;
  error?: string;
  row: number;
}

const BulkLeadsPage: React.FC = () => {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (fileExtension === "xlsx" || fileExtension === "xls") {
        setSelectedFile(file);
        setResults([]);
        setShowResults(false);
      } else {
        alert("Please select a valid Excel file (.xlsx or .xls)");
      }
    }
  };

  const parseExcelFile = async (file: File): Promise<BulkLeadData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Skip header row and convert to lead data
          const leads: BulkLeadData[] = [];
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            if (row.length > 0 && row[0]) {
              // Skip empty rows
              leads.push({
                fullName: row[0] || "",
                email: row[1] || "",
                phone: row[2] || "",
                propertyType: row[3] || "",
                location: row[4] || "",
                budgetRange: row[5] || "",
                status: row[6] || "New",
                source: row[7] || "Bulk Upload",
                assignedTo: row[8] || "",
                nextFollowUp: row[9] || "",
              });
            }
          }
          resolve(leads);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const leads = await parseExcelFile(selectedFile);
      const uploadResults: UploadResult[] = [];

      // Upload leads one by one
      for (let i = 0; i < leads.length; i++) {
        const lead = leads[i];
        try {
          await axios.post("/api/v0/lead", lead);
          uploadResults.push({
            success: true,
            data: lead,
            row: i + 2, // +2 because we skip header and arrays are 0-indexed
          });
        } catch (error: any) {
          uploadResults.push({
            success: false,
            data: lead,
            error: error.response?.data?.message || "Failed to upload",
            row: i + 2,
          });
        }
      }
      setResults(uploadResults);
      setShowResults(true);
    } catch (error) {
      alert("Failed to parse Excel file. Please check the format.");
    } finally {
      setUploading(false);
    }
  };

  const successCount = results.filter((r) => r.success).length;
  const errorCount = results.filter((r) => !r.success).length;

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <IconButton onClick={() => router.push("/dashboard/")}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Bulk Upload Leads
          </Typography>{" "}
        </Box>

        <Typography variant="body1" color="text.secondary">
          Upload multiple leads from an Excel file with the required lead
          information.
        </Typography>
      </Paper>

      {/* Upload Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Upload Excel File
        </Typography>

        <Box
          sx={{
            border: "2px dashed #1976d2",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            bgcolor: "rgba(25, 118, 210, 0.02)",
          }}
        >
          <CloudUpload sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Select Excel File
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Supported formats: .xlsx, .xls
          </Typography>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="excel-upload"
          />
          <label htmlFor="excel-upload">
            <Button variant="contained" component="span" sx={{ mr: 2 }}>
              Choose File
            </Button>
          </label>

          {selectedFile && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Selected: {selectedFile.name}
              </Typography>
              <Button
                variant="contained"
                color="success"
                onClick={handleUpload}
                disabled={uploading}
                sx={{ mt: 2 }}
              >
                {uploading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Uploading...
                  </>
                ) : (
                  "Upload Leads"
                )}
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Results Section */}
      {showResults && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Upload Results
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Alert severity="success" sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CheckCircle />
                <span>{successCount} leads uploaded successfully</span>
              </Box>
            </Alert>
            {errorCount > 0 && (
              <Alert severity="error" sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Error />
                  <span>{errorCount} leads failed to upload</span>
                </Box>
              </Alert>
            )}
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Row</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Error</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell>{result.row}</TableCell>
                    <TableCell>{result.data?.fullName}</TableCell>
                    <TableCell>{result.data?.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={result.success ? "Success" : "Failed"}
                        color={result.success ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {result.error && (
                        <Typography variant="body2" color="error">
                          {result.error}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Button
              variant="contained"
              onClick={() => router.push("/dashboard/leads")}
            >
              Back to Leads
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default BulkLeadsPage;
