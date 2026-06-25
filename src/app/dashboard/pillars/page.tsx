"use client";

import React, { useState, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Fab,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Snackbar,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material";
import Alert from "@mui/material/Alert";
import { alpha } from "@mui/material/styles";
import { Add, Search, MoreVert } from "@mui/icons-material";
import { usePillars } from "@/hooks/usePillars";
import { useDebounce } from "@/hooks/useDebounce";
import PermissionGuard from "@/components/PermissionGuard";
import { useAuth } from "@/contexts/AuthContext";
import { Pillar, PillarFormData } from "@/types/pillar";
import PillarFormDialog from "@/components/ui/PillarFormDialog";
import PillarViewDialog from "@/components/ui/PillarViewDialog";
import PillarTableRow from "@/components/ui/PillarTableRow";
import dynamic from "next/dynamic";
import {
  GRADIENTS,
  FAB_POSITION,
} from "@/constants/pillars";
import { MODULE_STYLES } from "@/styles/moduleStyles";
import PageHeader from "@/fe/components/PageHeader";

import Pagination from "@/components/ui/Navigation/Pagination";

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "the-visionaries", label: "The Visionaries" },
  { value: "the-strategic-force", label: "The Strategic Force" },
  { value: "growth-navigators", label: "Growth Navigators" },
  { value: "the-powerhouse-team", label: "The Powerhouse Team" },
];

interface PillarsActionBarProps {
  search: string;
  category: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoryChange: (event: SelectChangeEvent) => void;
  onAdd: () => void;
}

const PillarsActionBar: React.FC<PillarsActionBarProps> = ({
  search,
  category,
  onSearchChange,
  onCategoryChange,
  onAdd,
}) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      display: "flex", 
      alignItems: "center", 
      gap: { xs: 1.5, sm: 2 }, 
      width: "100%",
      flexWrap: { xs: "wrap", sm: "nowrap" }
    }}>
      {/* Search Bar */}
      <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: { sm: 400 }, width: { xs: "100%", sm: "auto" } }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search pillars, expertise, skills..."
          value={search}
          onChange={onSearchChange}
          InputProps={{
            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: alpha(theme.palette.common.white, 0.8),
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: theme.palette.common.white,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              },
              "&.Mui-focused": {
                bgcolor: theme.palette.common.white,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              },
            },
          }}
        />
      </Box>
      
      {/* Category Dropdown */}
      <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 200 } }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          label="Category"
          onChange={onCategoryChange}
          sx={{
            borderRadius: 2,
            bgcolor: alpha(theme.palette.common.white, 0.8),
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha(theme.palette.divider, 0.8),
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.primary.main,
            }
          }}
        >
          {CATEGORIES.map((cat) => (
            <MenuItem key={cat.value} value={cat.value}>
              {cat.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Actions */}
      <Box sx={{ 
        ml: { sm: "auto" }, 
        display: "flex", 
        alignItems: "center", 
        gap: 1.5,
        width: { xs: "100%", sm: "auto" },
        justifyContent: { xs: "flex-end", sm: "flex-start" }
      }}>
        <PermissionGuard module="pillar" action="write" fallback={<Box />}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onAdd}
            sx={{ 
              height: 40, 
              px: 3,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
              backgroundColor: theme.palette.primary.main,
              whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
                boxShadow: "0 6px 16px rgba(25, 118, 210, 0.3)",
              },
            }}
          >
            Add Pillar
          </Button>
        </PermissionGuard>
      </Box>
    </Box>
  );
};

const Pillars: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [editingPillar, setEditingPillar] = useState<Pillar | null>(null);
  const [viewingPillar, setViewingPillar] = useState<Pillar | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 500);
  const { 
    pillars, 
    loading, 
    error,
    totalItems, 
    createPillar, 
    updatePillar, 
    deletePillar,
    refresh 
  } = usePillars({
    search: debouncedSearch,
    category,
    page,
    limit: rowsPerPage,
  });

  const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning" = "success"): void => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleAddPillar = (): void => {
    setEditingPillar(null);
    setFormOpen(true);
  };

  const handleEditPillar = (pillar: Pillar): void => {
    setEditingPillar(pillar);
    setFormOpen(true);
  };

  const handleViewPillar = (pillar: Pillar): void => {
    setViewingPillar(pillar);
    setViewDialogOpen(true);
  };

  const handleCloseForm = (): void => {
    setFormOpen(false);
    setEditingPillar(null);
  };

  const handleCloseViewDialog = (): void => {
    setViewDialogOpen(false);
    setViewingPillar(null);
  };

  const handleSavePillar = async (pillarData: PillarFormData): Promise<void> => {
    try {
      if (editingPillar) {
        await updatePillar(editingPillar._id, pillarData);
        showSnackbar("Pillar updated successfully");
      } else {
        await createPillar(pillarData);
        showSnackbar("Pillar created successfully");
      }
      handleCloseForm();
      refresh();
    } catch (err: any) {
      showSnackbar(err.message || "Failed to save pillar", "error");
    }
  };

  const handleDeletePillar = async (pillar: Pillar): Promise<void> => {
    if (window.confirm(`Are you sure you want to delete "${pillar.name}"?`)) {
      try {
        await deletePillar(pillar._id);
        showSnackbar("Pillar deleted successfully");
        refresh();
      } catch (err: any) {
        showSnackbar(err.message || "Failed to delete pillar", "error");
      }
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleCategoryChange = (event: SelectChangeEvent): void => {
    setCategory(event.target.value);
    setPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setRowsPerPage(newSize);
    setPage(1);
  };

  return (
    <Box sx={{ 
      ...MODULE_STYLES.users.usersContainer, 
      height: "100%", 
      display: "flex", 
      flexDirection: "column",
      minHeight: 0,
      overflow: "hidden",
      bgcolor: "#f9f9f9", // Match layout background
    }}>
      {/* Header Section */}
      <Box sx={{ flexShrink: 0, mb: 1 }}>
        <PageHeader title="Pillars">
          <PillarsActionBar
            search={search}
            category={category}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onAdd={handleAddPillar}
          />
        </PageHeader>
      </Box>

      {/* Content Section */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : pillars.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No pillars found.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {search || category ? "Try adjusting your search criteria" : "Add your first pillar to get started"}
          </Typography>
          <PermissionGuard module="pillar" action="write" fallback={null}>
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={handleAddPillar}
              sx={{ mt: 2 }}
            >
              Add First Pillar
            </Button>
          </PermissionGuard>
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Table View */}
          <Paper
            elevation={1}
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              borderRadius: 2,
              mb: 0,
            }}
          >
            <TableContainer sx={{ flexGrow: 1, overflow: "auto" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{fontSize:"1.1rem", fontWeight:800, bgcolor: "white"}}>Profile</TableCell>
                    <TableCell sx={{fontSize:"1.1rem", fontWeight:800, bgcolor: "white"}}>Name</TableCell>
                    <TableCell sx={{fontSize:"1.1rem", fontWeight:800, bgcolor: "white"}}>Designation</TableCell>
                    <TableCell sx={{fontSize:"1.1rem", fontWeight:800, bgcolor: "white"}}>Experience</TableCell>
                    <TableCell sx={{fontSize:"1.1rem", fontWeight:800, bgcolor: "white"}}>Projects</TableCell>
                    <TableCell sx={{fontSize:"1.1rem", fontWeight:800, bgcolor: "white"}}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pillars.map((pillar) => (
                    <PillarTableRow
                      key={pillar._id}
                      pillar={pillar}
                      onEdit={handleEditPillar}
                      onDelete={handleDeletePillar}
                      onView={handleViewPillar}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Box sx={{ 
            // display: 'flex', 
            // justifyContent: 'center', 
            py: 1,
            // flexShrink: 0,
            // borderTop: 1,
            // borderColor: 'divider',
            // bgcolor: 'background.paper',
            borderRadius: 2,
          }}>
            <Pagination
              page={page}
              pageSize={rowsPerPage}
              total={totalItems}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </Box>
        </Box>
      )}

      {/* Pillar Form Dialog */}
      <PillarFormDialog
        open={formOpen}
        pillar={editingPillar}
        onClose={handleCloseForm}
        onSave={handleSavePillar}
        loading={loading}
      />

      {/* Pillar View Dialog */}
      <PillarViewDialog
        open={viewDialogOpen}
        pillar={viewingPillar}
        onClose={handleCloseViewDialog}
      />

      {/* Floating Action Button for Mobile */}
      {/* <PermissionGuard module="pillar" action="write" fallback={<></>}>
        <Fab
          color="primary"
          aria-label="add pillar"
          onClick={handleAddPillar}
          sx={{
            position: "fixed",
            bottom: FAB_POSITION.bottom,
            right: FAB_POSITION.right,
            background: GRADIENTS.button,
            display: { xs: "flex", md: "none" },
            zIndex: FAB_POSITION.zIndex,
            boxShadow: 3,
            "&:hover": { background: GRADIENTS.buttonHover },
          }}
        >
          <Add />
        </Fab>
      </PermissionGuard> */}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={(event, reason) => {
          if (reason === "clickaway") return;
          setSnackbarOpen(false);
        }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Pillars;
