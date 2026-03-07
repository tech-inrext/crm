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
  Alert,
} from "@mui/material";
import { Add, Search } from "@mui/icons-material";
import { useTrainingVideos, useTrainingVideoCategories } from "@/hooks/useTrainingVideos";
import { useDebounce } from "@/hooks/useDebounce";
import PermissionGuard from "@/components/PermissionGuard";
import { useAuth } from "@/contexts/AuthContext";
import { TrainingVideo, TrainingVideoFormData } from "@/types/trainingVideo";
import TrainingVideoCard from "@/components/ui/TrainingVideoCard";
import TrainingVideoFormDialog from "@/components/ui/training-videos/TrainingVideoFormDialog";
import VideoPlayerModal from "@/components/ui/training-videos/VideoPlayerModal";
import dynamic from "next/dynamic";
import {
  GRADIENTS,
  FAB_POSITION,
} from "@/constants/bookingLogin";
import { MODULE_STYLES } from "@/styles/moduleStyles";
import { TrainingVideosActionBar } from "./components/TrainingVideosActionBar";
import { CategorySection } from "./components/CategorySection";
import { VideoGrid } from "./components/VideoGrid";
import { EmptyState } from "./components/EmptyState";
import { getCategoryLabel } from "@/components/ui/training-videos/constants";

const Pagination = dynamic(() => import("@/components/ui/Navigation/Pagination"), {
  ssr: false,
});

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
            textAlign: { xs: "left", sm: "left" },
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
        <EmptyState
          hasSearch={!!search}
          hasCategory={!!category}
          onAdd={handleAddVideo}
        />
      ) : !category ? (
        // When All Categories is selected - Show grouped by category
        categories.map((cat) => {
          const categoryVideos = videos.filter(video => video.category === cat.name);
          
          if (categoryVideos.length === 0) return null;

          return (
            <CategorySection
              key={cat.name}
              categoryName={cat.name}
              videos={categoryVideos}
              onPlay={handlePlayVideo}
              onEdit={handleEditVideo}
              onDelete={handleDeleteVideo}
              getCategoryLabel={getCategoryLabel}
            />
          );
        })
      ) : (
        // Specific category selected
        <VideoGrid
          videos={videos}
          category={category}
          getCategoryLabel={getCategoryLabel}
          onPlay={handlePlayVideo}
          onEdit={handleEditVideo}
          onDelete={handleDeleteVideo}
        />
      )}

      {/* Pagination */}
      {videos.length > 0 && totalItems > rowsPerPage && (
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
