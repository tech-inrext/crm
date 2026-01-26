//app/visiting-card/[name]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  IconButton,
  Grid,
  Divider,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@/components/ui/Component";
import {
  Email,
  Phone,
  WhatsApp,
  Language,
  BusinessCenter,
} from "@mui/icons-material";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

interface User {
  name: string;
  designation?: string;
  branch?: string;
  photo?: string;
  email?: string;
  phone?: string;
  altPhone?: string;
  specialization?: string;
  slabPercentage?: string | number;
}

interface EmployeeResponse {
  success: boolean;
  data: User[];
}

const VisitingCardPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const name = decodeURIComponent(params.name?.toString() || "");

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get<EmployeeResponse>(
          "/api/v0/employee/getAllEmployeeList",
          {
            params: { search: name },
          },
        );

        if (response.data.success && response.data.data.length > 0) {
          const exactMatch = response.data.data.find(
            (emp) => emp.name.toLowerCase() === name.toLowerCase(),
          );

          if (exactMatch) {
            setUser(exactMatch);
          } else {
            setUser(response.data.data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (name) {
      fetchUserData();
    }
  }, [name]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const whatsappNumber = user?.altPhone || user?.phone;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
        py: { xs: 2, md: 4 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="lg">
        <Grid container justifyContent="center">
          <Grid item xs={12} md={6} lg={4}>
            <Paper
              elevation={8}
              sx={{
                overflow: "hidden",
              }}
            >
              <Box id="visiting-card">
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 360,
                    aspectRatio: "9 / 16",
                    mx: "auto",
                    position: "relative",
                    overflow: "hidden",
                    bgcolor: "#1a1a1a",
                    color: "white",
                  }}
                >
                  {/* Background Image with Overlay */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      backgroundImage: "url(/digital-visiting-card_BG.jpg)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background:
                          "linear-gradient(180deg, rgba(28, 79, 163, 0.8) 0%, rgba(11, 44, 102, 0.85) 40%, rgba(0, 0, 0, 0.95) 100%)",
                      },
                    }}
                  />

                  {/* Content Container */}
                  <Box
                    sx={{
                      position: "relative",
                      zIndex: 1,
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                    }}
                  >
                    {/* Logo */}
                    <Box
                      sx={{
                        pt: 2.5,
                        px: 3,
                        textAlign: "center",
                        zIndex: 2,
                      }}
                    >
                      <img
                        src="/inrext white logo png.png"
                        alt="Inrext Logo"
                        style={{ height: 28 }}
                      />
                    </Box>

                    {/* Inverted Triangle Section with Profile */}
                    <Box
                      sx={{
                        position: "relative",
                        height: 480,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        pt: 4,
                      }}
                    >
                      {/* Inverted Triangle Background */}
                      <Box
                        sx={{
                          position: "absolute",
                          left: "50%",
                          transform: "translate(-50%, -50%)",

                          // OUTER TRIANGLE (BORDER)
                          width: 0,
                          height: 0,
                          borderLeft: "450px solid transparent",
                          borderRight: "450px solid transparent",
                          borderTop: "520px solid rgba(28, 79, 163, 0.35)",
                          filter: "drop-shadow(0 10px 42px rgba(0,0,0,0.65))",

                          "&::after": {
                            content: '""',
                            position: "absolute",
                            left: "-440px",
                            top: "-510px",

                            // INNER TRIANGLE
                            width: 0,
                            height: 0,
                            borderLeft: "440px solid transparent",
                            borderRight: "440px solid transparent",
                            borderTop: "510px solid rgba(28, 79, 163, 0.35)",
                          },
                        }}
                      />

                      {/* Profile Image */}
                      <Box
                        sx={{
                          position: "relative",
                          zIndex: 2,
                          borderRadius: "50%",
                          border: "1px solid #ffffff",
                          padding: "5px",
                        }}
                      >
                        <Avatar
                          src={user?.photo || ""}
                          sx={{
                            width: 120,
                            height: 120,
                            "& img": {
                              objectFit: "cover",
                              objectPosition: "top",
                            },
                          }}
                        >
                          {!user?.photo && user?.name?.[0]}
                        </Avatar>
                      </Box>

                      {/* Name */}
                      <Typography
                        sx={{
                          position: "relative",
                          zIndex: 2,
                          mt: 2,
                          fontSize: "1rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          px: 2,
                          textAlign: "center",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {user?.name
                          ?.split(" ")
                          .map((word, i) => (i === 2 ? `\n${word}` : word))
                          .join(" ")}
                      </Typography>
                    </Box>

                    {/* Designation Section */}
                    <Box
                      sx={{
                        textAlign: "center",
                        px: 3,
                        mt: "-11rem",
                      }}
                    >
                      {/* Designation with Briefcase Icon */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <BusinessCenter
                          sx={{
                            fontSize: "1.1rem",
                            opacity: 0.9,
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: "1.05rem",
                            fontWeight: 400,
                          }}
                        >
                          {user?.designation}
                        </Typography>
                      </Box>

                      {/* Horizontal Divider */}
                      <Divider
                        sx={{
                          bgcolor: "rgba(255,255,255,0.35)",
                          width: "65%",
                          mx: "auto",
                          height: "1px",
                          my: 0.8,
                        }}
                      />

                      {/* Specialization with Briefcase Icon */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <BusinessCenter
                          sx={{
                            fontSize: "1.1rem",
                            opacity: 0.9,
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: "1.05rem",
                            fontWeight: 400,
                          }}
                        >
                          {user?.specialization}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Contact Icons */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 2.5,
                        mt: 4,
                        px: 3,
                      }}
                    >
                      <IconButton
                        component="a"
                        href={`tel:${user?.phone}`}
                        sx={{
                          bgcolor: "white",
                          color: "#333",
                          width: 58,
                          height: 58,
                          "&:hover": {
                            bgcolor: "rgba(255, 255, 255, 0.9)",
                            transform: "translateY(-3px)",
                          },
                          transition: "all 0.3s ease",
                          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.4)",
                        }}
                      >
                        <Phone sx={{ fontSize: "1.5rem" }} />
                      </IconButton>

                      <IconButton
                        component="a"
                        href={`https://wa.me/${whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          bgcolor: "white",
                          color: "#333",
                          width: 58,
                          height: 58,
                          "&:hover": {
                            bgcolor: "rgba(255, 255, 255, 0.9)",
                            transform: "translateY(-3px)",
                          },
                          transition: "all 0.3s ease",
                          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.4)",
                        }}
                      >
                        <WhatsApp sx={{ fontSize: "1.5rem" }} />
                      </IconButton>

                      <IconButton
                        component="a"
                        href={`mailto:${user?.email}`}
                        sx={{
                          bgcolor: "white",
                          color: "#333",
                          width: 58,
                          height: 58,
                          "&:hover": {
                            bgcolor: "rgba(255, 255, 255, 0.9)",
                            transform: "translateY(-3px)",
                          },
                          transition: "all 0.3s ease",
                          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.4)",
                        }}
                      >
                        <Email sx={{ fontSize: "1.5rem" }} />
                      </IconButton>

                      <IconButton
                        component="a"
                        href="https://www.inrext.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          bgcolor: "white",
                          color: "#333",
                          width: 58,
                          height: 58,
                          "&:hover": {
                            bgcolor: "rgba(255, 255, 255, 0.9)",
                            transform: "translateY(-3px)",
                          },
                          transition: "all 0.3s ease",
                          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.4)",
                        }}
                      >
                        <Language sx={{ fontSize: "1.5rem" }} />
                      </IconButton>
                    </Box>

                    {/* Address */}
                    <Box
                      sx={{
                        mt: "auto",
                        pb: 3.5,
                        px: 3,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          opacity: 0.9,
                          fontSize: "0.875rem",
                          lineHeight: 1.7,
                          letterSpacing: "0.02em",
                        }}
                      >
                        3rd Floor, D4, Block-D, Sector 10,
                        <br />
                        Noida, Uttar Pradesh-201301
                      </Typography>
                    </Box>
                    
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default VisitingCardPage;
