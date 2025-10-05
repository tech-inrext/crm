/* eslint-disable react/no-unescaped-entities */
// app/dashboard/properties/page.tsx

// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Paper,
//   Typography,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Grid,
//   Chip,
//   IconButton,
//   Snackbar,
//   Alert,
//   Divider,
//   List,
//   ListItem,
//   ListItemText,
//   ListItemSecondaryAction,
//   CircularProgress,
//   MenuItem,
//   OutlinedInput,
//   FormControl,
//   InputLabel,
//   Select,
//   Collapse,
// } from "@mui/material";
// import {
//   Add,
//   Edit,
//   Delete,
//   LocationOn,
//   Photo,
//   VideoLibrary,
//   Description,
//   Download,
//   ArrowBack,
//   ArrowForward,
//   Search,
//   Remove,
//   CloudUpload,
//   FilterList,
//   ExpandMore,
//   ExpandLess,
//   Clear,
// } from "@mui/icons-material";
// import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
// import VisibilityIcon from '@mui/icons-material/Visibility';

// // Leaflet imports for map
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';

// // Import your services
// import { propertyService, type Property } from '@/services/propertyService';

// // Custom debounce hook
// function useDebounce<T>(value: T, delay: number): T {
//   const [debouncedValue, setDebouncedValue] = useState<T>(value);

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);

//   return debouncedValue;
// }

// // Fix for default markers in react-leaflet
// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

// // File upload service using Base64 (no API needed)
// const uploadService = {
//   uploadFile: async (file: File): Promise<{ success: boolean; data?: { url: string; fileName: string }; message?: string }> => {
//     return new Promise((resolve) => {
//       const reader = new FileReader();
      
//       reader.onload = (e) => {
//         const base64 = e.target?.result as string;
//         resolve({
//           success: true,
//           data: {
//             url: base64,
//             fileName: file.name
//           }
//         });
//       };
      
//       reader.onerror = () => {
//         resolve({
//           success: false,
//           message: 'Failed to read file'
//         });
//       };
      
//       reader.readAsDataURL(file);
//     });
//   },
// };

// // Map Component
// const PropertyMap = ({ lat, lng, projectName }: { lat: number; lng: number; projectName: string }) => {
//   if (!lat || !lng) {
//     return (
//       <Box sx={{ 
//         height: '250px', 
//         display: 'flex', 
//         alignItems: 'center', 
//         justifyContent: 'center',
//         backgroundColor: '#f5f5f5',
//         borderRadius: '15px'
//       }}>
//         <Typography variant="body2" color="text.secondary">
//           Location not available
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <MapContainer
//       center={[lat, lng]}
//       zoom={15}
//       style={{ height: '250px', width: '100%', borderRadius: '15px' }}
//       scrollWheelZoom={false}
//       className="property-map"
//     >
//       <TileLayer
//         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       />
//       <Marker position={[lat, lng]}>
//         <Popup>
//           <strong>{projectName}</strong>
//           <br />
//           Latitude: {lat.toFixed(6)}
//           <br />
//           Longitude: {lng.toFixed(6)}
//         </Popup>
//       </Marker>
//     </MapContainer>
//   );
// };

// // Image Carousel Component
// const ImageCarousel = ({ images, projectName }: { images: any[], projectName: string }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);

//   if (!images || images.length === 0) {
//     return (
//       <Box sx={{ 
//         height: '400px', 
//         display: 'flex', 
//         alignItems: 'center', 
//         justifyContent: 'center',
//         backgroundColor: '#f5f5f5',
//         borderRadius: '15px'
//       }}>
//         <Typography variant="body1" color="text.secondary">
//           No images available
//         </Typography>
//       </Box>
//     );
//   }

//   const nextImage = () => {
//     setCurrentIndex((prev) => (prev + 1) % images.length);
//   };

//   const prevImage = () => {
//     setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
//   };

//   const goToImage = (index: number) => {
//     setCurrentIndex(index);
//   };

//   return (
//     <Box sx={{ position: 'relative' }}>
//       {/* Main Image Display */}
//       <Box sx={{ 
//         height: '400px', 
//         position: 'relative',
//         borderRadius: '15px',
//         overflow: 'hidden',
//         backgroundColor: '#f5f5f5'
//       }}>
//         <img
//           src={images[currentIndex]?.url}
//           alt={images[currentIndex]?.title || `${projectName} Image ${currentIndex + 1}`}
//           style={{
//             width: '100%',
//             height: '100%',
//             objectFit: 'cover',
//           }}
//           onError={(e) => {
//             (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Property+Image';
//           }}
//         />
        
//         {/* Navigation Arrows */}
//         {images.length > 1 && (
//           <>
//             <IconButton
//               onClick={prevImage}
//               sx={{
//                 position: 'absolute',
//                 left: 8,
//                 top: '50%',
//                 transform: 'translateY(-50%)',
//                 backgroundColor: 'rgba(0,0,0,0.5)',
//                 color: 'white',
//                 '&:hover': {
//                   backgroundColor: 'rgba(0,0,0,0.7)',
//                 }
//               }}
//             >
//               <ArrowBack />
//             </IconButton>
//             <IconButton
//               onClick={nextImage}
//               sx={{
//                 position: 'absolute',
//                 right: 8,
//                 top: '50%',
//                 transform: 'translateY(-50%)',
//                 backgroundColor: 'rgba(0,0,0,0.5)',
//                 color: 'white',
//                 '&:hover': {
//                   backgroundColor: 'rgba(0,0,0,0.7)',
//                 }
//               }}
//             >
//               <ArrowForward />
//             </IconButton>
//           </>
//         )}

//         {/* Image Counter */}
//         {images.length > 1 && (
//           <Box sx={{
//             position: 'absolute',
//             bottom: 8,
//             right: 8,
//             backgroundColor: 'rgba(0,0,0,0.7)',
//             color: 'white',
//             padding: '4px 8px',
//             borderRadius: '4px',
//             fontSize: '0.75rem'
//           }}>
//             {currentIndex + 1} / {images.length}
//           </Box>
//         )}
//       </Box>
//     </Box>
//   );
// };

// // File Upload Component
// const FileUploadSection = ({ 
//   title, 
//   accept, 
//   onFileUpload, 
//   uploading,
//   description 
// }: { 
//   title: string;
//   accept: string;
//   onFileUpload: (file: File) => void;
//   uploading: boolean;
//   description: string;
// }) => {
//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files;
//     if (!files || files.length === 0) return;
    
//     onFileUpload(files[0]);
//     event.target.value = ''; // Reset input
//   };

//   return (
//     <Box sx={{ mb: 2, p: 2, border: '1px dashed #e0e0e0', borderRadius: '8px', backgroundColor: '#fafafa' }}>
//       <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: '#1976d2' }}>
//         {title}
//       </Typography>
//       <Box display="flex" alignItems="center" gap={1}>
//         <Button
//           variant="outlined"
//           component="label"
//           startIcon={<CloudUpload />}
//           disabled={uploading}
//           sx={{
//             width: '150px',
//             borderRadius: '8px',
//             textTransform: 'none',
//             borderColor: '#1976d2',
//             color: '#1976d2',
//             '&:hover': {
//               borderColor: '#115293',
//               backgroundColor: 'rgba(25, 118, 210, 0.04)',
//             }
//           }}
//         >
//           Choose File
//           <input
//             type="file"
//             hidden
//             accept={accept}
//             onChange={handleFileChange}
//           />
//         </Button>
//         <Typography variant="caption" color="text.secondary">
//           {description}
//         </Typography>
//         {uploading && (
//           <Box display="flex" alignItems="center" gap={1}>
//             <CircularProgress size={16} />
//             <Typography variant="caption">Uploading...</Typography>
//           </Box>
//         )}
//       </Box>
//     </Box>
//   );
// };

// // Filter types
// interface FilterState {
//   status: string[];
//   features: string[];
//   amenities: string[];
//   priceRange: {
//     min: string;
//     max: string;
//   };
//   builderName: string;
//   location: string;
// }

// export default function PropertiesPage() {
//   const [properties, setProperties] = useState<Property[]>([]);
//   const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms debounce delay
//   const [openDialog, setOpenDialog] = useState(false);
//   const [openViewDialog, setOpenViewDialog] = useState(false);
//   const [editingProperty, setEditingProperty] = useState<Property | null>(null);
//   const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
//   const [snackbar, setSnackbar] = useState({ 
//     open: false, 
//     message: "", 
//     severity: "success" as "success" | "error" 
//   });
  
//   // Filter states
//   const [filters, setFilters] = useState<FilterState>({
//     status: [],
//     features: [],
//     amenities: [],
//     priceRange: {
//       min: "",
//       max: "",
//     },
//     builderName: "",
//     location: "",
//   });
  
//   const [showFilters, setShowFilters] = useState(false);
//   const [activeFiltersCount, setActiveFiltersCount] = useState(0);

//   // Upload states
//   const [uploading, setUploading] = useState(false);
//   const [uploadingType, setUploadingType] = useState<'image' | 'brochure' | 'creative' | 'video' | null>(null);
  
//   // Updated form data structure with videoFiles
//   const [formData, setFormData] = useState({
//     projectName: "",
//     builderName: "",
//     description: "",
//     location: "",
//     price: "",
//     status: [] as string[],
//     features: [] as string[],
//     amenities: [] as string[],
//     nearby: [] as string[],
//     projectHighlights: [] as string[],
//     mapLocation: { lat: 0, lng: 0 },
//     images: [] as { url: string; title?: string; description?: string; isPrimary?: boolean }[],
//     brochureUrls: [] as { title: string; url: string; type: string }[],
//     creatives: [] as { title: string; url: string; type: string }[],
//     videoIds: [] as string[],
//     videoFiles: [] as { title: string; url: string; type: string }[] // New field for uploaded videos
//   });
  
//   // Updated form input states
//   const [newFeature, setNewFeature] = useState("");
//   const [newAmenity, setNewAmenity] = useState("");
//   const [newStatus, setNewStatus] = useState("");
//   const [newNearby, setNewNearby] = useState("");
//   const [newProjectHighlight, setNewProjectHighlight] = useState("");
//   const [newVideoId, setNewVideoId] = useState("");

//   // Filter options
//   const statusOptions = [
//     "Ready to Move",
//     "Under Construction",
//     "New Launch",
//     "Pre Launch",
//     "Sold Out",
//     "Coming Soon"
//   ];

//   const featureOptions = [
//     "Swimming Pool",
//     "Gym",
//     "Clubhouse",
//     "Children's Play Area",
//     "24/7 Security",
//     "Power Backup",
//     "Landscaped Gardens",
//     "Jogging Track",
//     "Sports Facilities",
//     "Parking"
//   ];

//   const amenityOptions = [
//     "Wi-Fi Connectivity",
//     "Cafeteria",
//     "Community Hall",
//     "Yoga/Meditation Area",
//     "Convenience Store",
//     "ATM",
//     "Salon/Spa",
//     "Pet Area",
//     "Garbage Disposal",
//     "Water Supply"
//   ];

//   // Calculate active filters count
//   useEffect(() => {
//     let count = 0;
//     if (filters.status.length > 0) count++;
//     if (filters.features.length > 0) count++;
//     if (filters.amenities.length > 0) count++;
//     if (filters.priceRange.min || filters.priceRange.max) count++;
//     if (filters.builderName) count++;
//     if (filters.location) count++;
//     setActiveFiltersCount(count);
//   }, [filters]);

//   // Load properties on component mount
//   useEffect(() => {
//     loadProperties();
//   }, []);

//   // Apply filters when debounced search term or filters change
//   useEffect(() => {
//     applyFilters();
//   }, [debouncedSearchTerm, properties, filters]);

//   const loadProperties = async (search = "") => {
//     try {
//       setLoading(true);
//       const response = await propertyService.getAllProperties(search);
//       if (response.success) {
//         setProperties(response.data);
//       } else {
//         throw new Error(response.message || "Failed to load properties");
//       }
//     } catch (error: any) {
//       console.error('Error loading properties:', error);
//       setSnackbar({ 
//         open: true, 
//         message: error.message || "Failed to load properties", 
//         severity: "error" 
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Apply filters
//   const applyFilters = () => {
//     let filtered = [...properties];

//     // Search filter - uses debounced search term
//     if (debouncedSearchTerm) {
//       filtered = filtered.filter(property =>
//         property.projectName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
//         property.builderName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
//         property.location?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
//         property.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
//         property.features?.some(feature => 
//           feature.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
//         ) ||
//         property.amenities?.some(amenity => 
//           amenity.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
//         )
//       );
//     }

//     // Status filter
//     if (filters.status.length > 0) {
//       filtered = filtered.filter(property =>
//         property.status?.some(status => filters.status.includes(status))
//       );
//     }

//     // Features filter
//     if (filters.features.length > 0) {
//       filtered = filtered.filter(property =>
//         filters.features.every(filterFeature =>
//           property.features?.includes(filterFeature)
//         )
//       );
//     }

//     // Amenities filter
//     if (filters.amenities.length > 0) {
//       filtered = filtered.filter(property =>
//         filters.amenities.every(filterAmenity =>
//           property.amenities?.includes(filterAmenity)
//         )
//       );
//     }

//     // Price range filter
//     if (filters.priceRange.min || filters.priceRange.max) {
//       filtered = filtered.filter(property => {
//         const price = parseFloat(property.price?.replace(/[^\d.]/g, '') || '0');
//         const minPrice = parseFloat(filters.priceRange.min) || 0;
//         const maxPrice = parseFloat(filters.priceRange.max) || Infinity;
//         return price >= minPrice && price <= maxPrice;
//       });
//     }

//     // Builder name filter
//     if (filters.builderName) {
//       filtered = filtered.filter(property =>
//         property.builderName?.toLowerCase().includes(filters.builderName.toLowerCase())
//       );
//     }

//     // Location filter
//     if (filters.location) {
//       filtered = filtered.filter(property =>
//         property.location?.toLowerCase().includes(filters.location.toLowerCase())
//       );
//     }

//     setFilteredProperties(filtered);
//   };

//   // Filter handlers
//   const handleFilterChange = (filterType: keyof FilterState, value: any) => {
//     setFilters(prev => ({
//       ...prev,
//       [filterType]: value
//     }));
//   };

//   const handlePriceRangeChange = (field: 'min' | 'max') => (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFilters(prev => ({
//       ...prev,
//       priceRange: {
//         ...prev.priceRange,
//         [field]: e.target.value
//       }
//     }));
//   };

//   const clearAllFilters = () => {
//     setFilters({
//       status: [],
//       features: [],
//       amenities: [],
//       priceRange: {
//         min: "",
//         max: "",
//       },
//       builderName: "",
//       location: "",
//     });
//     setSearchTerm("");
//   };

//   const removeFilter = (filterType: keyof FilterState, value?: string) => {
//     if (value) {
//       // Remove specific value from array filter
//       setFilters(prev => ({
//         ...prev,
//         [filterType]: (prev[filterType] as string[]).filter(item => item !== value)
//       }));
//     } else {
//       // Clear entire filter
//       setFilters(prev => ({
//         ...prev,
//         [filterType]: Array.isArray(prev[filterType]) ? [] : ""
//       }));
//     }
//   };

//   // Search handler with debouncing
//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(e.target.value);
//     // The actual search will be triggered automatically by the debouncedSearchTerm effect
//   };

//   const handleSearch = () => {
//     // Manual search trigger - uses current searchTerm immediately
//     applyFilters();
//   };

//   // File upload handlers
//   const handleImageUpload = async (file: File) => {
//     setUploading(true);
//     setUploadingType('image');

//     try {
//       // Validate file type
//       const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
//       if (!validImageTypes.includes(file.type)) {
//         setSnackbar({ open: true, message: 'Please select a valid image file (JPEG, PNG, GIF, WebP)', severity: 'error' });
//         return;
//       }

//       // Validate file size (max 5MB)
//       if (file.size > 5 * 1024 * 1024) {
//         setSnackbar({ open: true, message: 'Image size should be less than 5MB', severity: 'error' });
//         return;
//       }

//       const uploadResponse = await uploadService.uploadFile(file);
      
//       if (uploadResponse.success && uploadResponse.data) {
//         // Add uploaded image to form data
//         const uploadedImage = {
//           url: uploadResponse.data.url,
//           title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
//           description: "",
//           isPrimary: formData.images.length === 0 // Set as primary if first image
//         };

//         setFormData(prev => ({
//           ...prev,
//           images: [...prev.images, uploadedImage]
//         }));

//         setSnackbar({ open: true, message: 'Image uploaded successfully', severity: 'success' });
//       } else {
//         throw new Error(uploadResponse.message || 'Upload failed');
//       }
//     } catch (error: any) {
//       console.error('Image upload error:', error);
//       setSnackbar({ open: true, message: error.message || 'Failed to upload image', severity: 'error' });
//     } finally {
//       setUploading(false);
//       setUploadingType(null);
//     }
//   };

//   const handleBrochureUpload = async (file: File) => {
//     setUploading(true);
//     setUploadingType('brochure');

//     try {
//       // Validate file type
//       const validDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
//       if (!validDocTypes.includes(file.type)) {
//         setSnackbar({ open: true, message: 'Please select a PDF or Word document', severity: 'error' });
//         return;
//       }

//       // Validate file size (max 10MB)
//       if (file.size > 10 * 1024 * 1024) {
//         setSnackbar({ open: true, message: 'File size should be less than 10MB', severity: 'error' });
//         return;
//       }

//       const uploadResponse = await uploadService.uploadFile(file);
      
//       if (uploadResponse.success && uploadResponse.data) {
//         // Add uploaded brochure to form data
//         const uploadedBrochure = {
//           title: file.name.replace(/\.[^/.]+$/, ""),
//           url: uploadResponse.data.url,
//           type: "PDF Document"
//         };

//         setFormData(prev => ({
//           ...prev,
//           brochureUrls: [...prev.brochureUrls, uploadedBrochure]
//         }));

//         setSnackbar({ open: true, message: 'Brochure uploaded successfully', severity: 'success' });
//       } else {
//         throw new Error(uploadResponse.message || 'Upload failed');
//       }
//     } catch (error: any) {
//       console.error('Brochure upload error:', error);
//       setSnackbar({ open: true, message: error.message || 'Failed to upload brochure', severity: 'error' });
//     } finally {
//       setUploading(false);
//       setUploadingType(null);
//     }
//   };

//   const handleCreativeUpload = async (file: File) => {
//     setUploading(true);
//     setUploadingType('creative');

//     try {
//       // Validate file type
//       const validCreativeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf'];
//       if (!validCreativeTypes.includes(file.type)) {
//         setSnackbar({ open: true, message: 'Please select a valid image or PDF file', severity: 'error' });
//         return;
//       }

//       // Validate file size (max 10MB)
//       if (file.size > 10 * 1024 * 1024) {
//         setSnackbar({ open: true, message: 'File size should be less than 10MB', severity: 'error' });
//         return;
//       }

//       const uploadResponse = await uploadService.uploadFile(file);
      
//       if (uploadResponse.success && uploadResponse.data) {
//         // Add uploaded creative to form data
//         const uploadedCreative = {
//           title: file.name.replace(/\.[^/.]+$/, ""),
//           url: uploadResponse.data.url,
//           type: file.type.includes('image') ? 'Image' : 'PDF Document'
//         };

//         setFormData(prev => ({
//           ...prev,
//           creatives: [...prev.creatives, uploadedCreative]
//         }));

//         setSnackbar({ open: true, message: 'Creative asset uploaded successfully', severity: 'success' });
//       } else {
//         throw new Error(uploadResponse.message || 'Upload failed');
//       }
//     } catch (error: any) {
//       console.error('Creative upload error:', error);
//       setSnackbar({ open: true, message: error.message || 'Failed to upload creative asset', severity: 'error' });
//     } finally {
//       setUploading(false);
//       setUploadingType(null);
//     }
//   };

//   // New video upload handler
//   const handleVideoUpload = async (file: File) => {
//     setUploading(true);
//     setUploadingType('video');

//     try {
//       // Validate file type
//       const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/quicktime'];
//       if (!validVideoTypes.includes(file.type)) {
//         setSnackbar({ open: true, message: 'Please select a valid video file (MP4, MOV, AVI, MKV)', severity: 'error' });
//         return;
//       }

//       // Validate file size (max 50MB)
//       if (file.size > 50 * 1024 * 1024) {
//         setSnackbar({ open: true, message: 'Video size should be less than 50MB', severity: 'error' });
//         return;
//       }

//       const uploadResponse = await uploadService.uploadFile(file);
      
//       if (uploadResponse.success && uploadResponse.data) {
//         // Add uploaded video to form data
//         const uploadedVideo = {
//           title: file.name.replace(/\.[^/.]+$/, ""),
//           url: uploadResponse.data.url,
//           type: "Video File"
//         };

//         setFormData(prev => ({
//           ...prev,
//           videoFiles: [...prev.videoFiles, uploadedVideo]
//         }));

//         setSnackbar({ open: true, message: 'Video uploaded successfully', severity: 'success' });
//       } else {
//         throw new Error(uploadResponse.message || 'Upload failed');
//       }
//     } catch (error: any) {
//       console.error('Video upload error:', error);
//       setSnackbar({ open: true, message: error.message || 'Failed to upload video', severity: 'error' });
//     } finally {
//       setUploading(false);
//       setUploadingType(null);
//     }
//   };

//   const handleOpenDialog = (property: Property | null = null) => {
//     if (property) {
//       setEditingProperty(property);
//       setFormData({
//         projectName: property.projectName || "",
//         builderName: property.builderName || "",
//         description: property.description || "",
//         location: property.location || "",
//         price: property.price || "",
//         status: property.status || [],
//         features: property.features || [],
//         amenities: property.amenities || [],
//         nearby: property.nearby || [],
//         projectHighlights: property.projectHighlights || [],
//         mapLocation: property.mapLocation || { lat: 0, lng: 0 },
//         images: property.images || [],
//         brochureUrls: property.brochureUrls || [],
//         creatives: property.creatives || [],
//         videoIds: property.videoIds || [],
//         videoFiles: property.videoFiles || [] // Initialize videoFiles
//       });
//     } else {
//       setEditingProperty(null);
//       setFormData({
//         projectName: "",
//         builderName: "",
//         description: "",
//         location: "",
//         price: "",
//         status: [],
//         features: [],
//         amenities: [],
//         nearby: [],
//         projectHighlights: [],
//         mapLocation: { lat: 0, lng: 0 },
//         images: [],
//         brochureUrls: [],
//         creatives: [],
//         videoIds: [],
//         videoFiles: [] // Initialize videoFiles
//       });
//     }
//     setOpenDialog(true);
//   };

//   const handleCloseDialog = () => {
//     setOpenDialog(false);
//     setEditingProperty(null);
//     // Reset form input states
//     setNewFeature("");
//     setNewAmenity("");
//     setNewStatus("");
//     setNewNearby("");
//     setNewProjectHighlight("");
//     setNewVideoId("");
//   };

//   const handleViewProperty = (property: Property) => {
//     setViewingProperty(property);
//     setOpenViewDialog(true);
//   };

//   const handleCloseViewDialog = () => {
//     setOpenViewDialog(false);
//     setViewingProperty(null);
//   };

//   // Download handlers
//   const handleDownloadBrochure = (url: string, propertyName: string, index: number, title?: string) => {
//     try {
//       const link = document.createElement('a');
//       link.href = url;
//       const fileName = title 
//         ? `${propertyName.replace(/\s+/g, '_')}_${title.replace(/[^a-z0-9]/gi, '_')}.pdf`
//         : `${propertyName.replace(/\s+/g, '_')}_Brochure_${index + 1}.pdf`;
//       link.download = fileName;
//       link.target = '_blank';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       setSnackbar({ open: true, message: "Brochure download started", severity: "success" });
//     } catch (error) {
//       setSnackbar({ open: true, message: "Download failed", severity: "error" });
//     }
//   };

//   const handleDownloadCreative = (url: string, propertyName: string, index: number, title?: string) => {
//     try {
//       const link = document.createElement('a');
//       link.href = url;
//       const extension = url.split('.').pop() || 'jpg';
//       const fileName = title 
//         ? `${propertyName.replace(/\s+/g, '_')}_${title.replace(/[^a-z0-9]/gi, '_')}.${extension}`
//         : `${propertyName.replace(/\s+/g, '_')}_Creative_${index + 1}.${extension}`;
//       link.download = fileName;
//       link.target = '_blank';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       setSnackbar({ open: true, message: "Creative asset download started", severity: "success" });
//     } catch (error) {
//       setSnackbar({ open: true, message: "Download failed", severity: "error" });
//     }
//   };

//   const handleDownloadImage = (url: string, propertyName: string, index: number, title?: string) => {
//     try {
//       const link = document.createElement('a');
//       link.href = url;
//       const extension = url.split('.').pop() || 'jpg';
//       const fileName = title 
//         ? `${propertyName.replace(/\s+/g, '_')}_${title.replace(/[^a-z0-9]/gi, '_')}.${extension}`
//         : `${propertyName.replace(/\s+/g, '_')}_Image_${index + 1}.${extension}`;
//       link.download = fileName;
//       link.target = '_blank';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       setSnackbar({ open: true, message: "Image download started", severity: "success" });
//     } catch (error) {
//       setSnackbar({ open: true, message: "Download failed", severity: "error" });
//     }
//   };

//   // New video download handler
//   const handleDownloadVideo = (url: string, propertyName: string, index: number, title?: string) => {
//     try {
//       const link = document.createElement('a');
//       link.href = url;
//       const extension = url.split('.').pop() || 'mp4';
//       const fileName = title 
//         ? `${propertyName.replace(/\s+/g, '_')}_${title.replace(/[^a-z0-9]/gi, '_')}.${extension}`
//         : `${propertyName.replace(/\s+/g, '_')}_Video_${index + 1}.${extension}`;
//       link.download = fileName;
//       link.target = '_blank';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       setSnackbar({ open: true, message: "Video download started", severity: "success" });
//     } catch (error) {
//       setSnackbar({ open: true, message: "Download failed", severity: "error" });
//     }
//   };

//   const handleDownloadAllBrochures = (property: Property) => {
//     if (property.brochureUrls && property.brochureUrls.length > 0) {
//       property.brochureUrls.forEach((brochure: any, index: number) => {
//         setTimeout(() => handleDownloadBrochure(brochure.url, property.projectName, index, brochure.title), index * 500);
//       });
//       setSnackbar({ open: true, message: `Downloading ${property.brochureUrls.length} brochures`, severity: "success" });
//     }
//   };

//   const handleDownloadAllCreatives = (property: Property) => {
//     if (property.creatives && property.creatives.length > 0) {
//       property.creatives.forEach((creative: any, index: number) => {
//         setTimeout(() => handleDownloadCreative(creative.url, property.projectName, index, creative.title), index * 500);
//       });
//       setSnackbar({ open: true, message: `Downloading ${property.creatives.length} creative assets`, severity: "success" });
//     }
//   };

//   const handleDownloadAllImages = (property: Property) => {
//     if (property.images && property.images.length > 0) {
//       property.images.forEach((image: any, index: number) => {
//         setTimeout(() => handleDownloadImage(image.url, property.projectName, index, image.title), index * 500);
//       });
//       setSnackbar({ open: true, message: `Downloading ${property.images.length} images`, severity: "success" });
//     }
//   };

//   // New function to download all videos
//   const handleDownloadAllVideos = (property: Property) => {
//     if (property.videoFiles && property.videoFiles.length > 0) {
//       property.videoFiles.forEach((video: any, index: number) => {
//         setTimeout(() => handleDownloadVideo(video.url, property.projectName, index, video.title), index * 500);
//       });
//       setSnackbar({ open: true, message: `Downloading ${property.videoFiles.length} videos`, severity: "success" });
//     }
//   };

//   // Form handlers
//   const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setFormData(prev => ({ ...prev, [field]: e.target.value }));
//   };

//   const handleMapLocationChange = (field: 'lat' | 'lng') => (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = parseFloat(e.target.value) || 0;
//     setFormData(prev => ({
//       ...prev,
//       mapLocation: { ...prev.mapLocation, [field]: value }
//     }));
//   };

//   // Array field handlers
//   // const handleAddStatus = () => {
//   //   if (newStatus.trim()) {
//   //     setFormData(prev => ({
//   //       ...prev,
//   //       status: [...prev.status, newStatus.trim()]
//   //     }));
//   //     setNewStatus("");
//   //   }
//   // };

//   // const removeStatus = (index: number) => {
//   //   setFormData(prev => ({
//   //     ...prev,
//   //     status: prev.status.filter((_, i) => i !== index)
//   //   }));
//   // };

//   // const handleAddFeature = () => {
//   //   if (newFeature.trim()) {
//   //     setFormData(prev => ({
//   //       ...prev,
//   //       features: [...prev.features, newFeature.trim()]
//   //     }));
//   //     setNewFeature("");
//   //   }
//   // };

//   // const removeFeature = (index: number) => {
//   //   setFormData(prev => ({
//   //     ...prev,
//   //     features: prev.features.filter((_, i) => i !== index)
//   //   }));
//   // };

//   // const handleAddAmenity = () => {
//   //   if (newAmenity.trim()) {
//   //     setFormData(prev => ({
//   //       ...prev,
//   //       amenities: [...prev.amenities, newAmenity.trim()]
//   //     }));
//   //     setNewAmenity("");
//   //   }
//   // };

//   // const removeAmenity = (index: number) => {
//   //   setFormData(prev => ({
//   //     ...prev,
//   //     amenities: prev.amenities.filter((_, i) => i !== index)
//   //   }));
//   // };

//   // const handleAddNearby = () => {
//   //   if (newNearby.trim()) {
//   //     setFormData(prev => ({
//   //       ...prev,
//   //       nearby: [...prev.nearby, newNearby.trim()]
//   //     }));
//   //     setNewNearby("");
//   //   }
//   // };

//   // const removeNearby = (index: number) => {
//   //   setFormData(prev => ({
//   //     ...prev,
//   //     nearby: prev.nearby.filter((_, i) => i !== index)
//   //   }));
//   // };

//   // const handleAddProjectHighlight = () => {
//   //   if (newProjectHighlight.trim()) {
//   //     setFormData(prev => ({
//   //       ...prev,
//   //       projectHighlights: [...prev.projectHighlights, newProjectHighlight.trim()]
//   //     }));
//   //     setNewProjectHighlight("");
//   //   }
//   // };

//   // const removeProjectHighlight = (index: number) => {
//   //   setFormData(prev => ({
//   //     ...prev,
//   //     projectHighlights: prev.projectHighlights.filter((_, i) => i !== index)
//   //   }));
//   // };

//   const removeImage = (index: number) => {
//     setFormData(prev => ({
//       ...prev,
//       images: prev.images.filter((_, i) => i !== index)
//     }));
//   };

//   const setPrimaryImage = (index: number) => {
//     setFormData(prev => ({
//       ...prev,
//       images: prev.images.map((img, i) => ({ ...img, isPrimary: i === index }))
//     }));
//   };

//   const removeBrochureUrl = (index: number) => {
//     setFormData(prev => ({
//       ...prev,
//       brochureUrls: prev.brochureUrls.filter((_, i) => i !== index)
//     }));
//   };

//   const removeCreative = (index: number) => {
//     setFormData(prev => ({
//       ...prev,
//       creatives: prev.creatives.filter((_, i) => i !== index)
//     }));
//   };

//   // New function to remove video files
//   const removeVideoFile = (index: number) => {
//     setFormData(prev => ({
//       ...prev,
//       videoFiles: prev.videoFiles.filter((_, i) => i !== index)
//     }));
//   };

//   const handleAddVideoId = () => {
//     if (newVideoId.trim()) {
//       setFormData(prev => ({
//         ...prev,
//         videoIds: [...prev.videoIds, newVideoId.trim()]
//       }));
//       setNewVideoId("");
//     }
//   };

//   const removeVideoId = (index: number) => {
//     setFormData(prev => ({
//       ...prev,
//       videoIds: prev.videoIds.filter((_, i) => i !== index)
//     }));
//   };

//   // Helper function to detect video platform
//   const getVideoPlatform = (url: string) => {
//     if (url.includes('youtube.com') || url.includes('youtu.be')) {
//       return 'YouTube';
//     } else if (url.includes('vimeo.com')) {
//       return 'Vimeo';
//     } else if (url.length === 11) { // YouTube video ID length
//       return 'YouTube Video ID';
//     } else {
//       return 'Video URL';
//     }
//   };

//   const handleSubmit = async () => {
//     try {
//       if (editingProperty && editingProperty._id) {
//         // Update existing property
//         await propertyService.updateProperty(editingProperty._id, formData);
//         setSnackbar({ open: true, message: "Property updated successfully", severity: "success" });
//       } else {
//         // Create new property
//         await propertyService.createProperty(formData);
//         setSnackbar({ open: true, message: "Property added successfully", severity: "success" });
//       }
//       handleCloseDialog();
//       loadProperties(); // Reload the properties list
//     } catch (error: any) {
//       console.error('Error saving property:', error);
//       setSnackbar({ 
//         open: true, 
//         message: error.message || "Failed to save property", 
//         severity: "error" 
//       });
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (window.confirm("Are you sure you want to delete this property?")) {
//       try {
//         await propertyService.deleteProperty(id);
//         setSnackbar({ open: true, message: "Property deleted successfully", severity: "success" });
//         loadProperties(); // Reload the properties list
//       } catch (error: any) {
//         console.error('Error deleting property:', error);
//         setSnackbar({ 
//           open: true, 
//           message: error.message || "Failed to delete property", 
//           severity: "error" 
//         });
//       }
//     }
//   };

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
//         <CircularProgress />
//         <Typography variant="h6" sx={{ ml: 2 }}>
//           Loading properties...
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: 3 }}>
//       {/* Header */}
//       <Paper
//         sx={{
//           p: { xs: 2, sm: 3 },
//           mb: 3,
//           background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
//         }}
//       >
//         <Grid
//           container
//           spacing={2}
//           alignItems="center"
//           justifyContent="space-between"
//         >
//           {/* Title */}
//           <Grid  item xs={12} md="auto">
//             <Typography
//               variant="h5"
//               fontWeight={700}
//               sx={{ textAlign: { xs: "center", md: "left" }, mb: { xs: 2, md: 0 } }}
//             >
//               Properties
//             </Typography>
//           </Grid>

//           {/* Search & Buttons */}
//           <Grid
//             item
//             xs={12}
//             md
//             display="flex"
//             flexDirection={{ xs: "column", sm: "row" }}
//             gap={1}
//             alignItems="center"
//             justifyContent={{ xs: "center", md: "flex-end" }}
//             sx={{ maxWidth: "100%" }}
//           >
//             {/* Search Field with Debouncing */}
//             <TextField
//               fullWidth
//               variant="outlined"
//               placeholder="Search properties by name, builder, location, features..."
//               value={searchTerm}
//               onChange={handleSearchChange} // Updated to use debounced handler
//               onKeyPress={(e) => e.key === "Enter" && handleSearch()}
//               size="small"
//               sx={{
//                 flex: 1,
//                 "& .MuiOutlinedInput-root": {
//                   borderRadius: "25px",
//                   backgroundColor: "white",
//                 },
//               }}
//             />

//             <Grid item sx={{ width: { xs: '100%', sm: 'auto' }, display: 'flex', flexWrap: 'wrap', gap: 1,  justifyContent: { xs: 'center', md: 'flex-end' } }}>
//               {/* Search Button */}
//               {/* <Button
//                 variant="contained"
//                 startIcon={<Search />}
//                 onClick={handleSearch}
//                 sx={{
//                   borderRadius: "8px",
//                   px: 3,
//                   backgroundColor: "#1976d2",
//                   whiteSpace: "nowrap",
//                   "&:hover": { backgroundColor: "#115293" },
//                 }}
//               >
//                 Search
//               </Button> */}

//               {/* Filter Toggle Button */}
//               <Button
//                 variant="outlined"
//                 startIcon={<FilterList />}
//                 onClick={() => setShowFilters(!showFilters)}
//                 sx={{
//                   borderRadius: "8px",
//                   whiteSpace: "nowrap",
//                   position: 'relative',
//                 }}
//               >
//                 Filters
//                 {activeFiltersCount > 0 && (
//                   <Box
//                     sx={{
//                       position: 'absolute',
//                       top: -8,
//                       right: -8,
//                       backgroundColor: '#1976d2',
//                       color: 'white',
//                       borderRadius: '50%',
//                       width: 20,
//                       height: 20,
//                       fontSize: '0.75rem',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                     }}
//                   >
//                     {activeFiltersCount}
//                   </Box>
//                 )}
//               </Button>

//               {/* Clear Button */}
//               {/* {(searchTerm || activeFiltersCount > 0) && (
//                 <Button
//                   variant="outlined"
//                   onClick={clearAllFilters}
//                   sx={{ borderRadius: "8px", whiteSpace: "nowrap" }}
//                 >
//                   Clear All
//                 </Button>
//               )} */}

//               {/* Add Property Button */}
//               <Button
//                 variant="contained"
//                 startIcon={<Add />}
//                 onClick={() => handleOpenDialog()}
//                 sx={{
//                   backgroundColor: "#1976d2",
//                   borderRadius: "8px",
//                   px: 3,
//                   whiteSpace: "nowrap",
//                   "&:hover": { backgroundColor: "#115293" },
//                 }}
//               >
//                 Add Property
//               </Button>
//             </Grid>
//           </Grid>
//         </Grid>

//         {/* Search Results Count */}
//         {(searchTerm || activeFiltersCount > 0) && (
//           <Typography
//             variant="body2"
//             color="text.secondary"
//             sx={{ mt: 2, textAlign: { xs: "center", md: "left" } }}
//           >
//             Found {filteredProperties.length} property
//             {filteredProperties.length !== 1 ? "ies" : ""} 
//             {searchTerm && ` matching "${searchTerm}"`}
//             {activeFiltersCount > 0 && ` with ${activeFiltersCount} filter${activeFiltersCount !== 1 ? 's' : ''} applied`}
//           </Typography>
//         )}

//         {/* Active Filters Chips */}
//         {(filters.status.length > 0 || filters.features.length > 0 || filters.amenities.length > 0 || 
//           filters.priceRange.min || filters.priceRange.max || filters.builderName || filters.location) && (
//           <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//             {filters.status.map((status, index) => (
//               <Chip
//                 key={status}
//                 label={`Status: ${status}`}
//                 onDelete={() => removeFilter('status', status)}
//                 size="small"
//                 color="primary"
//                 variant="outlined"
//               />
//             ))}
//             {filters.features.map((feature, index) => (
//               <Chip
//                 key={feature}
//                 label={`Feature: ${feature}`}
//                 onDelete={() => removeFilter('features', feature)}
//                 size="small"
//                 color="secondary"
//                 variant="outlined"
//               />
//             ))}
//             {filters.amenities.map((amenity, index) => (
//               <Chip
//                 key={amenity}
//                 label={`Amenity: ${amenity}`}
//                 onDelete={() => removeFilter('amenities', amenity)}
//                 size="small"
//                 color="success"
//                 variant="outlined"
//               />
//             ))}
//             {(filters.priceRange.min || filters.priceRange.max) && (
//               <Chip
//                 label={`Price: ${filters.priceRange.min || '0'} - ${filters.priceRange.max || '∞'}`}
//                 onDelete={() => removeFilter('priceRange')}
//                 size="small"
//                 color="warning"
//                 variant="outlined"
//               />
//             )}
//             {filters.builderName && (
//               <Chip
//                 label={`Builder: ${filters.builderName}`}
//                 onDelete={() => removeFilter('builderName')}
//                 size="small"
//                 color="info"
//                 variant="outlined"
//               />
//             )}
//             {filters.location && (
//               <Chip
//                 label={`Location: ${filters.location}`}
//                 onDelete={() => removeFilter('location')}
//                 size="small"
//                 color="error"
//                 variant="outlined"
//               />
//             )}
//           </Box>
//         )}
//       </Paper>

//       {/* Filters Panel */}
//       <Collapse in={showFilters}>
//         <Paper sx={{ p: 3, mb: 3, borderRadius: '15px', border: '1px solid #e0e0e0' }}>
//           <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//             <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
//               <FilterList sx={{ mr: 1 }} />
//               Filter Properties
//             </Typography>
//             <Button
//               startIcon={<Clear />}
//               onClick={clearAllFilters}
//               size="small"
//               sx={{ borderRadius: '8px' }}
//             >
//               Clear All
//             </Button>
//           </Box>
          
//           <Grid container spacing={3}>
//             {/* Status Filter */}
//             <Grid size={{ xs: 12, md: 6, lg: 4 }}>
//               <FormControl fullWidth>
//                 <InputLabel>Status</InputLabel>
//                 <Select
//                   multiple
//                   value={filters.status}
//                   onChange={(e) => handleFilterChange('status', e.target.value)}
//                   input={<OutlinedInput label="Status" />}
//                   renderValue={(selected) => (
//                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                       {(selected as string[]).map((value) => (
//                         <Chip key={value} label={value} size="small" />
//                       ))}
//                     </Box>
//                   )}
//                 >
//                   {statusOptions.map((status) => (
//                     <MenuItem key={status} value={status}>
//                       {status}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>

//             {/* Features Filter */}
//             <Grid size={{ xs: 12, md: 6, lg: 4 }}>
//               <FormControl fullWidth>
//                 <InputLabel>Features</InputLabel>
//                 <Select
//                   multiple
//                   value={filters.features}
//                   onChange={(e) => handleFilterChange('features', e.target.value)}
//                   input={<OutlinedInput label="Features" />}
//                   renderValue={(selected) => (
//                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                       {(selected as string[]).map((value) => (
//                         <Chip key={value} label={value} size="small" />
//                       ))}
//                     </Box>
//                   )}
//                 >
//                   {featureOptions.map((feature) => (
//                     <MenuItem key={feature} value={feature}>
//                       {feature}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>

//             {/* Amenities Filter */}
//             <Grid size={{ xs: 12, md: 6, lg: 4 }}>
//               <FormControl fullWidth>
//                 <InputLabel>Amenities</InputLabel>
//                 <Select
//                   multiple
//                   value={filters.amenities}
//                   onChange={(e) => handleFilterChange('amenities', e.target.value)}
//                   input={<OutlinedInput label="Amenities" />}
//                   renderValue={(selected) => (
//                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                       {(selected as string[]).map((value) => (
//                         <Chip key={value} label={value} size="small" />
//                       ))}
//                     </Box>
//                   )}
//                 >
//                   {amenityOptions.map((amenity) => (
//                     <MenuItem key={amenity} value={amenity}>
//                       {amenity}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>

//             {/* Price Range Filter */}
//             <Grid size={{ xs: 12, md: 6 }}>
//               <Box display="flex" gap={2}>
//                 <TextField
//                   fullWidth
//                   label="Min Price"
//                   value={filters.priceRange.min}
//                   onChange={handlePriceRangeChange('min')}
//                   placeholder="0"
//                 />
//                 <TextField
//                   fullWidth
//                   label="Max Price"
//                   value={filters.priceRange.max}
//                   onChange={handlePriceRangeChange('max')}
//                   placeholder="No limit"
//                 />
//               </Box>
//             </Grid>

//             {/* Builder Name Filter */}
//             <Grid size={{ xs: 12, md: 6 }}>
//               <TextField
//                 fullWidth
//                 label="Builder Name"
//                 value={filters.builderName}
//                 onChange={(e) => handleFilterChange('builderName', e.target.value)}
//                 placeholder="Search by builder..."
//               />
//             </Grid>

//             {/* Location Filter */}
//             <Grid size={{ xs: 12 }}>
//               <TextField
//                 fullWidth
//                 label="Location"
//                 value={filters.location}
//                 onChange={(e) => handleFilterChange('location', e.target.value)}
//                 placeholder="Search by location..."
//               />
//             </Grid>
//           </Grid>
//         </Paper>
//       </Collapse>

//       {/* Properties Grid */}
//       <Grid container spacing={3}>
//         {filteredProperties.map((property) => {
//           const primaryImage = property.images?.find(img => img.isPrimary) || property.images?.[0];
        
//           return (
//             <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} key={property._id}>
//               <Paper
//                 onClick={() => handleViewProperty(property)} 
//                 sx={{ 
//                   p: 2, 
//                   height: "15rem", 
//                   transition: "transform 0.2s", 
//                   "&:hover": { transform: "translateY(-4px)" },
//                   backgroundImage: primaryImage ? `url(${primaryImage.url})` : 'none',
//                   backgroundSize: 'cover',
//                   backgroundPosition: 'center',
//                   backgroundRepeat: 'no-repeat',
//                   position: 'relative',
//                   '&::before': {
//                     content: '""',
//                     position: 'absolute',
//                     top: 0,
//                     left: 0,
//                     right: 0,
//                     bottom: 0,
//                     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//                     borderRadius: 'inherit',
//                   },
//                   display: 'flex',
//                   flexDirection: 'column',
//                   justifyContent: 'space-between', 
//                   cursor: 'pointer',
//                   borderRadius: '15px'
//                 }}
//               >
//                 {/* Icon buttons positioned at the end (top right) */}
//                 <Box display="flex" justifyContent="flex-end" alignItems="flex-start">
//                   <Box>
//                     <IconButton size="small" onClick={() => handleViewProperty(property)} sx={{ color: 'white' }} title="Preview Property">
//                       <VisibilityIcon />
//                     </IconButton>
//                     <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenDialog(property); }} sx={{ color: 'white' }} title="Edit Property">
//                       <Edit />
//                     </IconButton>
//                     <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(property._id!); }} sx={{ color: 'white' }} title="Delete Property">
//                       <Delete />
//                     </IconButton>
//                   </Box>
//                 </Box>

//                 {/* Centered typography content */}
//                 <Box 
//                   position="absolute" 
//                   zIndex={1} 
//                   sx={{ 
//                     color: 'white',
//                     textAlign: 'center', 
//                     display: 'flex',
//                     flexDirection: 'column',
//                     justifyContent: 'center', 
//                     alignItems: 'center', 
//                     bottom: '10px', 
//                     left: 0,
//                     right: 0,
//                     width: '100%'
//                   }}
//                 >
//                   <Typography variant="h6" fontWeight={600} sx={{ color: 'white' }}>
//                     {property.projectName}
//                   </Typography>
//                   <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }} gutterBottom>
//                     by {property.builderName}
//                   </Typography>
//                 </Box>
//               </Paper>
//             </Grid>
//           );
//         })}
//       </Grid>

//       {/* Show message when no results found */}
//       {filteredProperties.length === 0 && !loading && (
//         <Paper sx={{ p: 4, textAlign: 'center', mt: 2, borderRadius: '15px' }}>
//           <Typography variant="h6" color="text.secondary" gutterBottom>
//             {searchTerm || activeFiltersCount > 0 
//               ? 'No properties found matching your search criteria.' 
//               : 'No properties found.'}
//           </Typography>
//           {(searchTerm || activeFiltersCount > 0) && (
//             <Button 
//               variant="contained" 
//               onClick={clearAllFilters}
//               sx={{ mt: 2 }}
//             >
//               Clear Search & Filters
//             </Button>
//           )}
//         </Paper>
//       )}

//       {/* View Property Dialog */}
//       <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="lg" fullWidth>
//         <DialogTitle>
//           <Box display="flex" justifyContent="space-between" alignItems="center">
//             <Box>
//               <Typography variant="h5" fontWeight={600}>
//                 {viewingProperty?.projectName}
//               </Typography>
//               <Typography variant="subtitle1" color="text.secondary">
//                 by {viewingProperty?.builderName}
//               </Typography>
//             </Box>
//           </Box>
//         </DialogTitle>
        
//         <DialogContent>
//           <Grid container spacing={3}>
//             {/* Primary Image */}
//             <Grid  display={"flex"} flexWrap={'wrap'} gap={'1.5rem'} maxHeight={'100%'}>
//               {/* image */}
//               <Grid size={{ xs: 12, lg: 8 }}>
//               {viewingProperty?.images && viewingProperty.images.length > 0 && (
//                 <Grid size={{ xs: 12, md: 12 }}>
//                   <ImageCarousel 
//                       images={viewingProperty.images} 
//                       projectName={viewingProperty.projectName}
//                     />
//                 </Grid>
//               )}
//               </Grid>
//               {/* Basic Information */}
//               <Grid size={{ xs: 12, lg: 4 }}>
//                 <Paper sx={{ p: 2, height: '100%' }}>
//                   <Typography variant="h6" gutterBottom>Basic Information</Typography>
                  
//                   <Box display="flex" alignItems="center" mb={1}>
//                     <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
//                     <Typography variant="body2">{viewingProperty?.location}</Typography>
//                   </Box>
                  
//                   <Box display="flex" alignItems="center" mb={2}>
//                     <CurrencyRupeeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
//                     <Typography variant="body2" fontWeight={600}>{viewingProperty?.price}</Typography>
//                   </Box>
                  
//                   <Typography variant="body2" paragraph>
//                     {viewingProperty?.description}
//                   </Typography>
                  
//                   {viewingProperty?.nearby && viewingProperty.nearby.length > 0 && (
//                     <Box>
//                       <Typography variant="subtitle2" gutterBottom>Nearby Places</Typography>
//                       <Box display="flex" flexWrap="wrap" gap={0.5}>
//                         {viewingProperty.nearby.map((place: string, index: number) => (
//                           <Chip key={index} label={place} size="small" variant="outlined" />
//                         ))}
//                       </Box>
//                     </Box>
//                   )}
//                 </Paper>
//               </Grid>
//             </Grid>
            
//             {/* Features & Amenities */}
//             <Grid size={{ xs: 12, md: 6 }}>
//               <Paper sx={{ p: 2, height: '100%' }}>
//                 <Typography variant="h6" gutterBottom>Features & Amenities</Typography>
                
//                 {viewingProperty?.features && viewingProperty.features.length > 0 && (
//                   <Box mb={2}>
//                     <Typography variant="subtitle2" gutterBottom>Features</Typography>
//                     <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
//                       {viewingProperty.features.map((feature: string, index: number) => (
//                         <Chip key={index} label={feature} size="small" variant="outlined" />
//                       ))}
//                     </Box>
//                   </Box>
//                 )}
                
//                 {viewingProperty?.amenities && viewingProperty.amenities.length > 0 && (
//                   <Box>
//                     <Typography variant="subtitle2" gutterBottom>Amenities</Typography>
//                     <Box display="flex" flexWrap="wrap" gap={0.5}>
//                       {viewingProperty.amenities.map((amenity: string, index: number) => (
//                         <Chip key={index} label={amenity} size="small" color="primary" />
//                       ))}
//                     </Box>
//                   </Box>
//                 )}
//               </Paper>
//             </Grid>

//             {/* Status & Project Highlights */}
//             <Grid size={{ xs: 12, md: 6 }}>
//               <Paper sx={{ p: 2, height: '100%' }}>
//                 <Typography variant="h6" gutterBottom>Status & Project Highlights</Typography>
                
//                 {viewingProperty?.status && viewingProperty.status.length > 0 && (
//                   <Box mb={2}>
//                     <Typography variant="subtitle2" gutterBottom>Status</Typography>
//                     <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
//                       {viewingProperty.status.map((statusItem: string, index: number) => (
//                         <Chip 
//                           key={index}
//                           label={statusItem} 
//                           size="small" 
//                           color={statusItem === "Ready to Move" ? "success" : "warning"}
//                         />
//                       ))}
//                     </Box>
//                   </Box>
//                 )}
                
//                 {viewingProperty?.projectHighlights && viewingProperty.projectHighlights.length > 0 && (
//                   <Box mb={2}>
//                     <Typography variant="subtitle2" gutterBottom>Project Highlights</Typography>
//                     <Box display="flex" flexWrap="wrap" gap={0.5}>
//                       {viewingProperty.projectHighlights.map((highlight: string, index: number) => (
//                         <Chip 
//                           key={index}
//                           label={highlight} 
//                           size="small" 
//                           variant="outlined"
//                           color="secondary"
//                         />
//                       ))}
//                     </Box>
//                   </Box>
//                 )}
//               </Paper>
//             </Grid>
            
//             {/* Map Location */}
//             {viewingProperty?.mapLocation && (
//               <Grid size={{ xs: 12, md: 6 }}>
//                 <Paper sx={{ p: 2 }}>
//                   <Typography variant="h6" gutterBottom>Location</Typography>
//                   <PropertyMap 
//                     lat={viewingProperty.mapLocation.lat} 
//                     lng={viewingProperty.mapLocation.lng}
//                     projectName={viewingProperty.projectName}
//                   />
//                   <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
//                     <Typography variant="body2" color="text.secondary">
//                       Latitude: {viewingProperty.mapLocation.lat}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       Longitude: {viewingProperty.mapLocation.lng}
//                     </Typography>
//                   </Box>
//                 </Paper>
//               </Grid>
//             )}

//             {/* Enhanced Media Assets with Download */}
//             <Grid size={{ xs: 12, md: 6 }}>
//               <Paper sx={{ p: 2 }}>
//                 <Typography variant="h6" gutterBottom>Media Assets</Typography>
                
//                 {viewingProperty?.brochureUrls && viewingProperty.brochureUrls.length > 0 && (
//                   <Box mb={2}>
//                     <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
//                       <Typography variant="subtitle2">
//                         <Description fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} />
//                         Brochures ({viewingProperty.brochureUrls.length})
//                       </Typography>
//                       <Button
//                         size="small"
//                         variant="outlined"
//                         startIcon={<Download />}
//                         onClick={() => handleDownloadAllBrochures(viewingProperty)}
//                       >
//                         Download All
//                       </Button>
//                     </Box>
//                     <List dense>
//                       {viewingProperty.brochureUrls.map((brochure: any, index: number) => (
//                         <ListItem key={index} sx={{ pl: 0 }}>
//                           <ListItemText 
//                             primary={brochure.title || `Brochure ${index + 1}`}
//                             secondary={
//                               <Box>
//                                 <Typography variant="caption" display="block">
//                                   {brochure.url.length > 50 ? `${brochure.url.substring(0, 50)}...` : brochure.url}
//                                 </Typography>
//                                 <Typography variant="caption" color="text.secondary">
//                                   Type: {brochure.type}
//                                 </Typography>
//                               </Box>
//                             }
//                           />
//                           <ListItemSecondaryAction>
//                             <IconButton 
//                               size="small" 
//                               onClick={() => handleDownloadBrochure(brochure.url, viewingProperty.projectName, index, brochure.title)}
//                               title="Download Brochure"
//                             >
//                               <Download />
//                             </IconButton>
//                           </ListItemSecondaryAction>
//                         </ListItem>
//                       ))}
//                     </List>
//                   </Box>
//                 )}

//                 {viewingProperty?.creatives && viewingProperty.creatives.length > 0 && (
//                   <Box mb={2}>
//                     <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
//                       <Typography variant="subtitle2">
//                         <Photo fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} />
//                         Creative Assets ({viewingProperty.creatives.length})
//                       </Typography>
//                       <Button
//                         size="small"
//                         variant="outlined"
//                         startIcon={<Download />}
//                         onClick={() => handleDownloadAllCreatives(viewingProperty)}
//                       >
//                         Download All
//                       </Button>
//                     </Box>
//                     <List dense>
//                       {viewingProperty.creatives.map((creative: any, index: number) => (
//                         <ListItem key={index} sx={{ pl: 0 }}>
//                           <ListItemText 
//                             primary={creative.title || `Creative ${index + 1}`}
//                             secondary={
//                               <Box>
//                                 <Typography variant="caption" display="block">
//                                   {creative.url.length > 50 ? `${creative.url.substring(0, 50)}...` : creative.url}
//                                 </Typography>
//                                 <Typography variant="caption" color="text.secondary">
//                                   Type: {creative.type}
//                                 </Typography>
//                               </Box>
//                             }
//                           />
//                           <ListItemSecondaryAction>
//                             <IconButton 
//                               size="small" 
//                               onClick={() => handleDownloadCreative(creative.url, viewingProperty.projectName, index, creative.title)}
//                               title="Download Creative"
//                             >
//                               <Download />
//                             </IconButton>
//                           </ListItemSecondaryAction>
//                         </ListItem>
//                       ))}
//                     </List>
//                   </Box>
//                 )}

//                 {/* Video Files Section */}
//                 {viewingProperty?.videoFiles && viewingProperty.videoFiles.length > 0 && (
//                   <Box mb={2}>
//                     <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
//                       <Typography variant="subtitle2">
//                         <VideoLibrary fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} />
//                         Uploaded Videos ({viewingProperty.videoFiles.length})
//                       </Typography>
//                       <Button
//                         size="small"
//                         variant="outlined"
//                         startIcon={<Download />}
//                         onClick={() => handleDownloadAllVideos(viewingProperty)}
//                       >
//                         Download All
//                       </Button>
//                     </Box>
//                     <List dense>
//                       {viewingProperty.videoFiles.map((video: any, index: number) => (
//                         <ListItem key={index} sx={{ pl: 0 }}>
//                           <ListItemText 
//                             primary={video.title || `Video ${index + 1}`}
//                             secondary={
//                               <Box>
//                                 <Typography variant="caption" display="block">
//                                   {video.url.length > 50 ? `${video.url.substring(0, 50)}...` : video.url}
//                                 </Typography>
//                                 <Typography variant="caption" color="text.secondary">
//                                   Type: {video.type}
//                                 </Typography>
//                               </Box>
//                             }
//                           />
//                           <ListItemSecondaryAction>
//                             <IconButton 
//                               size="small" 
//                               onClick={() => handleDownloadVideo(video.url, viewingProperty.projectName, index, video.title)}
//                               title="Download Video"
//                             >
//                               <Download />
//                             </IconButton>
//                           </ListItemSecondaryAction>
//                         </ListItem>
//                       ))}
//                     </List>
//                   </Box>
//                 )}

//                 {viewingProperty?.videoIds && viewingProperty.videoIds.length > 0 && (
//                   <Box>
//                     <Typography variant="subtitle2" gutterBottom>
//                       <VideoLibrary fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} />
//                       Video URLs ({viewingProperty.videoIds.length})
//                     </Typography>
//                     <List dense>
//                       {viewingProperty.videoIds.map((videoId: string, index: number) => (
//                         <ListItem key={index} sx={{ pl: 0 }}>
//                           <ListItemText 
//                             primary={`Video URL ${index + 1}`}
//                             secondary={
//                               <Box>
//                                 <Typography variant="caption" display="block">
//                                   {videoId.length > 50 ? `${videoId.substring(0, 50)}...` : videoId}
//                                 </Typography>
//                                 <Typography variant="caption" color="text.secondary">
//                                   Platform: {getVideoPlatform(videoId)}
//                                 </Typography>
//                               </Box>
//                             }
//                           />
//                           <ListItemSecondaryAction>
//                             <IconButton 
//                               size="small" 
//                               onClick={() => window.open(videoId.includes('http') ? videoId : `https://youtube.com/watch?v=${videoId}`, '_blank')}
//                               title="Open Video"
//                             >
//                               <VideoLibrary />
//                             </IconButton>
//                           </ListItemSecondaryAction>
//                         </ListItem>
//                       ))}
//                     </List>
//                   </Box>
//                 )}

//                 {(!viewingProperty?.brochureUrls?.length && !viewingProperty?.creatives?.length && !viewingProperty?.videoFiles?.length && !viewingProperty?.videoIds?.length) && (
//                   <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
//                     No media assets available
//                   </Typography>
//                 )}
//               </Paper>
//             </Grid>
            
//             {/* Image Gallery with Download Functionality */}
//             {viewingProperty?.images && viewingProperty.images.filter((img: any) => !img.isPrimary).length > 0 && (
//               <Grid size={{ xs: 12 }}>
//                 <Paper sx={{ p: 2 }}>
//                   <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//                     <Typography variant="h6">
//                       <Photo sx={{ mr: 1, verticalAlign: "middle" }} />
//                       Image Gallery ({viewingProperty.images.filter((img: any) => !img.isPrimary).length})
//                     </Typography>
//                     <Button
//                       variant="outlined"
//                       startIcon={<Download />}
//                       onClick={() => handleDownloadAllImages(viewingProperty)}
//                       size="small"
//                     >
//                       Download All Images
//                     </Button>
//                   </Box>
//                   <Grid container spacing={1}>
//                     {viewingProperty.images.filter((img: any) => !img.isPrimary).map((image: any, index: number) => (
//                       <Grid size={{ xs: 6, md: 3 }} key={index}>
//                         <Box position="relative" sx={{ borderRadius: '10px', overflow: 'hidden' }}>
//                           <img
//                             src={image.url}
//                             alt={image.title || `Gallery Image ${index + 1}`}
//                             style={{
//                               width: '100%',
//                               height: '120px',
//                               objectFit: 'cover',
//                               cursor: 'pointer'
//                             }}
//                             onError={(e) => {
//                               (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x120?text=Image';
//                             }}
//                           />
//                           {/* Download button overlay */}
//                           <Box
//                             position="absolute"
//                             top={4}
//                             right={4}
//                             sx={{
//                               opacity: 0,
//                               transition: 'opacity 0.2s',
//                               '&:hover': { opacity: 1 },
//                               '.MuiGrid-root:hover &': { opacity: 1 }
//                             }}
//                           >
//                             <IconButton
//                               size="small"
//                               onClick={() => handleDownloadImage(image.url, viewingProperty.projectName, index, image.title)}
//                               sx={{
//                                 backgroundColor: 'rgba(0,0,0,0.7)',
//                                 color: 'white',
//                                 '&:hover': {
//                                   backgroundColor: 'rgba(0,0,0,0.9)',
//                                 }
//                               }}
//                               title="Download Image"
//                             >
//                               <Download fontSize="small" />
//                             </IconButton>
//                           </Box>
//                         </Box>
//                         {image.title && (
//                           <Typography variant="caption" display="block" mt={0.5}>
//                             {image.title}
//                           </Typography>
//                         )}
//                       </Grid>
//                     ))}
//                   </Grid>
//                 </Paper>
//               </Grid>
//             )}
//           </Grid>
//         </DialogContent>
        
//         <DialogActions>
//           <Button onClick={() => {
//             handleCloseViewDialog();
//             handleOpenDialog(viewingProperty);
//           }} startIcon={<Edit />}>
//             Edit Property
//           </Button>
//           <Button onClick={handleCloseViewDialog}>Close</Button>
//         </DialogActions>
//       </Dialog>

//       {/* Add/Edit Dialog */}
//       <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth scroll="paper">
//         <DialogTitle sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', color: '#1976d2' }}>
//           <Typography variant="h5" fontWeight={600}>
//             {editingProperty ? "Edit Property" : "Add New Property"}
//           </Typography>
//         </DialogTitle>
//         <DialogContent sx={{ p: 3 }}>
//           <Grid container spacing={3}>
//             {/* Basic Information */}
//             <Grid size={{ xs: 12 }}>
//               <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
//                 Basic Information
//               </Typography>
//             </Grid>
            
//             {/* Project Name */}
//             <Grid size={{ xs: 12, md: 6 }}>
//               <TextField
//                 fullWidth
//                 label="Project Name"
//                 value={formData.projectName}
//                 onChange={handleInputChange("projectName")}
//                 required
//                 sx={{ mb: 2 }}
//               />
//             </Grid>
            
//             {/* Builder Name */}
//             <Grid size={{ xs: 12, md: 6 }}>
//               <TextField
//                 fullWidth
//                 label="Builder Name"
//                 value={formData.builderName}
//                 onChange={handleInputChange("builderName")}
//                 required
//                 sx={{ mb: 2 }}
//               />
//             </Grid>
            
//             {/* Status - Multi Select */}
//             <Grid size={{ xs: 12, md: 6 }}>
//               <FormControl fullWidth sx={{ mb: 2 }}>
//                 <InputLabel>Status</InputLabel>
//                 <Select
//                   multiple
//                   value={formData.status || []}
//                   onChange={(e) => {
//                     const selectedStatus = e.target.value;
//                     setFormData((prev) => ({
//                       ...prev,
//                       status: typeof selectedStatus === "string"
//                         ? selectedStatus.split(",")
//                         : selectedStatus,
//                     }));
//                   }}
//                   input={<OutlinedInput label="Status" />}
//                   renderValue={(selected) => (
//                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                       {(selected as string[]).map((value) => (
//                         <Chip key={value} label={value} size="small" />
//                       ))}
//                     </Box>
//                   )}
//                 >
//                   <MenuItem value="Ready to Move">Ready to Move</MenuItem>
//                   <MenuItem value="Under Construction">Under Construction</MenuItem>
//                   <MenuItem value="New Launch">New Launch</MenuItem>
//                   <MenuItem value="Pre Launch">Pre Launch</MenuItem>
//                   <MenuItem value="Sold Out">Sold Out</MenuItem>
//                   <MenuItem value="Coming Soon">Coming Soon</MenuItem>
//                 </Select>
//               </FormControl>
//             </Grid>
            
//             {/* Price */}
//             <Grid size={{ xs: 12, md: 6 }}>
//               <TextField
//                 fullWidth
//                 label="Price"
//                 value={formData.price}
//                 onChange={handleInputChange("price")}
//                 required
//                 sx={{ mb: 2 }}
//               />
//             </Grid>

//             {/* Project Highlights */}
//             <Grid size={{ xs: 12 }}>
//               <FormControl fullWidth sx={{ mb: 2 }}>
//                 <InputLabel>Project Highlights</InputLabel>
//                 <Select
//                   multiple
//                   value={formData.projectHighlights || []}
//                   onChange={(e) => {
//                     const selectedProjectHighlights = e.target.value;
//                     setFormData((prev) => ({
//                       ...prev,
//                       projectHighlights: typeof selectedProjectHighlights === "string"
//                         ? selectedProjectHighlights.split(",")
//                         : selectedProjectHighlights,
//                     }));
//                   }}
//                   input={<OutlinedInput label="ProjectHighlights" />}
//                   renderValue={(selected) => (
//                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                       {(selected as string[]).map((value) => (
//                         <Chip key={value} label={value} size="small" />
//                       ))}
//                     </Box>
//                   )}
//                 >
//                   <MenuItem value="Gated Community">Gated Community</MenuItem>
//                   <MenuItem value="Eco-Friendly">Eco-Friendly</MenuItem>
//                   <MenuItem value="Luxury Living">Luxury Living</MenuItem>
//                   <MenuItem value="Affordable Housing">Affordable Housing</MenuItem>
//                   <MenuItem value="Smart Home Features">Smart Home Features</MenuItem>
//                   <MenuItem value="Waterfront Property">Waterfront Property</MenuItem>
//                   <MenuItem value="High-Rise Building">High-Rise Building</MenuItem>
//                   <MenuItem value="Low-Rise Building">Low-Rise Building</MenuItem>
//                   <MenuItem value="Vastu Compliant">Vastu Compliant</MenuItem>
//                 </Select>
//               </FormControl>
//             </Grid>
            
//             {/* Description */}
//             <Grid size={{ xs: 12}}>
//               <TextField
//                 fullWidth
//                 label="Description"
//                 value={formData.description}
//                 onChange={handleInputChange("description")}
//                 multiline
//                 rows={3}
//                 required
//                 sx={{ mb: 2 }}
//               />
//             </Grid>

//             {/* Location Section */}
//             <Grid size={{ xs: 12 }}>
//               <Typography variant="h6" gutterBottom sx={{ mb: 2 , fontWeight: 600 }}>
//                 Location
//               </Typography>
//             </Grid>
            
//             {/* Location */}
//             <Grid size={{ xs: 12, md: 6 }}>
//               <TextField
//                 fullWidth
//                 label="Location"
//                 value={formData.location}
//                 onChange={handleInputChange("location")}
//                 required
//                 sx={{ mb: 2 }}
//               />
//             </Grid>
            
//             {/* Nearby Places */}
//             <Grid size={{ xs: 12, md: 6 }}>
//               <FormControl fullWidth sx={{ mb: 2 }}>
//                 <InputLabel>Nearby Places</InputLabel>
//                 <Select
//                   multiple
//                   value={formData.nearby || []}
//                   onChange={(e) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       nearby: typeof e.target.value === "string"
//                         ? e.target.value.split(",")
//                         : e.target.value,
//                     }))
//                   }
//                   input={<OutlinedInput label="Nearby Places" />}
//                   renderValue={(selected) => (
//                     <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
//                       {selected.map((value) => (
//                         <Chip key={value} label={value} size="small" />
//                       ))}
//                     </div>
//                   )}
//                 >
//                   <MenuItem value="School">School</MenuItem>
//                   <MenuItem value="Hospital">Hospital</MenuItem>
//                   <MenuItem value="Mall">Mall</MenuItem>
//                   <MenuItem value="Park">Park</MenuItem>
//                   <MenuItem value="Metro Station">Metro Station</MenuItem>
//                   <MenuItem value="Bus Stop">Bus Stop</MenuItem>
//                   <MenuItem value="Airport">Airport</MenuItem>
//                 </Select>
//               </FormControl>
//             </Grid>
            
//             {/* Map Coordinates */}
//             <Grid size={{ xs: 12, md: 6 }}>
//               <TextField
//                 fullWidth
//                 label="Latitude"
//                 type="number"
//                 value={formData.mapLocation.lat}
//                 onChange={handleMapLocationChange('lat')}
//                 inputProps={{ step: "any" }}
//                 sx={{ mb: 2 }}
//               />
//             </Grid>
//             <Grid size={{ xs: 12, md: 6 }}>
//               <TextField
//                 fullWidth
//                 label="Longitude"
//                 type="number"
//                 value={formData.mapLocation.lng}
//                 onChange={handleMapLocationChange('lng')}
//                 inputProps={{ step: "any" }}
//                 sx={{ mb: 2 }}
//               />
//             </Grid>

//             {/* Features & Amenities */}
//             <Grid size={{ xs: 12 }}>
//               <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
//                 Features & Amenities
//               </Typography>
//             </Grid>
            
//             {/* Features */}
//             <Grid size={{ xs: 12, md: 6 }}>
//               <FormControl fullWidth sx={{ mb: 2 }}>
//                 <InputLabel>Features</InputLabel>
//                 <Select
//                   multiple
//                   value={formData.features || []}
//                   onChange={(e) => {
//                     const selectedFeatures = e.target.value;
//                     setFormData((prev) => ({
//                       ...prev,
//                       features: typeof selectedFeatures === "string"
//                         ? selectedFeatures.split(",")
//                         : selectedFeatures,
//                     }));
//                   }}
//                   input={<OutlinedInput label="Features" />}
//                   renderValue={(selected) => (
//                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                       {(selected as string[]).map((value) => (
//                         <Chip key={value} label={value} size="small" />
//                       ))}
//                     </Box>
//                   )}
//                 >
//                   <MenuItem value="Swimming Pool">Swimming Pool</MenuItem>
//                   <MenuItem value="Gym">Gym</MenuItem>
//                   <MenuItem value="Clubhouse">Clubhouse</MenuItem>
//                   <MenuItem value="Children's Play Area">Children's Play Area</MenuItem>
//                   <MenuItem value="24/7 Security">24/7 Security</MenuItem>
//                   <MenuItem value="Power Backup">Power Backup</MenuItem>
//                   <MenuItem value="Landscaped Gardens">Landscaped Gardens</MenuItem>
//                   <MenuItem value="Jogging Track">Jogging Track</MenuItem>
//                   <MenuItem value="Sports Facilities">Sports Facilities</MenuItem>
//                   <MenuItem value="Parking">Parking</MenuItem>
//                 </Select>
//               </FormControl>
//             </Grid>

//             {/* Amenities */}
//             <Grid size={{ xs: 12, md: 6 }}>
//               <FormControl fullWidth sx={{ mb: 2 }}>
//                 <InputLabel>Amenities</InputLabel>
//                 <Select
//                   multiple
//                   value={formData.amenities || []}
//                   onChange={(e) => {
//                     const selectedAmenities = e.target.value;
//                     setFormData((prev) => ({
//                       ...prev,
//                       amenities: typeof selectedAmenities === "string"
//                         ? selectedAmenities.split(",")
//                         : selectedAmenities,
//                     }));
//                   }}
//                   input={<OutlinedInput label="Amenities" />}
//                   renderValue={(selected) => (
//                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                       {(selected as string[]).map((value) => (
//                         <Chip key={value} label={value} size="small" />
//                       ))}
//                     </Box>
//                   )}
//                 >
//                   <MenuItem value="Wi-Fi Connectivity">Wi-Fi Connectivity</MenuItem>
//                   <MenuItem value="Cafeteria">Cafeteria</MenuItem>
//                   <MenuItem value="Community Hall">Community Hall</MenuItem>
//                   <MenuItem value="Yoga/Meditation Area">Yoga/Meditation Area</MenuItem>
//                   <MenuItem value="Convenience Store">Convenience Store</MenuItem>
//                   <MenuItem value="ATM">ATM</MenuItem>
//                   <MenuItem value="Salon/Spa">Salon/Spa</MenuItem>
//                   <MenuItem value="Pet Area">Pet Area</MenuItem>
//                   <MenuItem value="Garbage Disposal">Garbage Disposal</MenuItem>
//                   <MenuItem value="Water Supply">Water Supply</MenuItem>
//                 </Select>
//               </FormControl>
//             </Grid>

//             {/* File Uploads Section */}
//             <Grid size={{ xs: 12 }}>
//               <Typography variant="h6" gutterBottom sx={{ mb: 2 , fontWeight: 600 }}>
//                 File Uploads
//               </Typography>
//             </Grid>

//             {/* Images Section */}
//             <Grid size={{ xs: 12, md: 4}}>
//               {/* File Upload for Images */}
//               <FileUploadSection
//                 title="Upload Property Images"
//                 accept="image/*"
//                 onFileUpload={handleImageUpload}
//                 uploading={uploading && uploadingType === 'image'}
//                 description="JPEG, PNG, GIF, WebP (Max 5MB)"
//               />

//               {/* Images List */}
//               {formData.images.length > 0 && (
//                 <Paper sx={{ p: 2, backgroundColor: '#fafafa' }}>
//                   <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
//                     Uploaded Images ({formData.images.length})
//                   </Typography>
//                   <List dense>
//                     {formData.images.map((image, index) => (
//                       <ListItem 
//                         key={index} 
//                         divider
//                         sx={{ 
//                           backgroundColor: 'white',
//                           mb: 1,
//                           borderRadius: 1,
//                           border: '1px solid #e0e0e0'
//                         }}
//                       >
//                         <Box sx={{ mr: 2, flexShrink: 0 }}>
//                           <img
//                             src={image.url}
//                             alt={image.title}
//                             style={{
//                               width: '60px',
//                               height: '60px',
//                               objectFit: 'cover',
//                               borderRadius: '4px'
//                             }}
//                             onError={(e) => {
//                               (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60x60?text=Image';
//                             }}
//                           />
//                         </Box>
//                         <ListItemSecondaryAction>
//                           {!image.isPrimary && (
//                             <Button
//                               size="small"
//                               onClick={() => setPrimaryImage(index)}
//                               sx={{ mr: 1 }}
//                             >
//                               Set Primary
//                             </Button>
//                           )}
//                           <IconButton 
//                             edge="end" 
//                             onClick={() => removeImage(index)}
//                             size="small"
//                             color="error"
//                           >
//                             <Delete />
//                           </IconButton>
//                         </ListItemSecondaryAction>
//                       </ListItem>
//                     ))}
//                   </List>
//                 </Paper>
//               )}
//             </Grid>

//             {/* Brochure URLs Section */}
//             <Grid size={{ xs: 12, md: 4}}>
//               {/* File Upload for Brochures */}
//               <FileUploadSection
//                 title="Upload Brochures"
//                 accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//                 onFileUpload={handleBrochureUpload}
//                 uploading={uploading && uploadingType === 'brochure'}
//                 description="PDF, Word Documents (Max 10MB)"
//               />
              
//               {/* Brochures List */}
//               {formData.brochureUrls.length > 0 && (
//                 <Paper sx={{ p: 2, backgroundColor: '#fafafa' }}>
//                   <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
//                     Brochures ({formData.brochureUrls.length})
//                   </Typography>
//                   <List dense>
//                     {formData.brochureUrls.map((brochure, index) => (
//                       <ListItem 
//                         key={index} 
//                         divider
//                         sx={{ 
//                           backgroundColor: 'white',
//                           mb: 1,
//                           borderRadius: 1,
//                           border: '1px solid #e0e0e0'
//                         }}
//                       >
//                         <Description sx={{ mr: 2, color: 'primary.main' }} />
//                         <ListItemSecondaryAction>
//                           <IconButton 
//                             edge="end" 
//                             onClick={() => removeBrochureUrl(index)} 
//                             size="small"
//                             color="error"
//                           >
//                             <Delete />
//                           </IconButton>
//                         </ListItemSecondaryAction>
//                       </ListItem>
//                     ))}
//                   </List>
//                 </Paper>
//               )}
//             </Grid>

//             {/* Creatives Section */}
//             <Grid size={{ xs: 12, md: 4}}>
//               {/* File Upload for Creatives */}
//               <FileUploadSection
//                 title="Upload Creative Assets"
//                 accept="image/*,.pdf,.doc,.docx"
//                 onFileUpload={handleCreativeUpload}
//                 uploading={uploading && uploadingType === 'creative'}
//                 description="Images, PDF Documents (Max 10MB)"
//               />
              
//               {/* Creatives List */}
//               {formData.creatives.length > 0 && (
//                 <Paper sx={{ p: 2, backgroundColor: '#fafafa' }}>
//                   <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
//                     Creative Assets ({formData.creatives.length})
//                   </Typography>
//                   <List dense>
//                     {formData.creatives.map((creative, index) => (
//                       <ListItem 
//                         key={index} 
//                         divider
//                         sx={{ 
//                           backgroundColor: 'white',
//                           mb: 1,
//                           borderRadius: 1,
//                           border: '1px solid #e0e0e0'
//                         }}
//                       >
//                         <Box sx={{ mr: 2, flexShrink: 0 }}>
//                           {creative.type === 'Image' ? (
//                             <img
//                               src={creative.url}
//                               alt={creative.title}
//                               style={{
//                                 width: '40px',
//                                 height: '40px',
//                                 objectFit: 'cover',
//                                 borderRadius: '4px'
//                               }}
//                               onError={(e) => {
//                                 (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40?text=Creative';
//                               }}
//                             />
//                           ) : (
//                             <Description sx={{ fontSize: 40, color: 'primary.main' }} />
//                           )}
//                         </Box>
//                         <ListItemSecondaryAction>
//                           <IconButton 
//                             edge="end" 
//                             onClick={() => removeCreative(index)} 
//                             size="small"
//                             color="error"
//                           >
//                             <Delete />
//                           </IconButton>
//                         </ListItemSecondaryAction>
//                       </ListItem>
//                     ))}
//                   </List>
//                 </Paper>
//               )}
//             </Grid>

//             {/* Video Files Upload */}
//             <Grid size={{ xs: 12 }}>
//               {/* File Upload for Videos */}
//               <FileUploadSection
//                 title="Upload Video Files"
//                 accept="video/*,.mp4,.mov,.avi,.mkv"
//                 onFileUpload={handleVideoUpload}
//                 uploading={uploading && uploadingType === 'video'}
//                 description="MP4, MOV, AVI, MKV (Max 50MB)"
//               />
              
//               {/* Videos List */}
//               {formData.videoFiles.length > 0 && (
//                 <Paper sx={{ p: 2, backgroundColor: '#fafafa' }}>
//                   <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
//                     Uploaded Videos ({formData.videoFiles.length})
//                   </Typography>
//                   <List dense>
//                     {formData.videoFiles.map((video, index) => (
//                       <ListItem 
//                         key={index} 
//                         divider
//                         sx={{ 
//                           backgroundColor: 'white',
//                           mb: 1,
//                           borderRadius: 1,
//                           border: '1px solid #e0e0e0'
//                         }}
//                       >
//                         <VideoLibrary sx={{ mr: 2, color: 'primary.main' }} />
//                         <ListItemText
//                           primary={video.title}
//                           secondary={
//                             <Box>
//                               <Typography variant="caption" display="block" sx={{ wordBreak: 'break-all' }}>
//                                 {video.url.length > 50 ? `${video.url.substring(0, 50)}...` : video.url}
//                               </Typography>
//                               <Typography variant="caption" color="text.secondary">
//                                 Type: {video.type}
//                               </Typography>
//                             </Box>
//                           }
//                         />
//                         <ListItemSecondaryAction>
//                           <IconButton 
//                             edge="end" 
//                             onClick={() => removeVideoFile(index)} 
//                             size="small"
//                             color="error"
//                           >
//                             <Delete />
//                           </IconButton>
//                         </ListItemSecondaryAction>
//                       </ListItem>
//                     ))}
//                   </List>
//                 </Paper>
//               )}
//             </Grid>

//             {/* Video URLs Section */}
//             <Grid size={{ xs: 12 }}>
//               <Box display="flex" alignItems="center" gap={1} mb={2}>
//                 <TextField
//                   fullWidth
//                   placeholder="YouTube Video ID, URL"
//                   value={newVideoId}
//                   onChange={(e) => setNewVideoId(e.target.value)}
//                   onKeyPress={(e) => e.key === "Enter" && handleAddVideoId()}
//                 />
//                 <Button 
//                   onClick={handleAddVideoId} 
//                   variant="outlined"
//                   disabled={!newVideoId.trim()}
//                 >
//                   Add URL
//                 </Button>
//               </Box>
//               {formData.videoIds.length > 0 && (
//                 <Paper sx={{ p: 2, backgroundColor: '#fafafa' }}>
//                   <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
//                     Video URLs ({formData.videoIds.length})
//                   </Typography>
//                   <List dense>
//                     {formData.videoIds.map((videoId, index) => (
//                       <ListItem 
//                         key={index}
//                         sx={{ 
//                           backgroundColor: 'white',
//                           mb: 1,
//                           borderRadius: 1,
//                           border: '1px solid #e0e0e0'
//                         }}
//                       >
//                         <VideoLibrary sx={{ mr: 2, color: 'primary.main' }} />
//                         <ListItemText 
//                           primary={`Video URL ${index + 1}`}
//                           secondary={
//                             <Box>
//                               <Typography variant="caption" display="block" sx={{ wordBreak: 'break-all' }}>
//                                 {videoId.length > 50 ? `${videoId.substring(0, 50)}...` : videoId}
//                               </Typography>
//                               <Typography variant="caption" color="text.secondary">
//                                 Platform: {getVideoPlatform(videoId)}
//                               </Typography>
//                             </Box>
//                           }
//                         />
//                         <ListItemSecondaryAction>
//                           <IconButton 
//                             edge="end" 
//                             onClick={() => removeVideoId(index)}
//                             size="small"
//                             color="error"
//                           >
//                             <Remove />
//                           </IconButton>
//                         </ListItemSecondaryAction>
//                       </ListItem>
//                     ))}
//                   </List>
//                 </Paper>
//               )}
//             </Grid>
//           </Grid>
//         </DialogContent>
        
//         <DialogActions sx={{ p: 3, backgroundColor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
//           <Button 
//             onClick={handleCloseDialog} 
//             sx={{ 
//               borderRadius: '8px',
//               px: 3,
//               color: '#666',
//               borderColor: '#666'
//             }}
//           >
//             Cancel
//           </Button>
//           <Button 
//             onClick={handleSubmit} 
//             variant="contained"
//             sx={{ 
//               borderRadius: '8px',
//               px: 3,
//               backgroundColor: '#1976d2',
//               "&:hover": {
//                 backgroundColor: '#115293',
//               },
//             }}
//           >
//             {editingProperty ? "Update Property" : "Create Property"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Snackbar for notifications */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
//       >
//         <Alert 
//           severity={snackbar.severity as any}
//           sx={{ borderRadius: '8px' }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// }

// ================ Validation Functions ==================
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  MenuItem,
  OutlinedInput,
  FormControl,
  InputLabel,
  Select,
  Collapse,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  LocationOn,
  Photo,
  VideoLibrary,
  Description,
  Download,
  ArrowBack,
  ArrowForward,
  Search,
  Remove,
  CloudUpload,
  FilterList,
  ExpandMore,
  ExpandLess,
  Clear,
} from "@mui/icons-material";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Leaflet imports for map
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import your services
import { propertyService, type Property } from '@/services/propertyService';

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// File upload service using Base64 (no API needed)
const uploadService = {
  uploadFile: async (file: File): Promise<{ success: boolean; data?: { url: string; fileName: string }; message?: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        resolve({
          success: true,
          data: {
            url: base64,
            fileName: file.name
          }
        });
      };
      
      reader.onerror = () => {
        resolve({
          success: false,
          message: 'Failed to read file'
        });
      };
      
      reader.readAsDataURL(file);
    });
  },
};

// Map Component
const PropertyMap = ({ lat, lng, projectName }: { lat: number; lng: number; projectName: string }) => {
  if (!lat || !lng) {
    return (
      <Box sx={{ 
        height: '250px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '15px'
      }}>
        <Typography variant="body2" color="text.secondary">
          Location not available
        </Typography>
      </Box>
    );
  }

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      style={{ height: '250px', width: '100%', borderRadius: '15px' }}
      scrollWheelZoom={false}
      className="property-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]}>
        <Popup>
          <strong>{projectName}</strong>
          <br />
          Latitude: {lat.toFixed(6)}
          <br />
          Longitude: {lng.toFixed(6)}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

// Image Carousel Component
const ImageCarousel = ({ images, projectName }: { images: any[], projectName: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <Box sx={{ 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '15px'
      }}>
        <Typography variant="body1" color="text.secondary">
          No images available
        </Typography>
      </Box>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Main Image Display */}
      <Box sx={{ 
        height: '400px', 
        position: 'relative',
        borderRadius: '15px',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5'
      }}>
        <img
          src={images[currentIndex]?.url}
          alt={images[currentIndex]?.title || `${projectName} Image ${currentIndex + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Property+Image';
          }}
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <IconButton
              onClick={prevImage}
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.7)',
                }
              }}
            >
              <ArrowBack />
            </IconButton>
            <IconButton
              onClick={nextImage}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.7)',
                }
              }}
            >
              <ArrowForward />
            </IconButton>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <Box sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem'
          }}>
            {currentIndex + 1} / {images.length}
          </Box>
        )}
      </Box>
    </Box>
  );
};

// File Upload Component
const FileUploadSection = ({ 
  title, 
  accept, 
  onFileUpload, 
  uploading,
  description 
}: { 
  title: string;
  accept: string;
  onFileUpload: (file: File) => void;
  uploading: boolean;
  description: string;
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    onFileUpload(files[0]);
    event.target.value = ''; // Reset input
  };

  return (
    <Box sx={{ mb: 2, p: 2, border: '1px dashed #e0e0e0', borderRadius: '8px', backgroundColor: '#fafafa' }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: '#1976d2' }}>
        {title}
      </Typography>
      <Box display="flex" alignItems="center" gap={1}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUpload />}
          disabled={uploading}
          sx={{
            width: '150px',
            borderRadius: '8px',
            textTransform: 'none',
            borderColor: '#1976d2',
            color: '#1976d2',
            '&:hover': {
              borderColor: '#115293',
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
            }
          }}
        >
          Choose File
          <input
            type="file"
            hidden
            accept={accept}
            onChange={handleFileChange}
          />
        </Button>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
        {uploading && (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={16} />
            <Typography variant="caption">Uploading...</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Filter types
interface FilterState {
  status: string[];
  features: string[];
  amenities: string[];
  priceRange: {
    min: string;
    max: string;
  };
  builderName: string;
  location: string;
}

// Validation types
interface ValidationErrors {
  projectName?: string;
  builderName?: string;
  description?: string;
  location?: string;
  price?: string;
  status?: string;
  mapLocation?: string;
  features?: string;
  amenities?: string;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms debounce delay
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: "", 
    severity: "success" as "success" | "error" 
  });
  
  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    features: [],
    amenities: [],
    priceRange: {
      min: "",
      max: "",
    },
    builderName: "",
    location: "",
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadingType, setUploadingType] = useState<'image' | 'brochure' | 'creative' | 'video' | null>(null);
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Updated form data structure with videoFiles
  const [formData, setFormData] = useState({
    projectName: "",
    builderName: "",
    description: "",
    location: "",
    price: "",
    status: [] as string[],
    features: [] as string[],
    amenities: [] as string[],
    nearby: [] as string[],
    projectHighlights: [] as string[],
    mapLocation: { lat: 0, lng: 0 },
    images: [] as { url: string; title?: string; description?: string; isPrimary?: boolean }[],
    brochureUrls: [] as { title: string; url: string; type: string }[],
    creatives: [] as { title: string; url: string; type: string }[],
    videoIds: [] as string[],
    videoFiles: [] as { title: string; url: string; type: string }[] // New field for uploaded videos
  });
  
  // Updated form input states
  const [newFeature, setNewFeature] = useState("");
  const [newAmenity, setNewAmenity] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newNearby, setNewNearby] = useState("");
  const [newProjectHighlight, setNewProjectHighlight] = useState("");
  const [newVideoId, setNewVideoId] = useState("");

  // Filter options
  const statusOptions = [
    "Ready to Move",
    "Under Construction",
    "New Launch",
    "Pre Launch",
    "Sold Out",
    "Coming Soon"
  ];

  const featureOptions = [
    "Swimming Pool",
    "Gym",
    "Clubhouse",
    "Children's Play Area",
    "24/7 Security",
    "Power Backup",
    "Landscaped Gardens",
    "Jogging Track",
    "Sports Facilities",
    "Parking"
  ];

  const amenityOptions = [
    "Wi-Fi Connectivity",
    "Cafeteria",
    "Community Hall",
    "Yoga/Meditation Area",
    "Convenience Store",
    "ATM",
    "Salon/Spa",
    "Pet Area",
    "Garbage Disposal",
    "Water Supply"
  ];

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.features.length > 0) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.priceRange.min || filters.priceRange.max) count++;
    if (filters.builderName) count++;
    if (filters.location) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  // Load properties on component mount
  useEffect(() => {
    loadProperties();
  }, []);

  // Apply filters when debounced search term or filters change
  useEffect(() => {
    applyFilters();
  }, [debouncedSearchTerm, properties, filters]);

  // Check form validity whenever formData changes
  useEffect(() => {
    const checkFormValidity = () => {
      const valid = (
        formData.projectName?.trim().length >= 2 &&
        formData.projectName?.trim().length <= 200 &&
        formData.builderName?.trim().length >= 2 &&
        formData.builderName?.trim().length <= 100 &&
        formData.description?.trim().length >= 10 &&
        formData.description?.trim().length <= 2000 &&
        formData.location?.trim().length > 0 &&
        formData.price?.trim().length > 0 && // Only check if price is not empty, no format validation
        formData.status.length > 0 &&
        (!formData.mapLocation.lat || 
         !formData.mapLocation.lng || 
         (formData.mapLocation.lat >= -90 && 
          formData.mapLocation.lat <= 90 && 
          formData.mapLocation.lng >= -180 && 
          formData.mapLocation.lng <= 180))
      );
      setIsFormValid(valid);
    };

    checkFormValidity();
  }, [formData]);

  const loadProperties = async (search = "") => {
    try {
      setLoading(true);
      const response = await propertyService.getAllProperties(search);
      if (response.success) {
        setProperties(response.data);
      } else {
        throw new Error(response.message || "Failed to load properties");
      }
    } catch (error: any) {
      console.error('Error loading properties:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || "Failed to load properties", 
        severity: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...properties];

    // Search filter - uses debounced search term
    if (debouncedSearchTerm) {
      filtered = filtered.filter(property =>
        property.projectName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        property.builderName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        property.location?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        property.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        property.features?.some(feature => 
          feature.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        ) ||
        property.amenities?.some(amenity => 
          amenity.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(property =>
        property.status?.some(status => filters.status.includes(status))
      );
    }

    // Features filter
    if (filters.features.length > 0) {
      filtered = filtered.filter(property =>
        filters.features.every(filterFeature =>
          property.features?.includes(filterFeature)
        )
      );
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(property =>
        filters.amenities.every(filterAmenity =>
          property.amenities?.includes(filterAmenity)
        )
      );
    }

    // Price range filter
    if (filters.priceRange.min || filters.priceRange.max) {
      filtered = filtered.filter(property => {
        const price = parseFloat(property.price?.replace(/[^\d.]/g, '') || '0');
        const minPrice = parseFloat(filters.priceRange.min) || 0;
        const maxPrice = parseFloat(filters.priceRange.max) || Infinity;
        return price >= minPrice && price <= maxPrice;
      });
    }

    // Builder name filter
    if (filters.builderName) {
      filtered = filtered.filter(property =>
        property.builderName?.toLowerCase().includes(filters.builderName.toLowerCase())
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(property =>
        property.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredProperties(filtered);
  };

  // Filter handlers
  const handleFilterChange = (filterType: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handlePriceRangeChange = (field: 'min' | 'max') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [field]: e.target.value
      }
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      status: [],
      features: [],
      amenities: [],
      priceRange: {
        min: "",
        max: "",
      },
      builderName: "",
      location: "",
    });
    setSearchTerm("");
  };

  const removeFilter = (filterType: keyof FilterState, value?: string) => {
    if (value) {
      // Remove specific value from array filter
      setFilters(prev => ({
        ...prev,
        [filterType]: (prev[filterType] as string[]).filter(item => item !== value)
      }));
    } else {
      // Clear entire filter
      setFilters(prev => ({
        ...prev,
        [filterType]: Array.isArray(prev[filterType]) ? [] : ""
      }));
    }
  };

  // Search handler with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // The actual search will be triggered automatically by the debouncedSearchTerm effect
  };

  const handleSearch = () => {
    // Manual search trigger - uses current searchTerm immediately
    applyFilters();
  };

  // File upload handlers
  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setUploadingType('image');

    try {
      // Validate file type
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        setSnackbar({ open: true, message: 'Please select a valid image file (JPEG, PNG, GIF, WebP)', severity: 'error' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({ open: true, message: 'Image size should be less than 5MB', severity: 'error' });
        return;
      }

      const uploadResponse = await uploadService.uploadFile(file);
      
      if (uploadResponse.success && uploadResponse.data) {
        // Add uploaded image to form data
        const uploadedImage = {
          url: uploadResponse.data.url,
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          description: "",
          isPrimary: formData.images.length === 0 // Set as primary if first image
        };

        setFormData(prev => ({
          ...prev,
          images: [...prev.images, uploadedImage]
        }));

        setSnackbar({ open: true, message: 'Image uploaded successfully', severity: 'success' });
      } else {
        throw new Error(uploadResponse.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Image upload error:', error);
      setSnackbar({ open: true, message: error.message || 'Failed to upload image', severity: 'error' });
    } finally {
      setUploading(false);
      setUploadingType(null);
    }
  };

  const handleBrochureUpload = async (file: File) => {
    setUploading(true);
    setUploadingType('brochure');

    try {
      // Validate file type
      const validDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validDocTypes.includes(file.type)) {
        setSnackbar({ open: true, message: 'Please select a PDF or Word document', severity: 'error' });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setSnackbar({ open: true, message: 'File size should be less than 10MB', severity: 'error' });
        return;
      }

      const uploadResponse = await uploadService.uploadFile(file);
      
      if (uploadResponse.success && uploadResponse.data) {
        // Add uploaded brochure to form data
        const uploadedBrochure = {
          title: file.name.replace(/\.[^/.]+$/, ""),
          url: uploadResponse.data.url,
          type: "PDF Document"
        };

        setFormData(prev => ({
          ...prev,
          brochureUrls: [...prev.brochureUrls, uploadedBrochure]
        }));

        setSnackbar({ open: true, message: 'Brochure uploaded successfully', severity: 'success' });
      } else {
        throw new Error(uploadResponse.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Brochure upload error:', error);
      setSnackbar({ open: true, message: error.message || 'Failed to upload brochure', severity: 'error' });
    } finally {
      setUploading(false);
      setUploadingType(null);
    }
  };

  const handleCreativeUpload = async (file: File) => {
    setUploading(true);
    setUploadingType('creative');

    try {
      // Validate file type
      const validCreativeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf'];
      if (!validCreativeTypes.includes(file.type)) {
        setSnackbar({ open: true, message: 'Please select a valid image or PDF file', severity: 'error' });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setSnackbar({ open: true, message: 'File size should be less than 10MB', severity: 'error' });
        return;
      }

      const uploadResponse = await uploadService.uploadFile(file);
      
      if (uploadResponse.success && uploadResponse.data) {
        // Add uploaded creative to form data
        const uploadedCreative = {
          title: file.name.replace(/\.[^/.]+$/, ""),
          url: uploadResponse.data.url,
          type: file.type.includes('image') ? 'Image' : 'PDF Document'
        };

        setFormData(prev => ({
          ...prev,
          creatives: [...prev.creatives, uploadedCreative]
        }));

        setSnackbar({ open: true, message: 'Creative asset uploaded successfully', severity: 'success' });
      } else {
        throw new Error(uploadResponse.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Creative upload error:', error);
      setSnackbar({ open: true, message: error.message || 'Failed to upload creative asset', severity: 'error' });
    } finally {
      setUploading(false);
      setUploadingType(null);
    }
  };

  // New video upload handler
  const handleVideoUpload = async (file: File) => {
    setUploading(true);
    setUploadingType('video');

    try {
      // Validate file type
      const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/quicktime'];
      if (!validVideoTypes.includes(file.type)) {
        setSnackbar({ open: true, message: 'Please select a valid video file (MP4, MOV, AVI, MKV)', severity: 'error' });
        return;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setSnackbar({ open: true, message: 'Video size should be less than 50MB', severity: 'error' });
        return;
      }

      const uploadResponse = await uploadService.uploadFile(file);
      
      if (uploadResponse.success && uploadResponse.data) {
        // Add uploaded video to form data
        const uploadedVideo = {
          title: file.name.replace(/\.[^/.]+$/, ""),
          url: uploadResponse.data.url,
          type: "Video File"
        };

        setFormData(prev => ({
          ...prev,
          videoFiles: [...prev.videoFiles, uploadedVideo]
        }));

        setSnackbar({ open: true, message: 'Video uploaded successfully', severity: 'success' });
      } else {
        throw new Error(uploadResponse.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Video upload error:', error);
      setSnackbar({ open: true, message: error.message || 'Failed to upload video', severity: 'error' });
    } finally {
      setUploading(false);
      setUploadingType(null);
    }
  };

  // Validation function
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Required field validations
    if (!formData.projectName?.trim()) {
      errors.projectName = "Project name is required";
    } else if (formData.projectName.trim().length < 2) {
      errors.projectName = "Project name must be at least 2 characters";
    } else if (formData.projectName.trim().length > 200) {
      errors.projectName = "Project name cannot exceed 200 characters";
    }

    if (!formData.builderName?.trim()) {
      errors.builderName = "Builder name is required";
    } else if (formData.builderName.trim().length < 2) {
      errors.builderName = "Builder name must be at least 2 characters";
    } else if (formData.builderName.trim().length > 100) {
      errors.builderName = "Builder name cannot exceed 100 characters";
    }

    if (!formData.description?.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    } else if (formData.description.trim().length > 2000) {
      errors.description = "Description cannot exceed 2000 characters";
    }

    if (!formData.location?.trim()) {
      errors.location = "Location is required";
    }

    if (!formData.price?.trim()) {
      errors.price = "Price is required";
    }
    // REMOVED: Price format validation

    if (formData.status.length === 0) {
      errors.status = "At least one status is required";
    }

    // Map location validation (optional but if provided, both should be valid)
    if ((formData.mapLocation.lat && !formData.mapLocation.lng) || 
        (!formData.mapLocation.lat && formData.mapLocation.lng)) {
      errors.mapLocation = "Both latitude and longitude are required for map location";
    }

    if (formData.mapLocation.lat && formData.mapLocation.lng) {
      if (formData.mapLocation.lat < -90 || formData.mapLocation.lat > 90) {
        errors.mapLocation = "Latitude must be between -90 and 90";
      }
      if (formData.mapLocation.lng < -180 || formData.mapLocation.lng > 180) {
        errors.mapLocation = "Longitude must be between -180 and 180";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Input change handler with validation clearing
  const handleInputChangeWithValidation = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Function to get validation messages for tooltip
  const getValidationMessages = (): string[] => {
    const messages: string[] = [];
    
    if (!formData.projectName?.trim() || formData.projectName.trim().length < 2) {
      messages.push("• Project name (min 2 characters)");
    }
    
    if (!formData.builderName?.trim() || formData.builderName.trim().length < 2) {
      messages.push("• Builder name (min 2 characters)");
    }
    
    if (!formData.description?.trim() || formData.description.trim().length < 10) {
      messages.push("• Description (min 10 characters)");
    }
    
    if (!formData.location?.trim()) {
      messages.push("• Location");
    }
    
    if (!formData.price?.trim()) {
      messages.push("• Price");
    }
    // REMOVED: Price format validation message
    
    if (formData.status.length === 0) {
      messages.push("• At least one status");
    }
    
    return messages;
  };

  const handleOpenDialog = (property: Property | null = null) => {
    if (property) {
      setEditingProperty(property);
      setFormData({
        projectName: property.projectName || "",
        builderName: property.builderName || "",
        description: property.description || "",
        location: property.location || "",
        price: property.price || "",
        status: property.status || [],
        features: property.features || [],
        amenities: property.amenities || [],
        nearby: property.nearby || [],
        projectHighlights: property.projectHighlights || [],
        mapLocation: property.mapLocation || { lat: 0, lng: 0 },
        images: property.images || [],
        brochureUrls: property.brochureUrls || [],
        creatives: property.creatives || [],
        videoIds: property.videoIds || [],
        videoFiles: property.videoFiles || [] // Initialize videoFiles
      });
    } else {
      setEditingProperty(null);
      setFormData({
        projectName: "",
        builderName: "",
        description: "",
        location: "",
        price: "",
        status: [],
        features: [],
        amenities: [],
        nearby: [],
        projectHighlights: [],
        mapLocation: { lat: 0, lng: 0 },
        images: [],
        brochureUrls: [],
        creatives: [],
        videoIds: [],
        videoFiles: [] // Initialize videoFiles
      });
    }
    // Clear validation errors when opening dialog
    setValidationErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProperty(null);
    // Reset form input states
    setNewFeature("");
    setNewAmenity("");
    setNewStatus("");
    setNewNearby("");
    setNewProjectHighlight("");
    setNewVideoId("");
    // Clear validation errors
    setValidationErrors({});
    setIsFormValid(false);
  };

  const handleViewProperty = (property: Property) => {
    setViewingProperty(property);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewingProperty(null);
  };

  // Download handlers
  const handleDownloadBrochure = (url: string, propertyName: string, index: number, title?: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      const fileName = title 
        ? `${propertyName.replace(/\s+/g, '_')}_${title.replace(/[^a-z0-9]/gi, '_')}.pdf`
        : `${propertyName.replace(/\s+/g, '_')}_Brochure_${index + 1}.pdf`;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSnackbar({ open: true, message: "Brochure download started", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "Download failed", severity: "error" });
    }
  };

  const handleDownloadCreative = (url: string, propertyName: string, index: number, title?: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      const extension = url.split('.').pop() || 'jpg';
      const fileName = title 
        ? `${propertyName.replace(/\s+/g, '_')}_${title.replace(/[^a-z0-9]/gi, '_')}.${extension}`
        : `${propertyName.replace(/\s+/g, '_')}_Creative_${index + 1}.${extension}`;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSnackbar({ open: true, message: "Creative asset download started", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "Download failed", severity: "error" });
    }
  };

  const handleDownloadImage = (url: string, propertyName: string, index: number, title?: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      const extension = url.split('.').pop() || 'jpg';
      const fileName = title 
        ? `${propertyName.replace(/\s+/g, '_')}_${title.replace(/[^a-z0-9]/gi, '_')}.${extension}`
        : `${propertyName.replace(/\s+/g, '_')}_Image_${index + 1}.${extension}`;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSnackbar({ open: true, message: "Image download started", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "Download failed", severity: "error" });
    }
  };

  // New video download handler
  const handleDownloadVideo = (url: string, propertyName: string, index: number, title?: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      const extension = url.split('.').pop() || 'mp4';
      const fileName = title 
        ? `${propertyName.replace(/\s+/g, '_')}_${title.replace(/[^a-z0-9]/gi, '_')}.${extension}`
        : `${propertyName.replace(/\s+/g, '_')}_Video_${index + 1}.${extension}`;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSnackbar({ open: true, message: "Video download started", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "Download failed", severity: "error" });
    }
  };

  const handleDownloadAllBrochures = (property: Property) => {
    if (property.brochureUrls && property.brochureUrls.length > 0) {
      property.brochureUrls.forEach((brochure: any, index: number) => {
        setTimeout(() => handleDownloadBrochure(brochure.url, property.projectName, index, brochure.title), index * 500);
      });
      setSnackbar({ open: true, message: `Downloading ${property.brochureUrls.length} brochures`, severity: "success" });
    }
  };

  const handleDownloadAllCreatives = (property: Property) => {
    if (property.creatives && property.creatives.length > 0) {
      property.creatives.forEach((creative: any, index: number) => {
        setTimeout(() => handleDownloadCreative(creative.url, property.projectName, index, creative.title), index * 500);
      });
      setSnackbar({ open: true, message: `Downloading ${property.creatives.length} creative assets`, severity: "success" });
    }
  };

  const handleDownloadAllImages = (property: Property) => {
    if (property.images && property.images.length > 0) {
      property.images.forEach((image: any, index: number) => {
        setTimeout(() => handleDownloadImage(image.url, property.projectName, index, image.title), index * 500);
      });
      setSnackbar({ open: true, message: `Downloading ${property.images.length} images`, severity: "success" });
    }
  };

  // New function to download all videos
  const handleDownloadAllVideos = (property: Property) => {
    if (property.videoFiles && property.videoFiles.length > 0) {
      property.videoFiles.forEach((video: any, index: number) => {
        setTimeout(() => handleDownloadVideo(video.url, property.projectName, index, video.title), index * 500);
      });
      setSnackbar({ open: true, message: `Downloading ${property.videoFiles.length} videos`, severity: "success" });
    }
  };

  // Form handlers
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleMapLocationChange = (field: 'lat' | 'lng') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData(prev => ({
      ...prev,
      mapLocation: { ...prev.mapLocation, [field]: value }
    }));
    // Clear map location error when user starts typing
    if (validationErrors.mapLocation) {
      setValidationErrors(prev => ({ ...prev, mapLocation: undefined }));
    }
  };

  // Array field handlers
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const setPrimaryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({ ...img, isPrimary: i === index }))
    }));
  };

  const removeBrochureUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      brochureUrls: prev.brochureUrls.filter((_, i) => i !== index)
    }));
  };

  const removeCreative = (index: number) => {
    setFormData(prev => ({
      ...prev,
      creatives: prev.creatives.filter((_, i) => i !== index)
    }));
  };

  // New function to remove video files
  const removeVideoFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videoFiles: prev.videoFiles.filter((_, i) => i !== index)
    }));
  };

  const handleAddVideoId = () => {
    if (newVideoId.trim()) {
      setFormData(prev => ({
        ...prev,
        videoIds: [...prev.videoIds, newVideoId.trim()]
      }));
      setNewVideoId("");
    }
  };

  const removeVideoId = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videoIds: prev.videoIds.filter((_, i) => i !== index)
    }));
  };

  // Helper function to detect video platform
  const getVideoPlatform = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'YouTube';
    } else if (url.includes('vimeo.com')) {
      return 'Vimeo';
    } else if (url.length === 11) { // YouTube video ID length
      return 'YouTube Video ID';
    } else {
      return 'Video URL';
    }
  };

  const handleSubmit = async () => {
    // Validate form before submission
    if (!validateForm()) {
      setSnackbar({ 
        open: true, 
        message: "Please fix the validation errors before submitting", 
        severity: "error" 
      });
      return;
    }

    try {
      if (editingProperty && editingProperty._id) {
        // Update existing property
        await propertyService.updateProperty(editingProperty._id, formData);
        setSnackbar({ open: true, message: "Property updated successfully", severity: "success" });
      } else {
        // Create new property
        await propertyService.createProperty(formData);
        setSnackbar({ open: true, message: "Property added successfully", severity: "success" });
      }
      handleCloseDialog();
      loadProperties(); // Reload the properties list
    } catch (error: any) {
      console.error('Error saving property:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || "Failed to save property", 
        severity: "error" 
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await propertyService.deleteProperty(id);
        setSnackbar({ open: true, message: "Property deleted successfully", severity: "success" });
        loadProperties(); // Reload the properties list
      } catch (error: any) {
        console.error('Error deleting property:', error);
        setSnackbar({ 
          open: true, 
          message: error.message || "Failed to delete property", 
          severity: "error" 
        });
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading properties...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          {/* Title */}
          <Grid  item xs={12} md="auto">
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ textAlign: { xs: "center", md: "left" }, mb: { xs: 2, md: 0 } }}
            >
              Properties
            </Typography>
          </Grid>

          {/* Search & Buttons */}
          <Grid
            item
            xs={12}
            md
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            gap={1}
            alignItems="center"
            justifyContent={{ xs: "center", md: "flex-end" }}
            sx={{ maxWidth: "100%" }}
          >
            {/* Search Field with Debouncing */}
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search properties by name, builder, location, features..."
              value={searchTerm}
              onChange={handleSearchChange} // Updated to use debounced handler
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              size="small"
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "25px",
                  backgroundColor: "white",
                },
              }}
            />

            <Grid item sx={{ width: { xs: '100%', sm: 'auto' }, display: 'flex', flexWrap: 'wrap', gap: 1,  justifyContent: { xs: 'center', md: 'flex-end' } }}>
              {/* Filter Toggle Button */}
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  borderRadius: "8px",
                  whiteSpace: "nowrap",
                  position: 'relative',
                }}
              >
                Filters
                {activeFiltersCount > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: '#1976d2',
                      color: 'white',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {activeFiltersCount}
                  </Box>
                )}
              </Button>

              {/* Add Property Button */}
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{
                  backgroundColor: "#1976d2",
                  borderRadius: "8px",
                  px: 3,
                  whiteSpace: "nowrap",
                  "&:hover": { backgroundColor: "#115293" },
                }}
              >
                Add Property
              </Button>
            </Grid>
          </Grid>
        </Grid>

        {/* Search Results Count */}
        {(searchTerm || activeFiltersCount > 0) && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, textAlign: { xs: "center", md: "left" } }}
          >
            Found {filteredProperties.length} property
            {filteredProperties.length !== 1 ? "ies" : ""} 
            {searchTerm && ` matching "${searchTerm}"`}
            {activeFiltersCount > 0 && ` with ${activeFiltersCount} filter${activeFiltersCount !== 1 ? 's' : ''} applied`}
          </Typography>
        )}

        {/* Active Filters Chips */}
        {(filters.status.length > 0 || filters.features.length > 0 || filters.amenities.length > 0 || 
          filters.priceRange.min || filters.priceRange.max || filters.builderName || filters.location) && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {filters.status.map((status, index) => (
              <Chip
                key={status}
                label={`Status: ${status}`}
                onDelete={() => removeFilter('status', status)}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
            {filters.features.map((feature, index) => (
              <Chip
                key={feature}
                label={`Feature: ${feature}`}
                onDelete={() => removeFilter('features', feature)}
                size="small"
                color="secondary"
                variant="outlined"
              />
            ))}
            {filters.amenities.map((amenity, index) => (
              <Chip
                key={amenity}
                label={`Amenity: ${amenity}`}
                onDelete={() => removeFilter('amenities', amenity)}
                size="small"
                color="success"
                variant="outlined"
              />
            ))}
            {(filters.priceRange.min || filters.priceRange.max) && (
              <Chip
                label={`Price: ${filters.priceRange.min || '0'} - ${filters.priceRange.max || '∞'}`}
                onDelete={() => removeFilter('priceRange')}
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
            {filters.builderName && (
              <Chip
                label={`Builder: ${filters.builderName}`}
                onDelete={() => removeFilter('builderName')}
                size="small"
                color="info"
                variant="outlined"
              />
            )}
            {filters.location && (
              <Chip
                label={`Location: ${filters.location}`}
                onDelete={() => removeFilter('location')}
                size="small"
                color="error"
                variant="outlined"
              />
            )}
          </Box>
        )}
      </Paper>

      {/* Filters Panel */}
      <Collapse in={showFilters}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: '15px', border: '1px solid #e0e0e0' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
              <FilterList sx={{ mr: 1 }} />
              Filter Properties
            </Typography>
            <Button
              startIcon={<Clear />}
              onClick={clearAllFilters}
              size="small"
              sx={{ borderRadius: '8px' }}
            >
              Clear All
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {/* Status Filter */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  multiple
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  input={<OutlinedInput label="Status" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Features Filter */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Features</InputLabel>
                <Select
                  multiple
                  value={filters.features}
                  onChange={(e) => handleFilterChange('features', e.target.value)}
                  input={<OutlinedInput label="Features" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {featureOptions.map((feature) => (
                    <MenuItem key={feature} value={feature}>
                      {feature}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Amenities Filter */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Amenities</InputLabel>
                <Select
                  multiple
                  value={filters.amenities}
                  onChange={(e) => handleFilterChange('amenities', e.target.value)}
                  input={<OutlinedInput label="Amenities" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {amenityOptions.map((amenity) => (
                    <MenuItem key={amenity} value={amenity}>
                      {amenity}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Price Range Filter */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  label="Min Price"
                  value={filters.priceRange.min}
                  onChange={handlePriceRangeChange('min')}
                  placeholder="0"
                />
                <TextField
                  fullWidth
                  label="Max Price"
                  value={filters.priceRange.max}
                  onChange={handlePriceRangeChange('max')}
                  placeholder="No limit"
                />
              </Box>
            </Grid>

            {/* Builder Name Filter */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Builder Name"
                value={filters.builderName}
                onChange={(e) => handleFilterChange('builderName', e.target.value)}
                placeholder="Search by builder..."
              />
            </Grid>

            {/* Location Filter */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="Search by location..."
              />
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {/* Properties Grid */}
      <Grid container spacing={3}>
        {filteredProperties.map((property) => {
          const primaryImage = property.images?.find(img => img.isPrimary) || property.images?.[0];
        
          return (
            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} key={property._id}>
              <Paper
                onClick={() => handleViewProperty(property)} 
                sx={{ 
                  p: 2, 
                  height: "15rem", 
                  transition: "transform 0.2s", 
                  "&:hover": { transform: "translateY(-4px)" },
                  backgroundImage: primaryImage ? `url(${primaryImage.url})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    borderRadius: 'inherit',
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between', 
                  cursor: 'pointer',
                  borderRadius: '15px'
                }}
              >
                {/* Icon buttons positioned at the end (top right) */}
                <Box display="flex" justifyContent="flex-end" alignItems="flex-start">
                  <Box>
                    <IconButton size="small" onClick={() => handleViewProperty(property)} sx={{ color: 'white' }} title="Preview Property">
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenDialog(property); }} sx={{ color: 'white' }} title="Edit Property">
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(property._id!); }} sx={{ color: 'white' }} title="Delete Property">
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>

                {/* Centered typography content */}
                <Box 
                  position="absolute" 
                  zIndex={1} 
                  sx={{ 
                    color: 'white',
                    textAlign: 'center', 
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    bottom: '10px', 
                    left: 0,
                    right: 0,
                    width: '100%'
                  }}
                >
                  <Typography variant="h6" fontWeight={600} sx={{ color: 'white' }}>
                    {property.projectName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }} gutterBottom>
                    by {property.builderName}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Show message when no results found */}
      {filteredProperties.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 2, borderRadius: '15px' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm || activeFiltersCount > 0 
              ? 'No properties found matching your search criteria.' 
              : 'No properties found.'}
          </Typography>
          {(searchTerm || activeFiltersCount > 0) && (
            <Button 
              variant="contained" 
              onClick={clearAllFilters}
              sx={{ mt: 2 }}
            >
              Clear Search & Filters
            </Button>
          )}
        </Paper>
      )}

      {/* View Property Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight={600}>
                {viewingProperty?.projectName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                by {viewingProperty?.builderName}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            {/* Primary Image */}
            <Grid  display={"flex"} flexWrap={'wrap'} gap={'1.5rem'} maxHeight={'100%'}>
              {/* image */}
              <Grid size={{ xs: 12, lg: 8 }}>
              {viewingProperty?.images && viewingProperty.images.length > 0 && (
                <Grid size={{ xs: 12, md: 12 }}>
                  <ImageCarousel 
                      images={viewingProperty.images} 
                      projectName={viewingProperty.projectName}
                    />
                </Grid>
              )}
              </Grid>
              {/* Basic Information */}
              <Grid size={{ xs: 12, lg: 4 }}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>Basic Information</Typography>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">{viewingProperty?.location}</Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={2}>
                    <CurrencyRupeeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" fontWeight={600}>{viewingProperty?.price}</Typography>
                  </Box>
                  
                  <Typography variant="body2" paragraph>
                    {viewingProperty?.description}
                  </Typography>
                  
                  {viewingProperty?.nearby && viewingProperty.nearby.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>Nearby Places</Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {viewingProperty.nearby.map((place: string, index: number) => (
                          <Chip key={index} label={place} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
            
            {/* Features & Amenities */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Features & Amenities</Typography>
                
                {viewingProperty?.features && viewingProperty.features.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>Features</Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                      {viewingProperty.features.map((feature: string, index: number) => (
                        <Chip key={index} label={feature} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {viewingProperty?.amenities && viewingProperty.amenities.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Amenities</Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {viewingProperty.amenities.map((amenity: string, index: number) => (
                        <Chip key={index} label={amenity} size="small" color="primary" />
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Status & Project Highlights */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Status & Project Highlights</Typography>
                
                {viewingProperty?.status && viewingProperty.status.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>Status</Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                      {viewingProperty.status.map((statusItem: string, index: number) => (
                        <Chip 
                          key={index}
                          label={statusItem} 
                          size="small" 
                          color={statusItem === "Ready to Move" ? "success" : "warning"}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {viewingProperty?.projectHighlights && viewingProperty.projectHighlights.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>Project Highlights</Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {viewingProperty.projectHighlights.map((highlight: string, index: number) => (
                        <Chip 
                          key={index}
                          label={highlight} 
                          size="small" 
                          variant="outlined"
                          color="secondary"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
            
            {/* Map Location */}
            {viewingProperty?.mapLocation && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Location</Typography>
                  <PropertyMap 
                    lat={viewingProperty.mapLocation.lat} 
                    lng={viewingProperty.mapLocation.lng}
                    projectName={viewingProperty.projectName}
                  />
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.secondary">
                      Latitude: {viewingProperty.mapLocation.lat}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Longitude: {viewingProperty.mapLocation.lng}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            )}

            {/* Enhanced Media Assets with Download */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Media Assets</Typography>
                
                {viewingProperty?.brochureUrls && viewingProperty.brochureUrls.length > 0 && (
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle2">
                        <Description fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} />
                        Brochures ({viewingProperty.brochureUrls.length})
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={() => handleDownloadAllBrochures(viewingProperty)}
                      >
                        Download All
                      </Button>
                    </Box>
                    <List dense>
                      {viewingProperty.brochureUrls.map((brochure: any, index: number) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <ListItemText 
                            primary={brochure.title || `Brochure ${index + 1}`}
                            secondary={
                              <Box>
                                <Typography variant="caption" display="block">
                                  {brochure.url.length > 50 ? `${brochure.url.substring(0, 50)}...` : brochure.url}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Type: {brochure.type}
                                </Typography>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDownloadBrochure(brochure.url, viewingProperty.projectName, index, brochure.title)}
                              title="Download Brochure"
                            >
                              <Download />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {viewingProperty?.creatives && viewingProperty.creatives.length > 0 && (
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle2">
                        <Photo fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} />
                        Creative Assets ({viewingProperty.creatives.length})
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={() => handleDownloadAllCreatives(viewingProperty)}
                      >
                        Download All
                      </Button>
                    </Box>
                    <List dense>
                      {viewingProperty.creatives.map((creative: any, index: number) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <ListItemText 
                            primary={creative.title || `Creative ${index + 1}`}
                            secondary={
                              <Box>
                                <Typography variant="caption" display="block">
                                  {creative.url.length > 50 ? `${creative.url.substring(0, 50)}...` : creative.url}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Type: {creative.type}
                                </Typography>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDownloadCreative(creative.url, viewingProperty.projectName, index, creative.title)}
                              title="Download Creative"
                            >
                              <Download />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Video Files Section */}
                {viewingProperty?.videoFiles && viewingProperty.videoFiles.length > 0 && (
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle2">
                        <VideoLibrary fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} />
                        Uploaded Videos ({viewingProperty.videoFiles.length})
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={() => handleDownloadAllVideos(viewingProperty)}
                      >
                        Download All
                      </Button>
                    </Box>
                    <List dense>
                      {viewingProperty.videoFiles.map((video: any, index: number) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <ListItemText 
                            primary={video.title || `Video ${index + 1}`}
                            secondary={
                              <Box>
                                <Typography variant="caption" display="block">
                                  {video.url.length > 50 ? `${video.url.substring(0, 50)}...` : video.url}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Type: {video.type}
                                </Typography>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDownloadVideo(video.url, viewingProperty.projectName, index, video.title)}
                              title="Download Video"
                            >
                              <Download />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {viewingProperty?.videoIds && viewingProperty.videoIds.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      <VideoLibrary fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} />
                      Video URLs ({viewingProperty.videoIds.length})
                    </Typography>
                    <List dense>
                      {viewingProperty.videoIds.map((videoId: string, index: number) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <ListItemText 
                            primary={`Video URL ${index + 1}`}
                            secondary={
                              <Box>
                                <Typography variant="caption" display="block">
                                  {videoId.length > 50 ? `${videoId.substring(0, 50)}...` : videoId}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Platform: {getVideoPlatform(videoId)}
                                </Typography>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              size="small" 
                              onClick={() => window.open(videoId.includes('http') ? videoId : `https://youtube.com/watch?v=${videoId}`, '_blank')}
                              title="Open Video"
                            >
                              <VideoLibrary />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {(!viewingProperty?.brochureUrls?.length && !viewingProperty?.creatives?.length && !viewingProperty?.videoFiles?.length && !viewingProperty?.videoIds?.length) && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No media assets available
                  </Typography>
                )}
              </Paper>
            </Grid>
            
            {/* Image Gallery with Download Functionality */}
            {viewingProperty?.images && viewingProperty.images.filter((img: any) => !img.isPrimary).length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      <Photo sx={{ mr: 1, verticalAlign: "middle" }} />
                      Image Gallery ({viewingProperty.images.filter((img: any) => !img.isPrimary).length})
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={() => handleDownloadAllImages(viewingProperty)}
                      size="small"
                    >
                      Download All Images
                    </Button>
                  </Box>
                  <Grid container spacing={1}>
                    {viewingProperty.images.filter((img: any) => !img.isPrimary).map((image: any, index: number) => (
                      <Grid size={{ xs: 6, md: 3 }} key={index}>
                        <Box position="relative" sx={{ borderRadius: '10px', overflow: 'hidden' }}>
                          <img
                            src={image.url}
                            alt={image.title || `Gallery Image ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '120px',
                              objectFit: 'cover',
                              cursor: 'pointer'
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x120?text=Image';
                            }}
                          />
                          {/* Download button overlay */}
                          <Box
                            position="absolute"
                            top={4}
                            right={4}
                            sx={{
                              opacity: 0,
                              transition: 'opacity 0.2s',
                              '&:hover': { opacity: 1 },
                              '.MuiGrid-root:hover &': { opacity: 1 }
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadImage(image.url, viewingProperty.projectName, index, image.title)}
                              sx={{
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'rgba(0,0,0,0.9)',
                                }
                              }}
                              title="Download Image"
                            >
                              <Download fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        {image.title && (
                          <Typography variant="caption" display="block" mt={0.5}>
                            {image.title}
                          </Typography>
                        )}
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => {
            handleCloseViewDialog();
            handleOpenDialog(viewingProperty);
          }} startIcon={<Edit />}>
            Edit Property
          </Button>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Dialog with Validation */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', color: '#1976d2' }}>
          <Typography variant="h5" fontWeight={600}>
            {editingProperty ? "Edit Property" : "Add New Property"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                Basic Information <Typography component="span" color="error">*</Typography>
              </Typography>
            </Grid>
            
            {/* Project Name */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Project Name"
                value={formData.projectName}
                onChange={handleInputChangeWithValidation("projectName")}
                required
                error={!!validationErrors.projectName}
                helperText={validationErrors.projectName || "Enter the project name (2-200 characters)"}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            {/* Builder Name */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Builder Name"
                value={formData.builderName}
                onChange={handleInputChangeWithValidation("builderName")}
                required
                error={!!validationErrors.builderName}
                helperText={validationErrors.builderName || "Enter the builder name (2-100 characters)"}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            {/* Status - Multi Select */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth sx={{ mb: 2 }} error={!!validationErrors.status}>
                <InputLabel>Status *</InputLabel>
                <Select
                  multiple
                  value={formData.status || []}
                  onChange={(e) => {
                    const selectedStatus = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      status: typeof selectedStatus === "string"
                        ? selectedStatus.split(",")
                        : selectedStatus,
                    }));
                    // Clear status error when user selects something
                    if (validationErrors.status) {
                      setValidationErrors(prev => ({ ...prev, status: undefined }));
                    }
                  }}
                  input={<OutlinedInput label="Status *" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="Ready to Move">Ready to Move</MenuItem>
                  <MenuItem value="Under Construction">Under Construction</MenuItem>
                  <MenuItem value="New Launch">New Launch</MenuItem>
                  <MenuItem value="Pre Launch">Pre Launch</MenuItem>
                  <MenuItem value="Sold Out">Sold Out</MenuItem>
                  <MenuItem value="Coming Soon">Coming Soon</MenuItem>
                </Select>
                {validationErrors.status && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {validationErrors.status}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            {/* Price */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Price"
                value={formData.price}
                onChange={handleInputChangeWithValidation("price")}
                required
                error={!!validationErrors.price}
                helperText={validationErrors.price || "Enter the property price"}
                sx={{ mb: 2 }}
              />
            </Grid>

            {/* Project Highlights */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Project Highlights</InputLabel>
                <Select
                  multiple
                  value={formData.projectHighlights || []}
                  onChange={(e) => {
                    const selectedProjectHighlights = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      projectHighlights: typeof selectedProjectHighlights === "string"
                        ? selectedProjectHighlights.split(",")
                        : selectedProjectHighlights,
                    }));
                  }}
                  input={<OutlinedInput label="ProjectHighlights" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="Gated Community">Gated Community</MenuItem>
                  <MenuItem value="Eco-Friendly">Eco-Friendly</MenuItem>
                  <MenuItem value="Luxury Living">Luxury Living</MenuItem>
                  <MenuItem value="Affordable Housing">Affordable Housing</MenuItem>
                  <MenuItem value="Smart Home Features">Smart Home Features</MenuItem>
                  <MenuItem value="Waterfront Property">Waterfront Property</MenuItem>
                  <MenuItem value="High-Rise Building">High-Rise Building</MenuItem>
                  <MenuItem value="Low-Rise Building">Low-Rise Building</MenuItem>
                  <MenuItem value="Vastu Compliant">Vastu Compliant</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Description */}
            <Grid size={{ xs: 12}}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleInputChangeWithValidation("description")}
                multiline
                rows={3}
                required
                error={!!validationErrors.description}
                helperText={validationErrors.description || "Enter project description (10-2000 characters)"}
                inputProps={{ maxLength: 2000 }}
                sx={{ mb: 2 }}
              />
            </Grid>

            {/* Location Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 , fontWeight: 600 }}>
                Location <Typography component="span" color="error">*</Typography>
              </Typography>
            </Grid>
            
            {/* Location */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={handleInputChangeWithValidation("location")}
                required
                error={!!validationErrors.location}
                helperText={validationErrors.location || "Enter the project location"}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            {/* Nearby Places */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Nearby Places</InputLabel>
                <Select
                  multiple
                  value={formData.nearby || []}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      nearby: typeof e.target.value === "string"
                        ? e.target.value.split(",")
                        : e.target.value,
                    }))
                  }
                  input={<OutlinedInput label="Nearby Places" />}
                  renderValue={(selected) => (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </div>
                  )}
                >
                  <MenuItem value="School">School</MenuItem>
                  <MenuItem value="Hospital">Hospital</MenuItem>
                  <MenuItem value="Mall">Mall</MenuItem>
                  <MenuItem value="Park">Park</MenuItem>
                  <MenuItem value="Metro Station">Metro Station</MenuItem>
                  <MenuItem value="Bus Stop">Bus Stop</MenuItem>
                  <MenuItem value="Airport">Airport</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Map Coordinates */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                value={formData.mapLocation.lat}
                onChange={handleMapLocationChange('lat')}
                inputProps={{ 
                  step: "any",
                  min: -90,
                  max: 90
                }}
                error={!!validationErrors.mapLocation}
                helperText={validationErrors.mapLocation || "Enter latitude (-90 to 90)"}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                value={formData.mapLocation.lng}
                onChange={handleMapLocationChange('lng')}
                inputProps={{ 
                  step: "any",
                  min: -180,
                  max: 180
                }}
                error={!!validationErrors.mapLocation}
                helperText="Enter longitude (-180 to 180)"
                sx={{ mb: 2 }}
              />
            </Grid>

            {/* Features & Amenities */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                Features & Amenities
              </Typography>
            </Grid>
            
            {/* Features */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Features</InputLabel>
                <Select
                  multiple
                  value={formData.features || []}
                  onChange={(e) => {
                    const selectedFeatures = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      features: typeof selectedFeatures === "string"
                        ? selectedFeatures.split(",")
                        : selectedFeatures,
                    }));
                  }}
                  input={<OutlinedInput label="Features" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="Swimming Pool">Swimming Pool</MenuItem>
                  <MenuItem value="Gym">Gym</MenuItem>
                  <MenuItem value="Clubhouse">Clubhouse</MenuItem>
                  <MenuItem value="Children's Play Area">Children's Play Area</MenuItem>
                  <MenuItem value="24/7 Security">24/7 Security</MenuItem>
                  <MenuItem value="Power Backup">Power Backup</MenuItem>
                  <MenuItem value="Landscaped Gardens">Landscaped Gardens</MenuItem>
                  <MenuItem value="Jogging Track">Jogging Track</MenuItem>
                  <MenuItem value="Sports Facilities">Sports Facilities</MenuItem>
                  <MenuItem value="Parking">Parking</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Amenities */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Amenities</InputLabel>
                <Select
                  multiple
                  value={formData.amenities || []}
                  onChange={(e) => {
                    const selectedAmenities = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      amenities: typeof selectedAmenities === "string"
                        ? selectedAmenities.split(",")
                        : selectedAmenities,
                    }));
                  }}
                  input={<OutlinedInput label="Amenities" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="Wi-Fi Connectivity">Wi-Fi Connectivity</MenuItem>
                  <MenuItem value="Cafeteria">Cafeteria</MenuItem>
                  <MenuItem value="Community Hall">Community Hall</MenuItem>
                  <MenuItem value="Yoga/Meditation Area">Yoga/Meditation Area</MenuItem>
                  <MenuItem value="Convenience Store">Convenience Store</MenuItem>
                  <MenuItem value="ATM">ATM</MenuItem>
                  <MenuItem value="Salon/Spa">Salon/Spa</MenuItem>
                  <MenuItem value="Pet Area">Pet Area</MenuItem>
                  <MenuItem value="Garbage Disposal">Garbage Disposal</MenuItem>
                  <MenuItem value="Water Supply">Water Supply</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* File Uploads Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 , fontWeight: 600 }}>
                File Uploads
              </Typography>
            </Grid>

            {/* Images Section */}
            <Grid size={{ xs: 12, md: 4}}>
              {/* File Upload for Images */}
              <FileUploadSection
                title="Upload Property Images"
                accept="image/*"
                onFileUpload={handleImageUpload}
                uploading={uploading && uploadingType === 'image'}
                description="JPEG, PNG, GIF, WebP (Max 5MB)"
              />

              {/* Images List */}
              {formData.images.length > 0 && (
                <Paper sx={{ p: 2, backgroundColor: '#fafafa' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Uploaded Images ({formData.images.length})
                  </Typography>
                  <List dense>
                    {formData.images.map((image, index) => (
                      <ListItem 
                        key={index} 
                        divider
                        sx={{ 
                          backgroundColor: 'white',
                          mb: 1,
                          borderRadius: 1,
                          border: '1px solid #e0e0e0'
                        }}
                      >
                        <Box sx={{ mr: 2, flexShrink: 0 }}>
                          <img
                            src={image.url}
                            alt={image.title}
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60x60?text=Image';
                            }}
                          />
                        </Box>
                        <ListItemSecondaryAction>
                          {!image.isPrimary && (
                            <Button
                              size="small"
                              onClick={() => setPrimaryImage(index)}
                              sx={{ mr: 1 }}
                            >
                              Set Primary
                            </Button>
                          )}
                          <IconButton 
                            edge="end" 
                            onClick={() => removeImage(index)}
                            size="small"
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Grid>

            {/* Brochure URLs Section */}
            <Grid size={{ xs: 12, md: 4}}>
              {/* File Upload for Brochures */}
              <FileUploadSection
                title="Upload Brochures"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onFileUpload={handleBrochureUpload}
                uploading={uploading && uploadingType === 'brochure'}
                description="PDF, Word Documents (Max 10MB)"
              />
              
              {/* Brochures List */}
              {formData.brochureUrls.length > 0 && (
                <Paper sx={{ p: 2, backgroundColor: '#fafafa' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Brochures ({formData.brochureUrls.length})
                  </Typography>
                  <List dense>
                    {formData.brochureUrls.map((brochure, index) => (
                      <ListItem 
                        key={index} 
                        divider
                        sx={{ 
                          backgroundColor: 'white',
                          mb: 1,
                          borderRadius: 1,
                          border: '1px solid #e0e0e0'
                        }}
                      >
                        <Description sx={{ mr: 2, color: 'primary.main' }} />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            onClick={() => removeBrochureUrl(index)} 
                            size="small"
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Grid>

            {/* Creatives Section */}
            <Grid size={{ xs: 12, md: 4}}>
              {/* File Upload for Creatives */}
              <FileUploadSection
                title="Upload Creative Assets"
                accept="image/*,.pdf,.doc,.docx"
                onFileUpload={handleCreativeUpload}
                uploading={uploading && uploadingType === 'creative'}
                description="Images, PDF Documents (Max 10MB)"
              />
              
              {/* Creatives List */}
              {formData.creatives.length > 0 && (
                <Paper sx={{ p: 2, backgroundColor: '#fafafa' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Creative Assets ({formData.creatives.length})
                  </Typography>
                  <List dense>
                    {formData.creatives.map((creative, index) => (
                      <ListItem 
                        key={index} 
                        divider
                        sx={{ 
                          backgroundColor: 'white',
                          mb: 1,
                          borderRadius: 1,
                          border: '1px solid #e0e0e0'
                        }}
                      >
                        <Box sx={{ mr: 2, flexShrink: 0 }}>
                          {creative.type === 'Image' ? (
                            <img
                              src={creative.url}
                              alt={creative.title}
                              style={{
                                width: '40px',
                                height: '40px',
                                objectFit: 'cover',
                                borderRadius: '4px'
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40?text=Creative';
                              }}
                            />
                          ) : (
                            <Description sx={{ fontSize: 40, color: 'primary.main' }} />
                          )}
                        </Box>
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            onClick={() => removeCreative(index)} 
                            size="small"
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Grid>

            {/* Video Files Upload */}
            <Grid size={{ xs: 12 }}>
              {/* File Upload for Videos */}
              <FileUploadSection
                title="Upload Video Files"
                accept="video/*,.mp4,.mov,.avi,.mkv"
                onFileUpload={handleVideoUpload}
                uploading={uploading && uploadingType === 'video'}
                description="MP4, MOV, AVI, MKV (Max 50MB)"
              />
              
              {/* Videos List */}
              {formData.videoFiles.length > 0 && (
                <Paper sx={{ p: 2, backgroundColor: '#fafafa' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Uploaded Videos ({formData.videoFiles.length})
                  </Typography>
                  <List dense>
                    {formData.videoFiles.map((video, index) => (
                      <ListItem 
                        key={index} 
                        divider
                        sx={{ 
                          backgroundColor: 'white',
                          mb: 1,
                          borderRadius: 1,
                          border: '1px solid #e0e0e0'
                        }}
                      >
                        <VideoLibrary sx={{ mr: 2, color: 'primary.main' }} />
                        <ListItemText
                          primary={video.title}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block" sx={{ wordBreak: 'break-all' }}>
                                {video.url.length > 50 ? `${video.url.substring(0, 50)}...` : video.url}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Type: {video.type}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            onClick={() => removeVideoFile(index)} 
                            size="small"
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Grid>

            {/* Video URLs Section */}
            <Grid size={{ xs: 12 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <TextField
                  fullWidth
                  placeholder="YouTube Video ID, URL"
                  value={newVideoId}
                  onChange={(e) => setNewVideoId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddVideoId()}
                />
                <Button 
                  onClick={handleAddVideoId} 
                  variant="outlined"
                  disabled={!newVideoId.trim()}
                >
                  Add URL
                </Button>
              </Box>
              {formData.videoIds.length > 0 && (
                <Paper sx={{ p: 2, backgroundColor: '#fafafa' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Video URLs ({formData.videoIds.length})
                  </Typography>
                  <List dense>
                    {formData.videoIds.map((videoId, index) => (
                      <ListItem 
                        key={index}
                        sx={{ 
                          backgroundColor: 'white',
                          mb: 1,
                          borderRadius: 1,
                          border: '1px solid #e0e0e0'
                        }}
                      >
                        <VideoLibrary sx={{ mr: 2, color: 'primary.main' }} />
                        <ListItemText 
                          primary={`Video URL ${index + 1}`}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block" sx={{ wordBreak: 'break-all' }}>
                                {videoId.length > 50 ? `${videoId.substring(0, 50)}...` : videoId}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Platform: {getVideoPlatform(videoId)}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            onClick={() => removeVideoId(index)}
                            size="small"
                            color="error"
                          >
                            <Remove />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, backgroundColor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
          <Button 
            onClick={handleCloseDialog} 
            sx={{ 
              borderRadius: '8px',
              px: 3,
              color: '#666',
              borderColor: '#666'
            }}
          >
            Cancel
          </Button>
          
          <Tooltip 
            title={
              !isFormValid ? (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Please fill all required fields:
                  </Typography>
                  <Box sx={{ maxHeight: '120px', overflow: 'auto' }}>
                    {getValidationMessages().map((msg, index) => (
                      <Typography key={index} variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                        {msg}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              ) : (
                "All required fields are filled. You can now create the property."
              )
            }
            arrow
            placement="top"
          >
            <span>
              <Button 
                onClick={handleSubmit} 
                variant="contained"
                disabled={!isFormValid}
                sx={{ 
                  borderRadius: '8px',
                  px: 3,
                  backgroundColor: isFormValid ? '#1976d2' : '#e0e0e0',
                  color: isFormValid ? 'white' : '#9e9e9e',
                  "&:hover": isFormValid ? {
                    backgroundColor: '#115293',
                  } : {
                    backgroundColor: '#e0e0e0',
                  },
                  "&.Mui-disabled": {
                    backgroundColor: '#f5f5f5',
                    color: '#bdbdbd',
                    border: '1px solid #e0e0e0'
                  }
                }}
              >
                {editingProperty ? "Update Property" : "Create Property"}
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          severity={snackbar.severity as any}
          sx={{ borderRadius: '8px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
