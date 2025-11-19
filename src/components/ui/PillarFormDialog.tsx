import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  FormHelperText,
  SelectChangeEvent,
  CircularProgress,
  Chip,
  Autocomplete,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { Close, CloudUpload } from "@mui/icons-material";
import { Pillar, PillarFormData } from "@/types/pillar";
import { useFileUpload } from "@/hooks/useFileUpload";
import axios from "axios";

interface Project {
  _id: string;
  projectName: string;
  builderName: string;
  location: string;
  propertyType: string;
}

interface PillarFormDialogProps {
  open: boolean;
  pillar?: Pillar | null;
  onClose: () => void;
  onSave: (pillarData: PillarFormData) => Promise<void>;
  loading?: boolean;
}

const CATEGORIES = [
  { value: "the-visionaries", label: "The Visionaries" },
  { value: "the-strategic-force", label: "The Strategic Force" },
  { value: "growth-navigators", label: "Growth Navigators" },
  { value: "the-powerhouse-team", label: "The Powerhouse Team" },
];

const DEFAULT_PILLAR_DATA: PillarFormData = {
  name: "",
  category: "",
  profileImages: [],
  designation: "",
  about: "",
  experience: "",
  projects: [],
  expertise: [],
  skills: [],
};

const PillarFormDialog: React.FC<PillarFormDialogProps> = ({ 
  open, 
  pillar = null, 
  onClose, 
  onSave,
  loading = false 
}) => {
  const [formData, setFormData] = useState<PillarFormData>(DEFAULT_PILLAR_DATA);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [expertiseInput, setExpertiseInput] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const { uploadFile, uploading: fileUploading } = useFileUpload();

  useEffect(() => {
    if (open) {
      if (pillar) {
        setFormData({
          name: pillar.name || "",
          category: pillar.category || "",
          profileImages: pillar.profileImages || [],
          designation: pillar.designation || "",
          about: pillar.about || "",
          experience: pillar.experience || "",
          projects: pillar.projects.map(p => p._id) || [],
          expertise: pillar.expertise || [],
          skills: pillar.skills || [],
        });
      } else {
        setFormData(DEFAULT_PILLAR_DATA);
      }
      setErrors({});
      setExpertiseInput("");
      setSkillsInput("");
      
      // Load projects when dialog opens
      loadProjects();
    }
  }, [open, pillar]);

  const loadProjects = async () => {
    try {
      setProjectsLoading(true);
      const response = await axios.get("/api/v0/property", {
        params: {
          parentOnly: "true",
          limit: 100,
          activeOnly: "true"
        }
      });
      
      if (response.data.success) {
        setProjects(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleChange = (field: keyof PillarFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ): void => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleProjectsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      projects: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>, 
    type: "primary" | "secondary"
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileUrl = await uploadFile(file);
      
      setFormData(prev => {
        const existingImages = prev.profileImages.filter(img => img.type !== type);
        return {
          ...prev,
          profileImages: [
            ...existingImages,
            {
              url: fileUrl,
              type: type,
              uploadedAt: new Date().toISOString()
            }
          ]
        };
      });
      
      if (errors.profileImages) {
        setErrors(prev => ({ ...prev, profileImages: "" }));
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, profileImages: 'Failed to upload file' }));
    }
  };

  const handleAddExpertise = (): void => {
    if (expertiseInput.trim() && !formData.expertise.includes(expertiseInput.trim())) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, expertiseInput.trim()]
      }));
      setExpertiseInput("");
    }
  };

  const handleRemoveExpertise = (expertiseToRemove: string): void => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter(exp => exp !== expertiseToRemove)
    }));
  };

  const handleAddSkill = (): void => {
    if (skillsInput.trim() && !formData.skills.includes(skillsInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillsInput.trim()]
      }));
      setSkillsInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string): void => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (formData.profileImages.length === 0) {
      newErrors.profileImages = "At least one profile image is required";
    }

    if (!formData.designation.trim()) {
      newErrors.designation = "Designation is required";
    }

    if (!formData.about.trim()) {
      newErrors.about = "About section is required";
    }

    if (!formData.experience.trim()) {
      newErrors.experience = "Experience is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    await onSave(formData);
  };

  const isUploading = fileUploading || loading;

  const primaryImage = formData.profileImages.find(img => img.type === 'primary');
  const secondaryImage = formData.profileImages.find(img => img.type === 'secondary');

  // Get selected project details for display
  const selectedProjects = projects.filter(project => 
    formData.projects.includes(project._id)
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            {pillar ? "Edit Pillar" : "Add New Pillar"}
          </Typography>
          <Button onClick={onClose} disabled={isUploading}>
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
              Basic Information
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Name *"
              value={formData.name}
              onChange={handleChange("name")}
              error={!!errors.name}
              helperText={errors.name}
              disabled={isUploading}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth error={!!errors.category} disabled={isUploading}>
              <InputLabel>Category *</InputLabel>
              <Select
                value={formData.category}
                label="Category *"
                onChange={handleChange("category")}
              >
                {CATEGORIES.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <FormHelperText>{errors.category}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Designation *"
              value={formData.designation}
              onChange={handleChange("designation")}
              error={!!errors.designation}
              helperText={errors.designation}
              disabled={isUploading}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="About *"
              multiline
              rows={3}
              value={formData.about}
              onChange={handleChange("about")}
              error={!!errors.about}
              helperText={errors.about || "Brief introduction about the pillar"}
              disabled={isUploading}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Experience *"
              multiline
              rows={2}
              value={formData.experience}
              onChange={handleChange("experience")}
              error={!!errors.experience}
              helperText={errors.experience || "Professional experience and background"}
              disabled={isUploading}
            />
          </Grid>

          {/* Profile Images */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main", mt: 2 }}>
              Profile Images
            </Typography>
            {errors.profileImages && (
              <FormHelperText error>{errors.profileImages}</FormHelperText>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Primary Image *
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                disabled={isUploading}
                fullWidth
                sx={{ height: '56px', mb: 1 }}
              >
                {primaryImage ? "Change Primary Image" : "Upload Primary Image"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'primary')}
                />
              </Button>
              {primaryImage && (
                <Typography variant="caption" color="success.main">
                  ✓ Primary image uploaded
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Secondary Image
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                disabled={isUploading}
                fullWidth
                sx={{ height: '56px', mb: 1 }}
              >
                {secondaryImage ? "Change Secondary Image" : "Upload Secondary Image"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'secondary')}
                />
              </Button>
              {secondaryImage && (
                <Typography variant="caption" color="success.main">
                  ✓ Secondary image uploaded
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Projects Selection */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main", mt: 2 }}>
              Associated Projects
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Select Projects</InputLabel>
              <Select
                multiple
                value={formData.projects}
                onChange={handleProjectsChange}
                label="Select Projects"
                renderValue={(selected) => {
                  const selectedProjectNames = selected.map(projectId => {
                    const project = projects.find(p => p._id === projectId);
                    return project ? project.projectName : '';
                  }).filter(name => name);
                  
                  return selectedProjectNames.join(', ');
                }}
                disabled={isUploading || projectsLoading}
              >
                {projectsLoading ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      Loading projects...
                    </Typography>
                  </MenuItem>
                ) : (
                  projects.map((project) => (
                    <MenuItem key={project._id} value={project._id}>
                      <Checkbox checked={formData.projects.indexOf(project._id) > -1} />
                      <ListItemText 
                        primary={project.projectName}
                        secondary={`${project.builderName} - ${project.location}`}
                      />
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            <FormHelperText>
              Select projects associated with this pillar
            </FormHelperText>
            
            {/* Selected Projects Preview */}
            {selectedProjects.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Selected Projects:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedProjects.map((project) => (
                    <Chip
                      key={project._id}
                      label={project.projectName}
                      size="small"
                      variant="outlined"
                      onDelete={() => {
                        setFormData(prev => ({
                          ...prev,
                          projects: prev.projects.filter(id => id !== project._id)
                        }));
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Grid>

          {/* Expertise */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main", mt: 2 }}>
              Expertise
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  placeholder="Add expertise"
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddExpertise();
                    }
                  }}
                  disabled={isUploading}
                  sx={{ flex: 1 }}
                />
                <Button 
                  variant="outlined" 
                  onClick={handleAddExpertise}
                  disabled={isUploading || !expertiseInput.trim()}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formData.expertise.map((exp, index) => (
                  <Chip
                    key={index}
                    label={exp}
                    onDelete={() => handleRemoveExpertise(exp)}
                    color="primary"
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Skills */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
              Skills
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  placeholder="Add skill"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  disabled={isUploading}
                  sx={{ flex: 1 }}
                />
                <Button 
                  variant="outlined" 
                  onClick={handleAddSkill}
                  disabled={isUploading || !skillsInput.trim()}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formData.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => handleRemoveSkill(skill)}
                    color="secondary"
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={isUploading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isUploading}
          sx={{ minWidth: 100 }}
        >
          {isUploading ? (
            <CircularProgress size={24} />
          ) : pillar ? (
            "Update Pillar"
          ) : (
            "Create Pillar"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PillarFormDialog;