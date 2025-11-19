// "use client";

// import React, { useState, useCallback } from "react";
// import {
//   Box,
//   Paper,
//   Typography,
//   Fab,
//   CircularProgress,
//   useTheme,
//   useMediaQuery,
//   Snackbar,
//   Button,
//   Grid,
//   TextField,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   SelectChangeEvent,
// } from "@mui/material";
// import Alert from "@mui/material/Alert";
// import { Add, Search } from "@mui/icons-material";
// import { usePillars } from "@/hooks/usePillars";
// import { useDebounce } from "@/hooks/useDebounce";
// import PermissionGuard from "@/components/PermissionGuard";
// import { useAuth } from "@/contexts/AuthContext";
// import { Pillar, PillarFormData } from "@/types/pillar";
// import PillarCard from "@/components/ui/PillarCard";
// import PillarFormDialog from "@/components/ui/PillarFormDialog";
// import dynamic from "next/dynamic";
// import {
//   GRADIENTS,
//   FAB_POSITION,
// } from "@/constants/pillars";
// import { MODULE_STYLES } from "@/styles/moduleStyles";

// const Pagination = dynamic(() => import("@/components/ui/Pagination"), {
//   ssr: false,
// });

// const CATEGORIES = [
//   { value: "", label: "All Categories" },
//   { value: "the-visionaries", label: "The Visionaries" },
//   { value: "the-strategic-force", label: "The Strategic Force" },
//   { value: "growth-navigators", label: "Growth Navigators" },
//   { value: "the-powerhouse-team", label: "The Powerhouse Team" },
// ];

// interface PillarsActionBarProps {
//   search: string;
//   category: string;
//   onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
//   onCategoryChange: (event: SelectChangeEvent) => void;
//   onAdd: () => void;
// }

// const PillarsActionBar: React.FC<PillarsActionBarProps> = ({
//   search,
//   category,
//   onSearchChange,
//   onCategoryChange,
//   onAdd,
// }) => {
//   return (
//     <Box sx={{ mb: 3 }}>
//       <Grid container spacing={2} alignItems="center">
//         <Grid size={{ xs: 12, md: 6 }}>
//           <TextField
//             fullWidth
//             placeholder="Search pillars, expertise, skills..."
//             value={search}
//             onChange={onSearchChange}
//             InputProps={{
//               startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
//             }}
//             size="small"
//           />
//         </Grid>
        
//         <Grid size={{ xs: 12, md: 3 }}>
//           <FormControl fullWidth size="small">
//             <InputLabel>Category</InputLabel>
//             <Select
//               value={category}
//               label="Category"
//               onChange={onCategoryChange}
//             >
//               {CATEGORIES.map((cat) => (
//                 <MenuItem key={cat.value} value={cat.value}>
//                   {cat.label}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </Grid>

//         <Grid size={{ xs: 12, md: 3 }}>
//           <PermissionGuard module="pillar" action="write" fallback={<Box />}>
//             <Button
//               variant="contained"
//               startIcon={<Add />}
//               onClick={onAdd}
//               fullWidth
//               sx={{ height: '40px' }}
//             >
//               Add Pillar
//             </Button>
//           </PermissionGuard>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// const Pillars: React.FC = () => {
//   const { user } = useAuth();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
//   const [search, setSearch] = useState<string>("");
//   const [category, setCategory] = useState<string>("");
//   const [page, setPage] = useState<number>(1);
//   const [rowsPerPage, setRowsPerPage] = useState<number>(12);
//   const [formOpen, setFormOpen] = useState<boolean>(false);
//   const [editingPillar, setEditingPillar] = useState<Pillar | null>(null);
//   const [snackbarMessage, setSnackbarMessage] = useState("");
//   const [snackbarSeverity, setSnackbarSeverity] = useState<
//     "success" | "error" | "info" | "warning"
//   >("success");
//   const [snackbarOpen, setSnackbarOpen] = useState(false);

//   const debouncedSearch = useDebounce(search, 500);
//   const { 
//     pillars, 
//     loading, 
//     error,
//     totalItems, 
//     createPillar, 
//     updatePillar, 
//     deletePillar,
//     refresh 
//   } = usePillars({
//     search: debouncedSearch,
//     category,
//     page,
//     limit: rowsPerPage,
//   });

//   const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning" = "success"): void => {
//     setSnackbarMessage(message);
//     setSnackbarSeverity(severity);
//     setSnackbarOpen(true);
//   };

//   const handleAddPillar = (): void => {
//     setEditingPillar(null);
//     setFormOpen(true);
//   };

//   const handleEditPillar = (pillar: Pillar): void => {
//     setEditingPillar(pillar);
//     setFormOpen(true);
//   };

//   const handleCloseForm = (): void => {
//     setFormOpen(false);
//     setEditingPillar(null);
//   };

//   const handleSavePillar = async (pillarData: PillarFormData): Promise<void> => {
//     try {
//       if (editingPillar) {
//         await updatePillar(editingPillar._id, pillarData);
//         showSnackbar("Pillar updated successfully");
//       } else {
//         await createPillar(pillarData);
//         showSnackbar("Pillar created successfully");
//       }
//       handleCloseForm();
//       refresh();
//     } catch (err: any) {
//       showSnackbar(err.message || "Failed to save pillar", "error");
//     }
//   };

//   const handleDeletePillar = async (pillar: Pillar): Promise<void> => {
//     if (window.confirm(`Are you sure you want to delete "${pillar.name}"?`)) {
//       try {
//         await deletePillar(pillar._id);
//         showSnackbar("Pillar deleted successfully");
//         refresh();
//       } catch (err: any) {
//         showSnackbar(err.message || "Failed to delete pillar", "error");
//       }
//     }
//   };

//   const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
//     setSearch(event.target.value);
//     setPage(1);
//   };

//   const handleCategoryChange = (event: SelectChangeEvent): void => {
//     setCategory(event.target.value);
//     setPage(1);
//   };

//   const handlePageSizeChange = (newSize: number) => {
//     setRowsPerPage(newSize);
//     setPage(1);
//   };

//   // Group pillars by category for better organization
//   const pillarsByCategory = React.useMemo(() => {
//     const grouped: { [key: string]: Pillar[] } = {};
    
//     pillars.forEach(pillar => {
//       if (!grouped[pillar.category]) {
//         grouped[pillar.category] = [];
//       }
//       grouped[pillar.category].push(pillar);
//     });
    
//     return grouped;
//   }, [pillars]);

//   const getCategoryLabel = (category: string): string => {
//     const categoryLabels: { [key: string]: string } = {
//       "the-visionaries": "The Visionaries",
//       "the-strategic-force": "The Strategic Force",
//       "growth-navigators": "Growth Navigators",
//       "the-powerhouse-team": "The Powerhouse Team"
//     };
//     return categoryLabels[category] || category;
//   };

//   return (
//     <Box sx={MODULE_STYLES.users.usersContainer}>
//       {/* Header Section */}
//       <Paper
//         elevation={2}
//         sx={{
//           p: { xs: 1, sm: 2, md: 3 },
//           borderRadius: { xs: 1, sm: 2, md: 3 },
//           mb: { xs: 1, sm: 2, md: 3 },
//           mt: { xs: 0.5, sm: 1, md: 2 },
//           background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
//           overflow: "hidden",
//         }}
//       >
//         <Typography
//           variant="h4"
//           sx={{
//             fontWeight: 700,
//             color: "text.primary",
//             fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
//             mb: { xs: 2, md: 3 },
//             textAlign: { xs: "center", sm: "left" },
//           }}
//         >
//           Pillars
//         </Typography>

//         <PillarsActionBar
//           search={search}
//           category={category}
//           onSearchChange={handleSearchChange}
//           onCategoryChange={handleCategoryChange}
//           onAdd={handleAddPillar}
//         />
//       </Paper>

//       {/* Content Section */}
//       {loading ? (
//         <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
//           <CircularProgress />
//         </Box>
//       ) : error ? (
//         <Box sx={{ textAlign: "center", mt: 4 }}>
//           <Alert severity="error">{error}</Alert>
//         </Box>
//       ) : pillars.length === 0 ? (
//         <Box sx={{ textAlign: "center", mt: 4 }}>
//           <Typography variant="h6" color="text.secondary">
//             No pillars found.
//           </Typography>
//           <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//             {search || category ? "Try adjusting your search criteria" : "Add your first pillar to get started"}
//           </Typography>
//           <PermissionGuard module="pillar" action="write" fallback={null}>
//             <Button 
//               variant="contained" 
//               startIcon={<Add />}
//               onClick={handleAddPillar}
//               sx={{ mt: 2 }}
//             >
//               Add First Pillar
//             </Button>
//           </PermissionGuard>
//         </Box>
//       ) : (
//         <Box>
//           {/* When All Categories is selected - Show grouped by category */}
//           {!category ? (
//             Object.entries(pillarsByCategory).map(([categoryKey, categoryPillars]) => (
//               <Box key={categoryKey} sx={{ mb: 4 }}>
//                 {/* Category Header */}
//                 <Paper
//                   elevation={1}
//                   sx={{
//                     p: 2,
//                     mb: 2,
//                     borderRadius: 2,
//                   }}
//                 >
//                   <Typography
//                     variant="h5"
//                     sx={{
//                       fontWeight: 600,
//                       color: "text.primary",
//                       fontSize: { xs: "1.25rem", md: "1.5rem" },
//                     }}
//                   >
//                     {getCategoryLabel(categoryKey)}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//                     {categoryPillars.length} pillar{categoryPillars.length !== 1 ? 's' : ''}
//                   </Typography>
//                 </Paper>
                
//                 {/* Pillars Grid for this category */}
//                 <Box
//                   sx={{
//                     display: "grid",
//                     gridTemplateColumns: {
//                       xs: "1fr",
//                       sm: "repeat(2, 1fr)",
//                       md: "repeat(3, 1fr)",
//                       lg: "repeat(4, 1fr)",
//                     },
//                     gap: { xs: 2, md: 3 },
//                     mb: 3,
//                   }}
//                 >
//                   {categoryPillars.map((pillar) => (
//                     <PillarCard
//                       key={pillar._id}
//                       pillar={pillar}
//                       onEdit={handleEditPillar}
//                       onDelete={handleDeletePillar}
//                     />
//                   ))}
//                 </Box>
//               </Box>
//             ))
//           ) : (
//             <>
//               {/* Category Header for specific category */}
//               <Paper
//                 elevation={1}
//                 sx={{
//                   p: 2,
//                   mb: 3,
//                   borderRadius: 2,
//                 }}
//               >
//                 <Typography
//                   variant="h5"
//                   sx={{
//                     fontWeight: 600,
//                     color: "text.primary",
//                     fontSize: { xs: "1.25rem", md: "1.5rem" },
//                   }}
//                 >
//                   {getCategoryLabel(category)}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//                   {pillars.length} pillar{pillars.length !== 1 ? 's' : ''} found
//                 </Typography>
//               </Paper>

//               {/* Pillars Grid */}
//               <Box
//                 sx={{
//                   display: "grid",
//                   gridTemplateColumns: {
//                     xs: "1fr",
//                     sm: "repeat(2, 1fr)",
//                     md: "repeat(3, 1fr)",
//                     lg: "repeat(4, 1fr)",
//                   },
//                   gap: { xs: 2, md: 3 },
//                   mb: 3,
//                 }}
//               >
//                 {pillars.map((pillar) => (
//                   <PillarCard
//                     key={pillar._id}
//                     pillar={pillar}
//                     onEdit={handleEditPillar}
//                     onDelete={handleDeletePillar}
//                   />
//                 ))}
//               </Box>

//               {/* Pagination - Only for specific category view */}
//               <Box sx={{ 
//                 display: 'flex', 
//                 justifyContent: 'center', 
//                 mt: 4,
//                 mb: 2 
//               }}>
//                 <Pagination
//                   page={page}
//                   pageSize={rowsPerPage}
//                   total={totalItems}
//                   onPageChange={setPage}
//                   onPageSizeChange={handlePageSizeChange}
//                   pageSizeOptions={[12, 24, 36, 48]}
//                 />
//               </Box>
//             </>
//           )}

//           {/* Show pagination for All Categories view if there are more pillars */}
//           {!category && totalItems > rowsPerPage && (
//             <Box sx={{ 
//               display: 'flex', 
//               justifyContent: 'center', 
//               mt: 4,
//               mb: 2 
//             }}>
//               <Pagination
//                 page={page}
//                 pageSize={rowsPerPage}
//                 total={totalItems}
//                 onPageChange={setPage}
//                 onPageSizeChange={handlePageSizeChange}
//                 pageSizeOptions={[12, 24, 36, 48]}
//               />
//             </Box>
//           )}
//         </Box>
//       )}

//       {/* Pillar Form Dialog */}
//       <PillarFormDialog
//         open={formOpen}
//         pillar={editingPillar}
//         onClose={handleCloseForm}
//         onSave={handleSavePillar}
//         loading={loading}
//       />

//       {/* Floating Action Button for Mobile */}
//       <PermissionGuard module="pillar" action="write" fallback={<></>}>
//         <Fab
//           color="primary"
//           aria-label="add pillar"
//           onClick={handleAddPillar}
//           sx={{
//             position: "fixed",
//             bottom: FAB_POSITION.bottom,
//             right: FAB_POSITION.right,
//             background: GRADIENTS.button,
//             display: { xs: "flex", md: "none" },
//             zIndex: FAB_POSITION.zIndex,
//             boxShadow: 3,
//             "&:hover": { background: GRADIENTS.buttonHover },
//           }}
//         >
//           <Add />
//         </Fab>
//       </PermissionGuard>

//       {/* Snackbar for notifications */}
//       <Snackbar
//         open={snackbarOpen}
//         autoHideDuration={4000}
//         onClose={(event, reason) => {
//           if (reason === "clickaway") return;
//           setSnackbarOpen(false);
//         }}
//         anchorOrigin={{ vertical: "top", horizontal: "right" }}
//       >
//         <Alert
//           onClose={() => setSnackbarOpen(false)}
//           severity={snackbarSeverity}
//           variant="filled"
//         >
//           {snackbarMessage}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default Pillars;

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
  Chip,
  Avatar,
  AvatarGroup,
  Menu,
} from "@mui/material";
import Alert from "@mui/material/Alert";
import { Add, Search, Edit, Delete, MoreVert } from "@mui/icons-material";
import { usePillars } from "@/hooks/usePillars";
import { useDebounce } from "@/hooks/useDebounce";
import PermissionGuard from "@/components/PermissionGuard";
import { useAuth } from "@/contexts/AuthContext";
import { Pillar, PillarFormData } from "@/types/pillar";
import PillarFormDialog from "@/components/ui/PillarFormDialog";
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

const PillarsActionBar: React.FC<PillarActionBarProps> = ({
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

interface PillarTableRowProps {
  pillar: Pillar;
  onEdit: (pillar: Pillar) => void;
  onDelete: (pillar: Pillar) => void;
}

const PillarTableRow: React.FC<PillarTableRowProps> = ({ 
  pillar, 
  onEdit, 
  onDelete 
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const primaryImage = pillar.profileImages.find(img => img.type === 'primary');
  const secondaryImage = pillar.profileImages.find(img => img.type === 'secondary');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    onEdit(pillar);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(pillar);
    handleMenuClose();
  };

  const getCategoryLabel = (category: string): string => {
    const categoryLabels: { [key: string]: string } = {
      "the-visionaries": "The Visionaries",
      "the-strategic-force": "The Strategic Force",
      "growth-navigators": "Growth Navigators",
      "the-powerhouse-team": "The Powerhouse Team"
    };
    return categoryLabels[category] || category;
  };

  return (
    <TableRow
      sx={{
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      {/* Profile Images */}
      <TableCell>
        <AvatarGroup max={2}>
          {primaryImage && (
            <Avatar 
              src={primaryImage.url} 
              alt={pillar.name}
              sx={{ width: 40, height: 40 }}
            />
          )}
          {/* {secondaryImage && (
            <Avatar 
              src={secondaryImage.url} 
              alt={pillar.name}
              sx={{ width: 40, height: 40 }}
            />
          )} */}
        </AvatarGroup>
      </TableCell>

      {/* Name & Designation */}
      <TableCell>
        <Typography variant="subtitle1" fontWeight="bold">
          {pillar.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {pillar.designation}
        </Typography>
      </TableCell>

      {/* Category */}
      <TableCell>
        <Chip 
          label={getCategoryLabel(pillar.category)} 
          color="primary" 
          size="small"
          variant="outlined"
        />
      </TableCell>

      {/* Expertise */}
      <TableCell>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
          {pillar.expertise.slice(0, 2).map((exp, index) => (
            <Chip
              key={index}
              label={exp}
              size="small"
              variant="outlined"
            />
          ))}
          {pillar.expertise.length > 2 && (
            <Chip
              label={`+${pillar.expertise.length - 2}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </TableCell>

      {/* Skills */}
      <TableCell>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
          {pillar.skills.slice(0, 2).map((skill, index) => (
            <Chip
              key={index}
              label={skill}
              size="small"
              variant="outlined"
              color="secondary"
            />
          ))}
          {pillar.skills.length > 2 && (
            <Chip
              label={`+${pillar.skills.length - 2}`}
              size="small"
              variant="outlined"
              color="secondary"
            />
          )}
        </Box>
      </TableCell>

      {/* Projects */}
      <TableCell>
        <Typography variant="body2">
          {pillar.projects?.length || 0} project{pillar.projects?.length !== 1 ? 's' : ''}
        </Typography>
      </TableCell>

      {/* Actions */}
      <TableCell>
        <PermissionGuard module="pillar" action="write" fallback={null}>
          <IconButton
            size="small"
            onClick={handleMenuOpen}
          >
            <MoreVert />
          </IconButton>
        </PermissionGuard>
      </TableCell>

      {/* Action Menu */}
      <PermissionGuard module="pillar" action="write" fallback={null}>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>
            <Edit sx={{ mr: 1 }} fontSize="small" />
            Edit
          </MenuItem>
          <PermissionGuard module="pillar" action="delete" fallback={null}>
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              <Delete sx={{ mr: 1 }} fontSize="small" />
              Delete
            </MenuItem>
          </PermissionGuard>
        </Menu>
      </PermissionGuard>
    </TableRow>
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
  const [editingPillar, setEditingPillar] = useState<Pillar | null>(null);
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

  const handleCloseForm = (): void => {
    setFormOpen(false);
    setEditingPillar(null);
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
            textAlign: { xs: "center", sm: "left" },
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
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Profile</TableCell>
                    <TableCell>Name & Designation</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Expertise</TableCell>
                    <TableCell>Skills</TableCell>
                    <TableCell>Projects</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pillars.map((pillar) => (
                    <PillarTableRow
                      key={pillar._id}
                      pillar={pillar}
                      onEdit={handleEditPillar}
                      onDelete={handleDeletePillar}
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

      {/* Floating Action Button for Mobile */}
      <PermissionGuard module="pillar" action="write" fallback={<></>}>
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
      </PermissionGuard>

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
