// app/dashboard/training-videos/page.tsx
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
  Chip,
  SelectChangeEvent,
} from "@mui/material";
import Alert from "@mui/material/Alert";
import { Add, Search } from "@mui/icons-material";
import { useTrainingVideos, useTrainingVideoCategories } from "@/hooks/useTrainingVideos";
import { useDebounce } from "@/hooks/useDebounce";
import PermissionGuard from "@/components/PermissionGuard";
import { useAuth } from "@/contexts/AuthContext";
import { TrainingVideo, TrainingVideoFormData } from "@/types/trainingVideo";
import TrainingVideoCard from "@/components/ui/TrainingVideoCard";
import TrainingVideoFormDialog from "@/components/ui/TrainingVideoFormDialog";
import VideoPlayerModal from "@/components/ui/VideoPlayerModal";
import dynamic from "next/dynamic";
import {
  GRADIENTS,
  FAB_POSITION,
} from "@/constants/bookingLogin";
import { MODULE_STYLES } from "@/styles/moduleStyles";

const Pagination = dynamic(() => import("@/components/ui/Pagination"), {
  ssr: false,
});

const SORT_OPTIONS = [
  { value: "uploadDate_desc", label: "Newest First" },
  { value: "uploadDate_asc", label: "Oldest First" },
  { value: "title_asc", label: "Title A-Z" },
  { value: "title_desc", label: "Title Z-A" }
];

const getCategoryLabel = (category: string): string => {
  const categoryLabels: { [key: string]: string } = {
    "basic-sales-training-fundamentals": "Basic Sales Training Fundamentals",
    "team-building": "Team Building",
    "growth-model": "Growth Model",
    "basic-fundamentals-of-real-estate": "Basic Fundamentals of Real Estate",
    "company-code-of-conduct-rules-compliances": "Company Code of Conduct, Rules & Compliances (RERA)"
  };
  return categoryLabels[category] || category;
};

interface TrainingVideosActionBarProps {
  search: string;
  category: string;
  sortBy: string;
  categories: any[];
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoryChange: (event: SelectChangeEvent) => void;
  onSortChange: (event: SelectChangeEvent) => void;
  onCategoryClick: (category: string) => void;
  onAdd: () => void;
}

const TrainingVideosActionBar: React.FC<TrainingVideosActionBarProps> = ({
  search,
  category,
  sortBy,
  categories,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onCategoryClick,
  onAdd,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            placeholder="Search videos, descriptions..."
            value={search}
            onChange={onSearchChange}
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
            size="small"
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={onCategoryChange}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.name} value={cat.name}>
                  {getCategoryLabel(cat.name)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={onSortChange}
            >
              {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <PermissionGuard module="training-videos" action="write" fallback={<Box />}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onAdd}
              fullWidth
              sx={{ height: '40px' }}
            >
              Add Video
            </Button>
          </PermissionGuard>
        </Grid>
      </Grid>
    </Box>
  );
};

const TrainingVideos: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("uploadDate_desc");
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(12);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [playerOpen, setPlayerOpen] = useState<boolean>(false);
  const [selectedVideo, setSelectedVideo] = useState<TrainingVideo | null>(null);
  const [editingVideo, setEditingVideo] = useState<TrainingVideo | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 500);
  const { categories, loading: categoriesLoading } = useTrainingVideoCategories();
  const { 
    videos, 
    loading, 
    error,
    totalItems, 
    createVideo, 
    updateVideo, 
    deleteVideo,
    refresh 
  } = useTrainingVideos({
    search: debouncedSearch,
    category,
    page,
    limit: rowsPerPage,
    sortBy: sortBy.split('_')[0],
    sortOrder: sortBy.split('_')[1]
  });

  const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning" = "success"): void => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handlePlayVideo = (video: TrainingVideo): void => {
    setSelectedVideo(video);
    setPlayerOpen(true);
  };

  const handleClosePlayer = (): void => {
    setPlayerOpen(false);
    setSelectedVideo(null);
  };

  const handleAddVideo = (): void => {
    setEditingVideo(null);
    setFormOpen(true);
  };

  const handleEditVideo = (video: TrainingVideo): void => {
    setEditingVideo(video);
    setFormOpen(true);
  };

  const handleCloseForm = (): void => {
    setFormOpen(false);
    setEditingVideo(null);
  };

  const handleSaveVideo = async (videoData: TrainingVideoFormData): Promise<void> => {
    try {
      if (editingVideo) {
        await updateVideo(editingVideo._id, videoData);
        showSnackbar("Video updated successfully");
      } else {
        await createVideo(videoData);
        showSnackbar("Video created successfully");
      }
      handleCloseForm();
      refresh();
    } catch (err: any) {
      showSnackbar(err.message || "Failed to save video", "error");
    }
  };

  const handleDeleteVideo = async (video: TrainingVideo): Promise<void> => {
    if (window.confirm(`Are you sure you want to delete "${video.title}"?`)) {
      try {
        await deleteVideo(video._id);
        showSnackbar("Video deleted successfully");
        refresh();
      } catch (err: any) {
        showSnackbar(err.message || "Failed to delete video", "error");
      }
    }
  };

  const handleCategoryClick = (cat: string): void => {
    setCategory(cat === category ? "" : cat);
    setPage(1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleCategoryChange = (event: SelectChangeEvent): void => {
    setCategory(event.target.value);
    setPage(1);
  };

  const handleSortChange = (event: SelectChangeEvent): void => {
    setSortBy(event.target.value);
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
          Training Videos
        </Typography>

        <TrainingVideosActionBar
          search={search}
          category={category}
          sortBy={sortBy}
          categories={categories}
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
          onCategoryClick={handleCategoryClick}
          onAdd={handleAddVideo}
        />
      </Paper>

      {/* Content Section */}
{loading || categoriesLoading ? (
  <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
    <CircularProgress />
  </Box>
) : error ? (
  <Box sx={{ textAlign: "center", mt: 4 }}>
    <Alert severity="error">{error}</Alert>
  </Box>
) : videos.length === 0 ? (
  <Box sx={{ textAlign: "center", mt: 4 }}>
    <Typography variant="h6" color="text.secondary">
      No videos found.
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
      {search || category ? "Try adjusting your search criteria" : "Add your first training video to get started"}
    </Typography>
    <PermissionGuard module="training-videos" action="write" fallback={null}>
      <Button 
        variant="contained" 
        startIcon={<Add />}
        onClick={handleAddVideo}
        sx={{ mt: 2 }}
      >
        Add First Video
      </Button>
    </PermissionGuard>
  </Box>
) : (
  <Box>
    {/* When All Categories is selected - Show grouped by category */}
    {!category ? (
      categories.map((cat) => {
        const categoryVideos = videos.filter(video => video.category === cat.name);
        
        if (categoryVideos.length === 0) return null;

        return (
          <Box key={cat.name} sx={{ mb: 4 }}>
            {/* Category Header */}
            <Paper
              elevation={1}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  fontSize: { xs: "1.25rem", md: "1.5rem" },
                }}
              >
                {getCategoryLabel(cat.name)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {categoryVideos.length} video{categoryVideos.length !== 1 ? 's' : ''}
              </Typography>
            </Paper>
            
            {/* Videos Grid for this category */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
                gap: { xs: 2, md: 3 },
                mb: 3,
              }}
            >
              {categoryVideos.map((video) => (
                <TrainingVideoCard
                  key={video._id}
                  video={video}
                  onPlay={handlePlayVideo}
                  onEdit={handleEditVideo}
                  onDelete={handleDeleteVideo}
                  variant="grid"
                />
              ))}
            </Box>
          </Box>
        );
      })
    ) : (
      <>
        {/* Category Header for specific category */}
        <Paper
          elevation={1}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "text.primary",
              fontSize: { xs: "1.25rem", md: "1.5rem" },
            }}
          >
            {getCategoryLabel(category)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {videos.length} video{videos.length !== 1 ? 's' : ''} found
          </Typography>
        </Paper>

        {/* Videos Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: { xs: 2, md: 3 },
            mb: 3,
          }}
        >
          {videos.map((video) => (
            <TrainingVideoCard
              key={video._id}
              video={video}
              onPlay={handlePlayVideo}
              onEdit={handleEditVideo}
              onDelete={handleDeleteVideo}
              variant="grid"
            />
          ))}
        </Box>

        {/* Pagination - Only for specific category view */}
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
            pageSizeOptions={[12, 24, 36, 48]}
          />
        </Box>
      </>
    )}

    {/* Show pagination for All Categories view if there are more videos */}
    {!category && totalItems > rowsPerPage && (
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
          pageSizeOptions={[12, 24, 36, 48]}
        />
      </Box>
    )}
  </Box>
)}

      {/* Video Player Modal */}
      <VideoPlayerModal
        open={playerOpen}
        video={selectedVideo}
        onClose={handleClosePlayer}
      />

      {/* Video Form Dialog */}
      <TrainingVideoFormDialog
        open={formOpen}
        video={editingVideo}
        onClose={handleCloseForm}
        onSave={handleSaveVideo}
        loading={loading}
      />

      {/* Floating Action Button for Mobile */}
      {/* <PermissionGuard module="training-videos" action="write" fallback={<></>}>
        <Fab
          color="primary"
          aria-label="add video"
          onClick={handleAddVideo}
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

export default TrainingVideos;


