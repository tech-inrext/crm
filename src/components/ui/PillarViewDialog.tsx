import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Avatar,
  Grid,
  Divider,
  Paper,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { Pillar } from "@/types/pillar";

interface PillarViewDialogProps {
  open: boolean;
  pillar: Pillar | null;
  onClose: () => void;
}

const PillarViewDialog: React.FC<PillarViewDialogProps> = ({
  open,
  pillar,
  onClose,
}) => {
  if (!pillar) return null;

  const primaryImage = pillar.profileImages.find(img => img.type === 'primary');
  const secondaryImage = pillar.profileImages.find(img => img.type === 'secondary');

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
            Pillar Details
          </Typography>
          <Button onClick={onClose} color="inherit">
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Profile Section */}
          <Grid size={{ xs: 12 }}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                borderRadius: 2,
                background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
              }}
            >
              <Box sx={{ display: 'flex', flexWrap:'wrap', alignItems: 'center', gap: 3 }}>
                <Box sx={{ display: 'flex', position: 'relative' }}>
                    {secondaryImage && (
                    <Avatar
                      src={secondaryImage.url}
                      alt={pillar.name}
                      sx={{ width: { xs: "15.2rem", sm: 200 }, height: 200, borderRadius: 2 }}
                    />
                  )}
                  {primaryImage && (
                    <Avatar
                      src={primaryImage.url}
                      alt={pillar.name}
                      sx={{ width: 70, height: 70, position: 'absolute', border: '3px solid white', bottom: 0, right:5, }}
                    />
                  )}
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {pillar.name}
                  </Typography>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {pillar.designation}
                  </Typography>
                  <Chip 
                    label={getCategoryLabel(pillar.category)} 
                    color="primary" 
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* About Section */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main", fontWeight: 'bold' }}>
              About
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                {pillar.about}
              </Typography>
            </Paper>
          </Grid>

          {/* Experience Section */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main", fontWeight: 'bold' }}>
              Experience
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.6, fontStyle: 'italic' }}>
                {pillar.experience}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>

          {/* Expertise & Skills */}
          <Grid size={{ xs: 12 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: "primary.main", fontWeight: "bold" }}
            >
              Expertise
            </Typography>

            <Box>
              {pillar.expertise.map((exp, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      bgcolor: 'primary.main',
                      borderRadius: '50%',
                      mr: 1,
                      flexShrink: 0
                    }}
                  />
                  <Typography component="span" variant="body1">
                    {exp}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main", fontWeight: 'bold' }}>
              Skills
            </Typography>
            <Box>
              {pillar.skills.map((skill, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      bgcolor: 'primary.main',
                      borderRadius: '50%',
                      mr: 1,
                      flexShrink: 0
                    }}
                  />
                  <Typography component="span" variant="body1">
                    {skill}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Projects Section */}
          <Grid size={{ xs: 12 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: "primary.main", fontWeight: 'bold' }}
            >
              Projects
            </Typography>

            {pillar.projects && pillar.projects.length > 0 ? (
              <Grid container spacing={2}>
                {pillar.projects.map((project) => (
                  <Grid size={{ xs: 12, md: 6 }} key={project._id}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        height: '100%',
                        '&:hover': {
                          boxShadow: 2,
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      {project.images && project.images.length > 0 ? (
                        <Box
                          component="img"
                          src={project.images[0].url}
                          alt={project.projectName}
                          sx={{
                            width: "100%",
                            height: 180,
                            objectFit: "cover",
                            borderRadius: 2,
                            mb: 2
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            height: 180,
                            bgcolor: 'grey.100',
                            borderRadius: 2,
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            No Image
                          </Typography>
                        </Box>
                      )}

                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {project.projectName}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {project.builderName}
                      </Typography>

                      <Typography variant="caption" color="text.secondary" display="block">
                        {project.location} • {project.propertyType}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No projects associated with this pillar
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          sx={{
            background: "#1976d2",
            '&:hover': {
              background: "#1976d2",
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PillarViewDialog;

