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
} from "@mui/material";
import Alert from "@mui/material/Alert";
import { Add, Search } from "@mui/icons-material";
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

const Pagination = dynamic(() => import("@/components/ui/Pagination"), {
  ssr: false,
});

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
  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            placeholder="Search pillars, expertise, skills..."
            value={search}
            onChange={onSearchChange}
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
            size="small"
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={onCategoryChange}
            >
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <PermissionGuard module="pillar" action="write" fallback={<Box />}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onAdd}
              fullWidth
              sx={{ height: '40px' }}
            >
              Add Pillar
            </Button>
          </PermissionGuard>
        </Grid>
      </Grid>
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
    <Box sx={MODULE_STYLES.users.usersContainer}>
      {/* Header Section */}
      <Paper
        elevation={2}
        sx={{
          p: { xs: 1, sm: 2, md: 3 },
          borderRadius: { xs: 1, sm: 2, md: 3 },
          mb: { xs: 1, sm: 2, md: 3 },
          mt: { xs: 0.5, sm: 1, md: 2 },
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          overflow: "hidden",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
            mb: { xs: 2, md: 3 },
            textAlign: { xs: "left", sm: "left" },
          }}
        >
          Pillars
        </Typography>

        <PillarsActionBar
          search={search}
          category={category}
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onAdd={handleAddPillar}
        />
      </Paper>

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
        <Box>
          {/* Table View */}
          <Paper
            elevation={1}
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 1.5,
              mb: 2,
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{fontSize:"1.2rem", fontWeight:900}}>Profile</TableCell>
                    <TableCell sx={{fontSize:"1.2rem", fontWeight:900}}>Name</TableCell>
                    <TableCell sx={{fontSize:"1.2rem", fontWeight:900}}>Designation</TableCell>
                    <TableCell sx={{fontSize:"1.2rem", fontWeight:900}}>Experience</TableCell>
                    <TableCell sx={{fontSize:"1.2rem", fontWeight:900}}>Projects</TableCell>
                    <TableCell sx={{fontSize:"1.2rem", fontWeight:900}}>Actions</TableCell>
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

          {/* Pagination */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 4,
            mb: 2 
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
