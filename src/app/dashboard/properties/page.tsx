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
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Divider,
//   List,
//   ListItem,
//   ListItemText,
//   ListItemSecondaryAction
// } from "@mui/material";
// import { Add, Edit, Delete, LocationOn, Remove, Photo, VideoLibrary, Description, Visibility, Download, GetApp,  ArrowBack, ArrowForward, Search } from "@mui/icons-material";
// import { flex } from "@mui/system";
// import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

// // Leaflet imports for map
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';

// // Fix for default markers in react-leaflet
// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

// // Map Component
// const PropertyMap = ({ lat, lng, projectName }: { lat: number; lng: number; projectName: string }) => {
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

// // Mock data for demonstration
// const mockProperties = [
//   {
//     id: 1,
//     projectName: "Skyline Towers",
//     builderName: "Prestige Group",
//     location: "Bangalore",
//     price: "2.5 Cr",
//     status: ["Under Construction", "Pre-Launch"],
//     features: ["Swimming Pool", "Gym", "Park"],
//     amenities: ["Club House", "Children's Play Area", "Security"],
//     description: "Discover thoughtfully designed office spaces at prime locations, ideal for startups, SMEs, and established businesses. With flexible sizes, modern amenities, and strategic connectivity, our commercial offerings are crafted to elevate your professional presence and ensure long-term value.Smart investment. Seamless workspaces. Strong returns.",
//     nearby: ["IT Parks", "Shopping Malls", "Metro Station"],
//     projectHighlights: ["Prime Location", "Modern Design", "Eco-Friendly"],
//     mapLocation: { lat: 12.9716, lng: 77.5946 },
//     images: [
//       { url: "https://img.freepik.com/free-photo/construction-concept-with-engineering-tools_1150-17810.jpg?t=st=1758781159~exp=1758784759~hmac=e161c56d933cfef36c5d1736c8d3a0c4469ba804e61fde9115f5be3862409e97&w=2000", title: "Exterior View", description: "Main building exterior", isPrimary: true },
//       { url: "https://img.freepik.com/free-photo/image-engineering-objects-workplace-top-view-construction-concept-engineering-tools-vintage-tone-retro-filter-effect-soft-focus-selective-focus_1418-471.jpg?ga=GA1.1.474037937.1758048977&semt=ais_hybrid&w=740&q=80", title: "Garden View", description: "Beautiful landscaped gardens", isPrimary: false },
//       { url: "https://img.freepik.com/premium-photo/modern-apartment-building-exterior-with-balconies_1340-23956.jpg", title: "Building Front", description: "Modern architectural design", isPrimary: false },
//       { url: "https://img.freepik.com/free-photo/swimming-pool-hotel_1203-3268.jpg", title: "Swimming Pool", description: "Resort-style swimming pool", isPrimary: false }
//     ],
//     brochureUrls: ["https://yhataw.com/wp-content/uploads/2021/03/Pioneer-Araya-The-54-Brochure.pdf"],
//     creatives: ["https://img.freepik.com/premium-psd/house-3d-render-post_822760-185.jpg?w=2000"],
//     videoIds: ["https://www.youtube.com/watch?v=RDgYrQMhNKI"]
//   },
//   {
//     id: 2,
//     projectName: "Green Valley",
//     builderName: "DLF",
//     location: "Gurgaon",
//     price: "2.5 Cr",
//     status: ["Ready to Move", "Premium"],
//     features: ["Swimming Pool", "Gym", "Park", "Landscaped Gardens"],
//     amenities: ["Club House", "Children's Play Area", "Security", "Power Backup"],
//     description: "Discover thoughtfully designed office spaces at prime locations, ideal for startups, SMEs, and established businesses. With flexible sizes, modern amenities, and strategic connectivity, our commercial offerings are crafted to elevate your professional presence and ensure long-term value.Smart investment. Seamless workspaces. Strong returns.",
//     nearby: ["IT Parks", "Shopping Malls", "Schools"],
//     projectHighlights: ["Club House", "Children's Play Area", "Security"],
//     mapLocation: { lat: 12.9716, lng: 77.5946 },
//     images: [
//       { url: "https://img.freepik.com/free-photo/construction-concept-with-engineering-tools_1150-17810.jpg?t=st=1758781159~exp=1758784759~hmac=e161c56d933cfef36c5d1736c8d3a0c4469ba804e61fde9115f5be3862409e97&w=2000", title: "Exterior View", description: "Main building exterior", isPrimary: true },
//       { url: "https://img.freepik.com/free-photo/image-engineering-objects-workplace-top-view-construction-concept-engineering-tools-vintage-tone-retro-filter-effect-soft-focus-selective-focus_1418-471.jpg?ga=GA1.1.474037937.1758048977&semt=ais_hybrid&w=740&q=80", title: "Garden View", description: "Beautiful landscaped gardens", isPrimary: true }
//     ],
//     brochureUrls: ["https://yhataw.com/wp-content/uploads/2021/03/Pioneer-Araya-The-54-Brochure.pdf"],
//     creatives: ["https://img.freepik.com/premium-psd/house-3d-render-post_822760-185.jpg?w=2000"],
//     videoIds: ["https://www.youtube.com/watch?v=RDgYrQMhNKI"]
//   }
// ];

// export default function PropertiesPage() {
//   const [properties, setProperties] = useState(mockProperties);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredProperties, setFilteredProperties] = useState(mockProperties);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [openViewDialog, setOpenViewDialog] = useState(false);
//   const [editingProperty, setEditingProperty] = useState<any>(null);
//   const [viewingProperty, setViewingProperty] = useState<any>(null);
//   const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
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
//     brochureUrls: [] as string[],
//     creatives: [] as string[],
//     videoIds: [] as string[]
//   });
  
//   // Form input states
//   const [newFeature, setNewFeature] = useState("");
//   const [newAmenity, setNewAmenity] = useState("");
//   const [newStatus, setNewStatus] = useState("");
//   const [newNearby, setNewNearby] = useState("");
//   const [newProjectHighlight, setNewProjectHighlight] = useState("");
//   const [newImage, setNewImage] = useState({ url: "", title: "", description: "", isPrimary: false });
//   const [newBrochureUrl, setNewBrochureUrl] = useState("");
//   const [newCreative, setNewCreative] = useState("");
//   const [newVideoId, setNewVideoId] = useState("");

//   // Search functionality
//   const handleSearch = () => {
//     if (!searchTerm.trim()) {
//       setFilteredProperties(properties);
//       return;
//     }

//     const filtered = properties.filter(property =>
//       property.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       property.builderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       property.features.some(feature => 
//         feature.toLowerCase().includes(searchTerm.toLowerCase())
//       ) ||
//       property.amenities.some(amenity => 
//         amenity.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//     );

//     setFilteredProperties(filtered);
//   };

//   // Sync filtered properties when properties change
//   useEffect(() => {
//     setFilteredProperties(properties);
//   }, [properties]);

//   const handleOpenDialog = (property = null) => {
//     if (property) {
//       setEditingProperty(property);
//       setFormData(property);
//     } else {
//       setEditingProperty(null);
//       setFormData({
//         projectName: "",
//         builderName: "",
//         description: "",
//         location: "",
//         price: "",
//         status: [] as string[],
//         features: [] as string[],
//         amenities: [] as string[],
//         nearby: [] as string[],
//         projectHighlights: [] as string[],
//         mapLocation: { lat: 0, lng: 0 },
//         images: [] as { url: string; title?: string; description?: string; isPrimary?: boolean }[],
//         brochureUrls: [] as string[],
//         creatives: [] as string[],
//         videoIds: [] as string[]
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
//     setNewImage({ url: "", title: "", description: "", isPrimary: false });
//     setNewBrochureUrl("");
//     setNewCreative("");
//     setNewVideoId("");
//   };

//   const handleViewProperty = (property: any) => {
//     setViewingProperty(property);
//     setOpenViewDialog(true);
//   };

//   const handleCloseViewDialog = () => {
//     setOpenViewDialog(false);
//     setViewingProperty(null);
//   };

//   // Download handlers
//   const handleDownloadBrochure = (url: string, propertyName: string, index: number) => {
//     try {
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = `${propertyName}_Brochure_${index + 1}.pdf`;
//       link.target = '_blank';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       setSnackbar({ open: true, message: "Brochure download started", severity: "success" });
//     } catch (error) {
//       setSnackbar({ open: true, message: "Download failed", severity: "error" });
//     }
//   };

//   const handleDownloadCreative = (url: string, propertyName: string, index: number) => {
//     try {
//       const link = document.createElement('a');
//       link.href = url;
//       const extension = url.split('.').pop() || 'jpg';
//       link.download = `${propertyName}_Creative_${index + 1}.${extension}`;
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
//       const fileName = title ? `${propertyName}_${title.replace(/[^a-z0-9]/gi, '_')}.${extension}` : `${propertyName}_Image_${index + 1}.${extension}`;
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

//   const handleDownloadAllBrochures = (property: any) => {
//     if (property.brochureUrls && property.brochureUrls.length > 0) {
//       property.brochureUrls.forEach((url: string, index: number) => {
//         setTimeout(() => handleDownloadBrochure(url, property.projectName, index), index * 500);
//       });
//       setSnackbar({ open: true, message: `Downloading ${property.brochureUrls.length} brochures`, severity: "success" });
//     }
//   };

//   const handleDownloadAllCreatives = (property: any) => {
//     if (property.creatives && property.creatives.length > 0) {
//       property.creatives.forEach((url: string, index: number) => {
//         setTimeout(() => handleDownloadCreative(url, property.projectName, index), index * 500);
//       });
//       setSnackbar({ open: true, message: `Downloading ${property.creatives.length} creative assets`, severity: "success" });
//     }
//   };

//   const handleDownloadAllImages = (property: any) => {
//     if (property.images && property.images.length > 0) {
//       property.images.forEach((image: any, index: number) => {
//         setTimeout(() => handleDownloadImage(image.url, property.projectName, index, image.title), index * 500);
//       });
//       setSnackbar({ open: true, message: `Downloading ${property.images.length} images`, severity: "success" });
//     }
//   };

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

//   // Status handlers
//   const handleAddStatus = () => {
//     if (newStatus.trim()) {
//       setFormData(prev => ({
//         ...prev,
//         status: [...prev.status, newStatus.trim()]
//       }));
//       setNewStatus("");
//     }
//   };

//   const removeStatus = (index: number) => {
//     setFormData(prev => ({
//       ...prev,
//       status: prev.status.filter((_, i) => i !== index)
//     }));
//   };

//   // Features handlers
//   const handleAddFeature = () => {
//     if (newFeature.trim()) {
//       setFormData(prev => ({
//         ...prev,
//         features: [...prev.features, newFeature.trim()]
//       }));
//       setNewFeature("");
//     }
//   };

//   const removeFeature = (index: number) => {
//     setFormData(prev => ({
//       ...prev,
//       features: prev.features.filter((_, i) => i !== index)
//     }));
//   };

//   // Amenities handlers
//   const handleAddAmenity = () => {
//     if (newAmenity.trim()) {
//       setFormData(prev => ({
//         ...prev,
//         amenities: [...prev.amenities, newAmenity.trim()]
//       }));
//       setNewAmenity("");
//     }
//   };

//   const removeAmenity = (index: number) => {
//     setFormData(prev => ({
//       ...prev,
//       amenities: prev.amenities.filter((_, i) => i !== index)
//     }));
//   };

//   // Nearby handlers
//   const handleAddNearby = () => {
//     if (newNearby.trim()) {
//       setFormData(prev => ({
//         ...prev,
//         nearby: [...prev.nearby, newNearby.trim()]
//       }));
//       setNewNearby("");
//     }
//   };

//   const removeNearby = (index: number) => {
//     setFormData(prev => ({
//       ...prev,
//       nearby: prev.nearby.filter((_, i) => i !== index)
//     }));
//   };

//   // Project Highlights handlers
//   const handleAddProjectHighlight = () => {
//     if (newProjectHighlight.trim()) {
//       setFormData(prev => ({
//         ...prev,
//         projectHighlights: [...prev.projectHighlights, newProjectHighlight.trim()]
//       }));
//       setNewProjectHighlight("");
//     }
//   };

//   const removeProjectHighlight = (index: number) => {
//     setFormData(prev => ({
//       ...prev,
//       projectHighlights: prev.projectHighlights.filter((_, i) => i !== index)
//     }));
//   };

//   // Images handlers
//   const handleAddImage = () => {
//     if (newImage.url.trim()) {
//       setFormData(prev => ({
//         ...prev,
//         images: [...prev.images, { ...newImage, url: newImage.url.trim() }]
//       }));
//       setNewImage({ url: "", title: "", description: "", isPrimary: false });
//     }
//   };

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

//   // Brochure URLs handlers
//   const handleAddBrochureUrl = () => {
//     if (newBrochureUrl.trim()) {
//       setFormData(prev => ({
//         ...prev,
//         brochureUrls: [...prev.brochureUrls, newBrochureUrl.trim()]
//       }));
//       setNewBrochureUrl("");
//     }
//   };

//   const removeBrochureUrl = (index: number) => {
//     setFormData(prev => ({
//       ...prev,
//       brochureUrls: prev.brochureUrls.filter((_, i) => i !== index)
//     }));
//   };

//   // Creatives handlers
//   const handleAddCreative = () => {
//     if (newCreative.trim()) {
//       setFormData(prev => ({
//         ...prev,
//         creatives: [...prev.creatives, newCreative.trim()]
//       }));
//       setNewCreative("");
//     }
//   };

//   const removeCreative = (index: number) => {
//     setFormData(prev => ({
//       ...prev,
//       creatives: prev.creatives.filter((_, i) => i !== index)
//     }));
//   };

//   // Video IDs handlers
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

//   const handleSubmit = () => {
//     if (editingProperty) {
//       setProperties( prev => prev.map(p => (p.id === editingProperty.id ? { ...formData, id: editingProperty.id } : p)));
//       setSnackbar({ open: true, message: "Property updated successfully", severity: "success" });
//     } 
//     else {
//       const newProperty = {
//         ...formData,
//         id: Math.max(...properties.map(p => p.id)) + 1
//       };
//       setProperties(prev => [...prev, newProperty]);
//       setSnackbar({ open: true, message: "Property added successfully", severity: "success" });
//     }
//     handleCloseDialog();
//   };

//   const handleDelete = (id: number) => {
//     if (window.confirm("Are you sure you want to delete this property?")) {
//       setProperties(prev => prev.filter(p => p.id !== id));
//       setSnackbar({ open: true, message: "Property deleted successfully", severity: "success" });
//     }
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       {/* Header */}
//       <Paper sx={{ p: 3, mb: 3, background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" }}>
//         <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//           <Typography variant="h4" fontWeight={700}>
//             Properties Management
//           </Typography>
//           <Box display="flex" gap={1} alignItems="center" sx={{ maxWidth: '600px' }}>
//           <TextField
//             fullWidth
//             variant="outlined"
//             placeholder="Search properties by name, builder, location, features..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
//             size="small"
//             sx={{
//               '& .MuiOutlinedInput-root': {
//                 borderRadius: '25px',
//                 backgroundColor: 'white',
//               }
//             }}
//           />
//           <Button
//             variant="contained"
//             startIcon={<Search />}
//             onClick={handleSearch}
//             sx={{
//               borderRadius: '25px',
//               px: 3,
//               background: "linear-gradient(45deg, #4CAF50 30%, #45a049 90%)",
//               "&:hover": {
//                 background: "linear-gradient(45deg, #45a049 30%, #3d8b40 90%)",
//               },
//             }}
//           >
//             Search
//           </Button>
//           {searchTerm && (
//             <Button
//               variant="outlined"
//               onClick={() => {
//                 setSearchTerm("");
//                 setFilteredProperties(properties);
//               }}
//               sx={{ borderRadius: '25px' }}
//             >
//               Clear
//             </Button>
//           )}
//           </Box>
//           <Button
//             variant="contained"
//             startIcon={<Add />}
//             onClick={() => handleOpenDialog()}
//             sx={{
//               background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
//               "&:hover": {
//                 background: "linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)",
//               },
//             }}
//           >
//             Add Property
//           </Button>
//         </Box>
        
//         {/* Search Results Count */}
//         {searchTerm && (
//           <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//             Found {filteredProperties.length} property{filteredProperties.length !== 1 ? 'ies' : ''} matching "{searchTerm}"
//           </Typography>
//         )}
//       </Paper>

//       {/* Properties Grid */}
//       <Grid container spacing={3}>
//         {filteredProperties.map((property) => {
//           const primaryImage = property.images.find(img => img.isPrimary) || property.images[0];
        
//           return (
//             <Grid size={{ xs: 12, md: 6, lg: 4 }} key={property.id}>
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
//                     <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenDialog(property); }} sx={{ color: 'white' }} title="Edit Property">
//                       <Edit />
//                     </IconButton>
//                     <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(property.id); }} sx={{ color: 'white' }} title="Delete Property">
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
//       {filteredProperties.length === 0 && (
//         <Paper sx={{ p: 4, textAlign: 'center', mt: 2, borderRadius: '15px' }}>
//           <Typography variant="h6" color="text.secondary" gutterBottom>
//             No properties found matching your search criteria.
//           </Typography>
//           <Button 
//             variant="contained" 
//             onClick={() => {
//               setSearchTerm("");
//               setFilteredProperties(properties);
//             }}
//             sx={{ mt: 2 }}
//           >
//             Show All Properties
//           </Button>
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
//             <Grid size={{ xs: 12, md: 12 }} display={"flex"} gap={'1.5rem'} maxHeight={'100%'}>
//               {/* image */}
//               {viewingProperty?.images?.length > 0 && (
//                 <Grid size={{ xs: 12, md: 12 }}>
//                   <ImageCarousel 
//                       images={viewingProperty.images} 
//                       projectName={viewingProperty.projectName}
//                     />
//                 </Grid>
//               )}
//               {/* Basic Information */}
//               <Grid size={{ xs: 12, md: 6 }}>
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
                  
//                   {viewingProperty?.nearby?.length > 0 && (
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
                
//                 {viewingProperty?.features?.length > 0 && (
//                   <Box mb={2}>
//                     <Typography variant="subtitle2" gutterBottom>Features</Typography>
//                     <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
//                       {viewingProperty.features.map((feature: string, index: number) => (
//                         <Chip key={index} label={feature} size="small" variant="outlined" />
//                       ))}
//                     </Box>
//                   </Box>
//                 )}
                
//                 {viewingProperty?.amenities?.length > 0 && (
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
                
//                 {viewingProperty?.status?.length > 0 && (
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
                
//                 {viewingProperty?.projectHighlights?.length > 0 && (
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
//             {viewingProperty?.mapLocation?.lat && viewingProperty?.mapLocation?.lng && (
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
                
//                 {viewingProperty?.brochureUrls?.length > 0 && (
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
//                       {viewingProperty.brochureUrls.map((url: string, index: number) => (
//                         <ListItem key={index} sx={{ pl: 0 }}>
//                           <ListItemText 
//                             primary={`Brochure ${index + 1}`}
//                             secondary={url.length > 50 ? `${url.substring(0, 50)}...` : url}
//                           />
//                           <ListItemSecondaryAction>
//                             <IconButton 
//                               size="small" 
//                               onClick={() => handleDownloadBrochure(url, viewingProperty.projectName, index)}
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

//                 {viewingProperty?.creatives?.length > 0 && (
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
//                       {viewingProperty.creatives.map((url: string, index: number) => (
//                         <ListItem key={index} sx={{ pl: 0 }}>
//                           <ListItemText 
//                             primary={`Creative ${index + 1}`}
//                             secondary={url.length > 50 ? `${url.substring(0, 50)}...` : url}
//                           />
//                           <ListItemSecondaryAction>
//                             <IconButton 
//                               size="small" 
//                               onClick={() => handleDownloadCreative(url, viewingProperty.projectName, index)}
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

//                 {viewingProperty?.videoIds?.length > 0 && (
//                   <Box>
//                     <Typography variant="subtitle2" gutterBottom>
//                       <VideoLibrary fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} />
//                       Videos ({viewingProperty.videoIds.length})
//                     </Typography>
//                     <List dense>
//                       {viewingProperty.videoIds.map((videoId: string, index: number) => (
//                         <ListItem key={index} sx={{ pl: 0 }}>
//                           <ListItemText 
//                             primary={`Video ${index + 1}`}
//                             secondary={videoId.length > 50 ? `${videoId.substring(0, 50)}...` : videoId}
//                           />
//                           <ListItemSecondaryAction>
//                             <IconButton 
//                               size="small" 
//                               onClick={() => window.open(videoId.includes('youtube.com') ? videoId : `https://youtube.com/watch?v=${videoId}`, '_blank')}
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

//                 {(!viewingProperty?.brochureUrls?.length && !viewingProperty?.creatives?.length && !viewingProperty?.videoIds?.length) && (
//                   <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
//                     No media assets available
//                   </Typography>
//                 )}
//               </Paper>
//             </Grid>
            
//             {/* Image Gallery with Download Functionality */}
//             {viewingProperty?.images?.filter((img: any) => !img.isPrimary)?.length > 0 && (
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
//       <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
//         <DialogTitle>
//           {editingProperty ? "Edit Property" : "Add New Property"}
//         </DialogTitle>
//         <DialogContent>
//           <Grid container spacing={2} sx={{ mt: 1 }}>
//             {/* Basic Information */}
//             <Grid size={{ xs: 12 }}>
//               <Typography variant="h6" gutterBottom>
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
//               />
//             </Grid>
//             {/* Location */}
//             <Grid size={{ xs: 12, md: 6 }}>
//               <TextField
//                 fullWidth
//                 label="Location"
//                 value={formData.location}
//                 onChange={handleInputChange("location")}
//                 required
//               />
//             </Grid>
//             {/* Price */}
//             <Grid size={{ xs: 12, md: 6 }}>
//               <TextField
//                 fullWidth
//                 label="Price"
//                 value={formData.price}
//                 onChange={handleInputChange("price")}
//                 required
//               />
//             </Grid>
//             {/* Description */}
//             <Grid size={{ xs: 12, md: 6 }}>
//               <TextField
//                 fullWidth
//                 label="Description"
//                 value={formData.description}
//                 onChange={handleInputChange("description")}
//                 multiline
//                 rows={3}
//                 required
//               />
//             </Grid>
            
//             {/* Status */}
//             <Grid size={{ xs: 12, md: 6 }}>
//               <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
//                 Status
//               </Typography>
//               <Box display="flex" alignItems="center" gap={1} mb={1}>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   placeholder="Add status"
//                   value={newStatus}
//                   onChange={(e) => setNewStatus(e.target.value)}
//                   onKeyPress={(e) => e.key === "Enter" && handleAddStatus()}
//                 />
//                 <Button onClick={handleAddStatus} variant="outlined">
//                   Add
//                 </Button>
//               </Box>
//               <Box display="flex" flexWrap="wrap" gap={0.5}>
//                 {formData.status.map((status, index) => (
//                   <Chip
//                     key={index}
//                     label={status}
//                     onDelete={() => removeStatus(index)}
//                     size="small"
//                     color={
//                       status === "Ready to Move" ? "success" : 
//                       status === "Under Construction" ? "warning" : 
//                       "info"
//                     }
//                   />
//                 ))}
//               </Box>
//             </Grid>

//             {/* Nearby Places */}
//             <Grid size={{ xs: 12, md: 6 }}>
//               <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
//                 Nearby Places
//               </Typography>
//               <Box display="flex" alignItems="center" gap={1} mb={1}>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   placeholder="Add nearby place"
//                   value={newNearby}
//                   onChange={(e) => setNewNearby(e.target.value)}
//                   onKeyPress={(e) => e.key === "Enter" && handleAddNearby()}
//                 />
//                 <Button onClick={handleAddNearby} variant="outlined">
//                   Add
//                 </Button>
//               </Box>
//               <Box display="flex" flexWrap="wrap" gap={0.5}>
//                 {formData.nearby.map((place, index) => (
//                   <Chip
//                     key={index}
//                     label={place}
//                     onDelete={() => removeNearby(index)}
//                     size="small"
//                     variant="outlined"
//                   />
//                 ))}
//               </Box>
//             </Grid>

//             {/* Project Highlights */}
//             <Grid size={{ xs: 12 }}>
//               <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
//                 Project Highlights
//               </Typography>
//               <Box display="flex" alignItems="center" gap={1} mb={1}>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   placeholder="Add project highlight"
//                   value={newProjectHighlight}
//                   onChange={(e) => setNewProjectHighlight(e.target.value)}
//                   onKeyPress={(e) => e.key === "Enter" && handleAddProjectHighlight()}
//                 />
//                 <Button onClick={handleAddProjectHighlight} variant="outlined">
//                   Add
//                 </Button>
//               </Box>
//               <Box display="flex" flexWrap="wrap" gap={0.5}>
//                 {formData.projectHighlights.map((highlight, index) => (
//                   <Chip
//                     key={index}
//                     label={highlight}
//                     onDelete={() => removeProjectHighlight(index)}
//                     size="small"
//                     color="secondary"
//                   />
//                 ))}
//               </Box>
//             </Grid>

//             {/* Map Location */}
//             <Grid size={{ xs: 12 }}>
//               <Divider sx={{ my: 2 }} />
//               <Typography variant="h6" gutterBottom>
//                 Map Location
//               </Typography>
//             </Grid>

//             {/* Map */}
//             <Grid size={{ xs: 12, md: 6 }}>
//               <TextField
//                 fullWidth
//                 label="Latitude"
//                 type="number"
//                 value={formData.mapLocation.lat}
//                 onChange={handleMapLocationChange('lat')}
//                 inputProps={{ step: "any" }}
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
//               />
//             </Grid>

//             {/* Features */}
//             <Grid size={{ xs: 12, md: 6 }}>
//               <Divider sx={{ my: 2 }} />
//               <Typography variant="h6" gutterBottom>
//                 Features
//               </Typography>
//               <Box display="flex" alignItems="center" gap={1} mb={1}>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   placeholder="Add feature"
//                   value={newFeature}
//                   onChange={(e) => setNewFeature(e.target.value)}
//                   onKeyPress={(e) => e.key === "Enter" && handleAddFeature()}
//                 />
//                 <Button onClick={handleAddFeature} variant="outlined">
//                   Add
//                 </Button>
//               </Box>
//               <Box display="flex" flexWrap="wrap" gap={0.5}>
//                 {formData.features.map((feature, index) => (
//                   <Chip
//                     key={index}
//                     label={feature}
//                     onDelete={() => removeFeature(index)}
//                     size="small"
//                   />
//                 ))}
//               </Box>
//             </Grid>

//             {/* Amenities */}
//             <Grid size={{ xs: 12, md: 6 }}>
//               <Divider sx={{ my: 2 }} />
//               <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
//                 Amenities
//               </Typography>
//               <Box display="flex" alignItems="center" gap={1} mb={1}>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   placeholder="Add amenity"
//                   value={newAmenity}
//                   onChange={(e) => setNewAmenity(e.target.value)}
//                   onKeyPress={(e) => e.key === "Enter" && handleAddAmenity()}
//                 />
//                 <Button onClick={handleAddAmenity} variant="outlined">
//                   Add
//                 </Button>
//               </Box>
//               <Box display="flex" flexWrap="wrap" gap={0.5}>
//                 {formData.amenities.map((amenity, index) => (
//                   <Chip
//                     key={index}
//                     label={amenity}
//                     onDelete={() => removeAmenity(index)}
//                     size="small"
//                   />
//                 ))}
//               </Box>
//             </Grid>

//             {/* Images */}
//             <Grid size={{ xs: 12 }}>
//               <Divider sx={{ my: 2 }} />
//               <Typography variant="h6" gutterBottom>
//                 <Photo sx={{ mr: 1, verticalAlign: "middle" }} />
//                 Images
//               </Typography>
              
//               <Grid container spacing={2} sx={{ mb: 2 }}>
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <TextField
//                     fullWidth
//                     size="small"
//                     placeholder="Image URL"
//                     value={newImage.url}
//                     onChange={(e) => setNewImage(prev => ({ ...prev, url: e.target.value }))}
//                   />
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 3 }}>
//                   <TextField
//                     fullWidth
//                     size="small"
//                     placeholder="Title"
//                     value={newImage.title}
//                     onChange={(e) => setNewImage(prev => ({ ...prev, title: e.target.value }))}
//                   />
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 3 }}>
//                   <TextField
//                     fullWidth
//                     size="small"
//                     placeholder="Description"
//                     value={newImage.description}
//                     onChange={(e) => setNewImage(prev => ({ ...prev, description: e.target.value }))}
//                   />
//                 </Grid>
//                 <Grid size={{ xs: 12 }}>
//                   <Box display="flex" alignItems="center" gap={1}>
//                     <Button onClick={handleAddImage} variant="outlined" size="small">
//                       Add Image
//                     </Button>
//                     <Typography variant="caption" color="text.secondary">
//                       First image will be set as primary by default
//                     </Typography>
//                   </Box>
//                 </Grid>
//               </Grid>

//               {formData.images.length > 0 && (
//                 <List dense>
//                   {formData.images.map((image, index) => (
//                     <ListItem key={index} divider>
//                       <ListItemText
//                         primary={image.title || `Image ${index + 1}`}
//                         secondary={
//                           <Box>
//                             <Typography variant="caption" display="block">
//                               {image.url}
//                             </Typography>
//                             {image.description && (
//                               <Typography variant="caption" color="text.secondary">
//                                 {image.description}
//                               </Typography>
//                             )}
//                             {image.isPrimary && (
//                               <Chip label="Primary" size="small" color="primary" sx={{ mt: 0.5 }} />
//                             )}
//                           </Box>
//                         }
//                       />
//                       <ListItemSecondaryAction>
//                         {!image.isPrimary && (
//                           <Button
//                             size="small"
//                             onClick={() => setPrimaryImage(index)}
//                             sx={{ mr: 1 }}
//                           >
//                             Set Primary
//                           </Button>
//                         )}
//                         <IconButton edge="end" onClick={() => removeImage(index)}>
//                           <Delete />
//                         </IconButton>
//                       </ListItemSecondaryAction>
//                     </ListItem>
//                   ))}
//                 </List>
//               )}
//             </Grid>

//             {/* Brochure URLs */}
//             <Grid size={{ xs: 12, md: 4 }}>
//               <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
//                 <Description sx={{ mr: 1, verticalAlign: "middle" }} />
//                 Brochure URLs
//               </Typography>
//               <Box display="flex" alignItems="center" gap={1} mb={1}>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   placeholder="Brochure URL"
//                   value={newBrochureUrl}
//                   onChange={(e) => setNewBrochureUrl(e.target.value)}
//                   onKeyPress={(e) => e.key === "Enter" && handleAddBrochureUrl()}
//                 />
//                 <Button onClick={handleAddBrochureUrl} variant="outlined">
//                   Add
//                 </Button>
//               </Box>
//               {formData.brochureUrls.length > 0 && (
//                 <List dense>
//                   {formData.brochureUrls.map((url, index) => (
//                     <ListItem key={index}>
//                       <ListItemText primary={url} />
//                       <ListItemSecondaryAction>
//                         <IconButton edge="end" onClick={() => removeBrochureUrl(index)}>
//                           <Remove />
//                         </IconButton>
//                       </ListItemSecondaryAction>
//                     </ListItem>
//                   ))}
//                 </List>
//               )}
//             </Grid>

//             {/* Creatives */}
//             <Grid size={{ xs: 12, md: 4 }}>
//               <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
//                 Creative Assets
//               </Typography>
//               <Box display="flex" alignItems="center" gap={1} mb={1}>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   placeholder="Creative asset URL"
//                   value={newCreative}
//                   onChange={(e) => setNewCreative(e.target.value)}
//                   onKeyPress={(e) => e.key === "Enter" && handleAddCreative()}
//                 />
//                 <Button onClick={handleAddCreative} variant="outlined">
//                   Add
//                 </Button>
//               </Box>
//               {formData.creatives.length > 0 && (
//                 <List dense>
//                   {formData.creatives.map((creative, index) => (
//                     <ListItem key={index}>
//                       <ListItemText primary={creative} />
//                       <ListItemSecondaryAction>
//                         <IconButton edge="end" onClick={() => removeCreative(index)}>
//                           <Remove />
//                         </IconButton>
//                       </ListItemSecondaryAction>
//                     </ListItem>
//                   ))}
//                 </List>
//               )}
//             </Grid>

//             {/* Video IDs */}
//             <Grid size={{ xs: 12, md: 4 }}>
//               <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
//                 <VideoLibrary sx={{ mr: 1, verticalAlign: "middle" }} />
//                 Video IDs
//               </Typography>
//               <Box display="flex" alignItems="center" gap={1} mb={1}>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   placeholder="YouTube Video ID or URL"
//                   value={newVideoId}
//                   onChange={(e) => setNewVideoId(e.target.value)}
//                   onKeyPress={(e) => e.key === "Enter" && handleAddVideoId()}
//                   helperText="Enter YouTube video ID (e.g., dQw4w9WgXcQ) or full URL"
//                 />
//                 <Button onClick={handleAddVideoId} variant="outlined">
//                   Add
//                 </Button>
//               </Box>
//               {formData.videoIds.length > 0 && (
//                 <List dense>
//                   {formData.videoIds.map((videoId, index) => (
//                     <ListItem key={index}>
//                       <ListItemText primary={videoId} />
//                       <ListItemSecondaryAction>
//                         <IconButton edge="end" onClick={() => removeVideoId(index)}>
//                           <Remove />
//                         </IconButton>
//                       </ListItemSecondaryAction>
//                     </ListItem>
//                   ))}
//                 </List>
//               )}
//             </Grid>
//           </Grid>
//         </DialogContent>
        
//         <DialogActions>
//           <Button onClick={handleCloseDialog}>Cancel</Button>
//           <Button onClick={handleSubmit} variant="contained">
//             {editingProperty ? "Update" : "Create"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Snackbar for notifications */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//       >
//         <Alert severity={snackbar.severity as any}>
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// }

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
  MenuItem
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
  Remove
} from "@mui/icons-material";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

// Leaflet imports for map
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import your services
import { propertyService, type Property } from '@/services/propertyService';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: "", 
    severity: "success" as "success" | "error" 
  });
  
  // Updated form data structure with title and type fields
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
    videoIds: [] as string[]
  });
  
  // Updated form input states
  const [newFeature, setNewFeature] = useState("");
  const [newAmenity, setNewAmenity] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newNearby, setNewNearby] = useState("");
  const [newProjectHighlight, setNewProjectHighlight] = useState("");
  const [newImage, setNewImage] = useState({ url: "", title: "", description: "", isPrimary: false });
  const [newBrochureUrl, setNewBrochureUrl] = useState({ title: "", url: "", type: "PDF Document" });
  const [newCreative, setNewCreative] = useState({ title: "", url: "", type: "Image" });
  const [newVideoId, setNewVideoId] = useState("");

  // Load properties on component mount
  useEffect(() => {
    loadProperties();
  }, []);

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

  // Search functionality
  const handleSearch = () => {
    loadProperties(searchTerm);
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
        videoIds: property.videoIds || []
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
        videoIds: []
      });
    }
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
    setNewImage({ url: "", title: "", description: "", isPrimary: false });
    setNewBrochureUrl({ title: "", url: "", type: "PDF Document" });
    setNewCreative({ title: "", url: "", type: "Image" });
    setNewVideoId("");
  };

  const handleViewProperty = (property: Property) => {
    setViewingProperty(property);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewingProperty(null);
  };

  // Updated download handlers to use titles
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
  };

  // Array field handlers
  const handleAddStatus = () => {
    if (newStatus.trim()) {
      setFormData(prev => ({
        ...prev,
        status: [...prev.status, newStatus.trim()]
      }));
      setNewStatus("");
    }
  };

  const removeStatus = (index: number) => {
    setFormData(prev => ({
      ...prev,
      status: prev.status.filter((_, i) => i !== index)
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity("");
    }
  };

  const removeAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const handleAddNearby = () => {
    if (newNearby.trim()) {
      setFormData(prev => ({
        ...prev,
        nearby: [...prev.nearby, newNearby.trim()]
      }));
      setNewNearby("");
    }
  };

  const removeNearby = (index: number) => {
    setFormData(prev => ({
      ...prev,
      nearby: prev.nearby.filter((_, i) => i !== index)
    }));
  };

  const handleAddProjectHighlight = () => {
    if (newProjectHighlight.trim()) {
      setFormData(prev => ({
        ...prev,
        projectHighlights: [...prev.projectHighlights, newProjectHighlight.trim()]
      }));
      setNewProjectHighlight("");
    }
  };

  const removeProjectHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projectHighlights: prev.projectHighlights.filter((_, i) => i !== index)
    }));
  };

  const handleAddImage = () => {
    if (newImage.url.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, { ...newImage, url: newImage.url.trim() }]
      }));
      setNewImage({ url: "", title: "", description: "", isPrimary: false });
    }
  };

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

  // Updated brochure URL handlers with title and type
  const handleAddBrochureUrl = () => {
    if (newBrochureUrl.url.trim() && newBrochureUrl.title.trim()) {
      setFormData(prev => ({
        ...prev,
        brochureUrls: [...prev.brochureUrls, { 
          title: newBrochureUrl.title.trim(), 
          url: newBrochureUrl.url.trim(),
          type: newBrochureUrl.type
        }]
      }));
      setNewBrochureUrl({ title: "", url: "", type: "PDF Document" });
    }
  };

  const removeBrochureUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      brochureUrls: prev.brochureUrls.filter((_, i) => i !== index)
    }));
  };

  const handleBrochureInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewBrochureUrl(prev => ({ ...prev, [field]: e.target.value }));
  };

  // Updated creative handlers with title and type
  const handleAddCreative = () => {
    if (newCreative.url.trim() && newCreative.title.trim()) {
      setFormData(prev => ({
        ...prev,
        creatives: [...prev.creatives, { 
          title: newCreative.title.trim(), 
          url: newCreative.url.trim(),
          type: newCreative.type
        }]
      }));
      setNewCreative({ title: "", url: "", type: "Image" });
    }
  };

  const removeCreative = (index: number) => {
    setFormData(prev => ({
      ...prev,
      creatives: prev.creatives.filter((_, i) => i !== index)
    }));
  };

  const handleCreativeInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewCreative(prev => ({ ...prev, [field]: e.target.value }));
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

  const handleSubmit = async () => {
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
      <Paper sx={{ p: 3, mb: 3, background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight={700}>
            Properties Management
          </Typography>
          <Box display="flex" gap={1} alignItems="center" sx={{ maxWidth: '600px' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search properties by name, builder, location, features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '25px',
                backgroundColor: 'white',
              }
            }}
          />
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={handleSearch}
            sx={{
              borderRadius: '25px',
              px: 3,
              background: "linear-gradient(45deg, #4CAF50 30%, #45a049 90%)",
              "&:hover": {
                background: "linear-gradient(45deg, #45a049 30%, #3d8b40 90%)",
              },
            }}
          >
            Search
          </Button>
          {searchTerm && (
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm("");
                loadProperties();
              }}
              sx={{ borderRadius: '25px' }}
            >
              Clear
            </Button>
          )}
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
              "&:hover": {
                background: "linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)",
              },
            }}
          >
            Add Property
          </Button>
        </Box>
        
        {/* Search Results Count */}
        {searchTerm && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Found {properties.length} property{properties.length !== 1 ? 'ies' : ''} matching "{searchTerm}"
          </Typography>
        )}
      </Paper>

      {/* Properties Grid */}
      <Grid container spacing={3}>
        {properties.map((property) => {
          const primaryImage = property.images?.find(img => img.isPrimary) || property.images?.[0];
        
          return (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={property._id}>
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
      {properties.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 2, borderRadius: '15px' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm ? 'No properties found matching your search criteria.' : 'No properties found.'}
          </Typography>
          {searchTerm && (
            <Button 
              variant="contained" 
              onClick={() => {
                setSearchTerm("");
                loadProperties();
              }}
              sx={{ mt: 2 }}
            >
              Show All Properties
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
            <Grid size={{ xs: 12, md: 12 }} display={"flex"} gap={'1.5rem'} maxHeight={'100%'}>
              {/* image */}
              {viewingProperty?.images && viewingProperty.images.length > 0 && (
                <Grid size={{ xs: 12, md: 12 }}>
                  <ImageCarousel 
                      images={viewingProperty.images} 
                      projectName={viewingProperty.projectName}
                    />
                </Grid>
              )}
              {/* Basic Information */}
              <Grid size={{ xs: 12, md: 6 }}>
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
                      {/* {viewingProperty.brochureUrls.map((url: string, index: number) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <ListItemText 
                            primary={`Brochure ${index + 1}`}
                            secondary={url.length > 50 ? `${url.substring(0, 50)}...` : url}
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDownloadBrochure(url, viewingProperty.projectName, index)}
                              title="Download Brochure"
                            >
                              <Download />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))} */}
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
                      {/* {viewingProperty.creatives.map((url: string, index: number) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <ListItemText 
                            primary={`Creative ${index + 1}`}
                            secondary={url.length > 50 ? `${url.substring(0, 50)}...` : url}
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDownloadCreative(url, viewingProperty.projectName, index)}
                              title="Download Creative"
                            >
                              <Download />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))} */}
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

                {viewingProperty?.videoIds && viewingProperty.videoIds.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      <VideoLibrary fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} />
                      Videos ({viewingProperty.videoIds.length})
                    </Typography>
                    <List dense>
                      {viewingProperty.videoIds.map((videoId: string, index: number) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <ListItemText 
                            primary={`Video ${index + 1}`}
                            secondary={videoId.length > 50 ? `${videoId.substring(0, 50)}...` : videoId}
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              size="small" 
                              onClick={() => window.open(videoId.includes('youtube.com') ? videoId : `https://youtube.com/watch?v=${videoId}`, '_blank')}
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

                {(!viewingProperty?.brochureUrls?.length && !viewingProperty?.creatives?.length && !viewingProperty?.videoIds?.length) && (
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

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingProperty ? "Edit Property" : "Add New Property"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            {/* Project Name */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Project Name"
                value={formData.projectName}
                onChange={handleInputChange("projectName")}
                required
              />
            </Grid>
            {/* Builder Name */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Builder Name"
                value={formData.builderName}
                onChange={handleInputChange("builderName")}
                required
              />
            </Grid>
            {/* Location */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={handleInputChange("location")}
                required
              />
            </Grid>
            {/* Price */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Price"
                value={formData.price}
                onChange={handleInputChange("price")}
                required
              />
            </Grid>
            {/* Description */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleInputChange("description")}
                multiline
                rows={3}
                required
              />
            </Grid>
            
            {/* Status */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Status
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddStatus()}
                />
                <Button onClick={handleAddStatus} variant="outlined">
                  Add
                </Button>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {formData.status.map((status, index) => (
                  <Chip
                    key={index}
                    label={status}
                    onDelete={() => removeStatus(index)}
                    size="small"
                    color={
                      status === "Ready to Move" ? "success" : 
                      status === "Under Construction" ? "warning" : 
                      "info"
                    }
                  />
                ))}
              </Box>
            </Grid>

            {/* Nearby Places */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Nearby Places
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add nearby place"
                  value={newNearby}
                  onChange={(e) => setNewNearby(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddNearby()}
                />
                <Button onClick={handleAddNearby} variant="outlined">
                  Add
                </Button>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {formData.nearby.map((place, index) => (
                  <Chip
                    key={index}
                    label={place}
                    onDelete={() => removeNearby(index)}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            {/* Project Highlights */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Project Highlights
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add project highlight"
                  value={newProjectHighlight}
                  onChange={(e) => setNewProjectHighlight(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddProjectHighlight()}
                />
                <Button onClick={handleAddProjectHighlight} variant="outlined">
                  Add
                </Button>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {formData.projectHighlights.map((highlight, index) => (
                  <Chip
                    key={index}
                    label={highlight}
                    onDelete={() => removeProjectHighlight(index)}
                    size="small"
                    color="secondary"
                  />
                ))}
              </Box>
            </Grid>

            {/* Map Location */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Map Location
              </Typography>
            </Grid>

            {/* Map */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                value={formData.mapLocation.lat}
                onChange={handleMapLocationChange('lat')}
                inputProps={{ step: "any" }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                value={formData.mapLocation.lng}
                onChange={handleMapLocationChange('lng')}
                inputProps={{ step: "any" }}
              />
            </Grid>

            {/* Features */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Features
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add feature"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddFeature()}
                />
                <Button onClick={handleAddFeature} variant="outlined">
                  Add
                </Button>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {formData.features.map((feature, index) => (
                  <Chip
                    key={index}
                    label={feature}
                    onDelete={() => removeFeature(index)}
                    size="small"
                  />
                ))}
              </Box>
            </Grid>

            {/* Amenities */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Amenities
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add amenity"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddAmenity()}
                />
                <Button onClick={handleAddAmenity} variant="outlined">
                  Add
                </Button>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {formData.amenities.map((amenity, index) => (
                  <Chip
                    key={index}
                    label={amenity}
                    onDelete={() => removeAmenity(index)}
                    size="small"
                  />
                ))}
              </Box>
            </Grid>

            {/* Images */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                <Photo sx={{ mr: 1, verticalAlign: "middle" }} />
                Images
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Image URL"
                    value={newImage.url}
                    onChange={(e) => setNewImage(prev => ({ ...prev, url: e.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Title"
                    value={newImage.title}
                    onChange={(e) => setNewImage(prev => ({ ...prev, title: e.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Description"
                    value={newImage.description}
                    onChange={(e) => setNewImage(prev => ({ ...prev, description: e.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Button onClick={handleAddImage} variant="outlined" size="small">
                      Add Image
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                      First image will be set as primary by default
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {formData.images.length > 0 && (
                <List dense>
                  {formData.images.map((image, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={image.title || `Image ${index + 1}`}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {image.url}
                            </Typography>
                            {image.description && (
                              <Typography variant="caption" color="text.secondary">
                                {image.description}
                              </Typography>
                            )}
                            {image.isPrimary && (
                              <Chip label="Primary" size="small" color="primary" sx={{ mt: 0.5 }} />
                            )}
                          </Box>
                        }
                      />
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
                        <IconButton edge="end" onClick={() => removeImage(index)}>
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>

            {/* Brochure URLs */}
            {/* <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                <Description sx={{ mr: 1, verticalAlign: "middle" }} />
                Brochure URLs
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Brochure URL"
                  value={newBrochureUrl}
                  onChange={(e) => setNewBrochureUrl(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddBrochureUrl()}
                />
                <Button onClick={handleAddBrochureUrl} variant="outlined">
                  Add
                </Button>
              </Box>
              {formData.brochureUrls.length > 0 && (
                <List dense>
                  {formData.brochureUrls.map((url, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={url} />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => removeBrochureUrl(index)}>
                          <Remove />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid> */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                <Description sx={{ mr: 1, verticalAlign: "middle" }} />
                Brochure URLs
              </Typography>
              
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Brochure Title"
                    value={newBrochureUrl.title}
                    onChange={handleBrochureInputChange("title")}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Brochure URL"
                    value={newBrochureUrl.url}
                    onChange={handleBrochureInputChange("url")}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Type"
                    value={newBrochureUrl.type}
                    onChange={handleBrochureInputChange("type")}
                  >
                    <MenuItem value="PDF Document">PDF Document</MenuItem>
                    <MenuItem value="Brochure">Brochure</MenuItem>
                    <MenuItem value="Document">Document</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
              
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Button onClick={handleAddBrochureUrl} variant="outlined" size="small">
                  Add Brochure
                </Button>
              </Box>
              
              {formData.brochureUrls.length > 0 && (
                <List dense>
                  {formData.brochureUrls.map((brochure, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={brochure.title}
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
                        <IconButton edge="end" onClick={() => removeBrochureUrl(index)} size="small">
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>

            {/* Creatives */}
            {/* <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Creative Assets
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Creative asset URL"
                  value={newCreative}
                  onChange={(e) => setNewCreative(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddCreative()}
                />
                <Button onClick={handleAddCreative} variant="outlined">
                  Add
                </Button>
              </Box>
              {formData.creatives.length > 0 && (
                <List dense>
                  {formData.creatives.map((creative, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={creative} />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => removeCreative(index)}>
                          <Remove />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid> */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                <Photo sx={{ mr: 1, verticalAlign: "middle" }} />
                Creative Assets
              </Typography>
              
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Creative Title"
                    value={newCreative.title}
                    onChange={handleCreativeInputChange("title")}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Creative URL"
                    value={newCreative.url}
                    onChange={handleCreativeInputChange("url")}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Type"
                    value={newCreative.type}
                    onChange={handleCreativeInputChange("type")}
                  >
                    <MenuItem value="Image">Image</MenuItem>
                    <MenuItem value="Banner">Banner</MenuItem>
                    <MenuItem value="Poster">Poster</MenuItem>
                    <MenuItem value="Flyer">Flyer</MenuItem>
                    <MenuItem value="Social Media">Social Media</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
              
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Button onClick={handleAddCreative} variant="outlined" size="small">
                  Add Creative
                </Button>
              </Box>
              
              {formData.creatives.length > 0 && (
                <List dense>
                  {formData.creatives.map((creative, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={creative.title}
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
                        <IconButton edge="end" onClick={() => removeCreative(index)} size="small">
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>

            {/* Video IDs */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                <VideoLibrary sx={{ mr: 1, verticalAlign: "middle" }} />
                Video IDs
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="YouTube Video ID or URL"
                  value={newVideoId}
                  onChange={(e) => setNewVideoId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddVideoId()}
                  helperText="Enter YouTube video ID (e.g., dQw4w9WgXcQ) or full URL"
                />
                <Button onClick={handleAddVideoId} variant="outlined">
                  Add
                </Button>
              </Box>
              {formData.videoIds.length > 0 && (
                <List dense>
                  {formData.videoIds.map((videoId, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={videoId} />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => removeVideoId(index)}>
                          <Remove />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProperty ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity as any}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}


