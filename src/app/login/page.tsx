"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  useTheme,
  IconButton,
  InputAdornment,
  Link,
} from "@mui/material";
import ForgotPasswordDialog from "../../components/ui/ForgotPasswordDialog";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

interface LoginForm {
  email: string;
  password: string;
}

const LandingPage: React.FC = () => {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");

  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const theme = useTheme();
  const router = useRouter();
  const { login: authLogin, user } = useAuth();

  const handleInputChange =
    (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (error) setError(null);
    };
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  function validateEmail(resetEmail) {
    const isValidEmail =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(resetEmail);
    return isValidEmail;
  }

  const handleResetPassword = async (e) => {
    if (!resetEmail || !newPassword || !oldPassword) {
      setResetError("Please fill in all fields");
      return;
    }

    if (!validateEmail(resetEmail)) {
      return setResetError("Kindly Enter Valid Email !!!");
    }

    setResetLoading(true);
    setResetError(null);

    try {
      const response = await axios.post("/api/v0/employee/resetPassword", {
        email: resetEmail,
        newPassword: newPassword,
        oldPassword: oldPassword,
      });

      if (response.data.success) {
        setResetSuccess(true);
        setResetError(null);
        setResetEmail("");
        setNewPassword("");
        setOldPassword("");
        setTimeout(() => {
          setResetDialogOpen(false);
          setResetSuccess(false);
        }, 2000);
      }
    } catch (error: unknown) {
      console.error("Password reset failed:", error);

      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };

      if (axiosError.response?.status === 404) {
        setResetError("Invalid Email or Old Password");
      } else if (axiosError.response?.status === 401) {
        setResetError("Invalid Email or Old Password");
      } else {
        setResetError("Password reset failed. Please try again.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetDialogClose = () => {
    setResetDialogOpen(false);
    setResetEmail("");
    setNewPassword("");
    setOldPassword("");
    setResetError(null);
    setResetSuccess(false);
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await authLogin(form.email, form.password);
    } catch (error: unknown) {
      console.error("Login failed:", error);

      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (
        axiosError.response?.status === 404 ||
        axiosError.response?.status === 401
      ) {
        setError("Invalid Credentials.");
      } else if (axiosError.response?.status === 403) {
        // const message = axiosError.response.data?.message || "Access denied";
        setError(
          "Please create a new password to continue with your first login. Click on 'Forgot Password' to reset it now."
        );
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #0f1419 0%, #1a202c 100%)"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        flexDirection: "column",
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 4 },
      }}
    >
      {" "}
      {/* Header */}
      <Box
        sx={{
          mb: { xs: 3, sm: 4 },
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Image
          src="/inrext.png"
          alt="Inrext Logo"
          width={40}
          height={40}
          style={{
            objectFit: "contain",
          }}
        />
        <Typography
          variant="h4"
          sx={{
            color: "white",
            fontWeight: 700,
            fontSize: { xs: "1.75rem", sm: "2.125rem" },
          }}
        >
          Inrext
        </Typography>
      </Box>
      {/* Main Content */}
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: { xs: 0, sm: 2 },
        }}
      >
        {" "}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 3, md: 6 },
            alignItems: "center",
            justifyContent: "center",
            minHeight: { md: "70vh" },
          }}
        >
          {" "}
          {/* Features Section - Mobile First */}
          <Box
            sx={{
              flex: { md: 1 },
              mb: { xs: 4, md: 0 },
              maxWidth: { xs: "100%", md: "500px" },
              width: "100%",
            }}
          >
            <Box>
              <Typography
                variant="h3"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  mb: 2,
                  textAlign: { xs: "center", md: "left" },
                  fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
                }}
              >
                Welcome to Inrext
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "rgba(255, 255, 255, 0.9)",
                  mb: 4,
                  textAlign: { xs: "center", md: "left" },
                  fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" },
                  lineHeight: 1.6,
                }}
              >
                Property management made easy!
              </Typography>
            </Box>
          </Box>
          {/* Login Section */}
          <Box
            sx={{
              flex: 1,
              width: "100%",
              maxWidth: { xs: "100%", md: "400px" },
            }}
          >
            <Card
              sx={{
                borderRadius: { xs: 3, sm: 4 },
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                bgcolor: theme.palette.mode === "dark" ? "#1e2328" : "#ffffff",
                mx: { xs: 0, sm: 1 },
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                {/* Login Header */}
                <Box sx={{ textAlign: "center", mb: { xs: 3, sm: 4 } }}>
                  {" "}
                  <Box
                    sx={{
                      width: { xs: 60, sm: 80 },
                      height: { xs: 60, sm: 80 },
                      borderRadius: 2,
                      bgcolor: "white",
                      border: "5px solid",
                      borderColor: theme.palette.primary.main,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                    }}
                  >
                    <Image
                      src="/inrext.png"
                      alt="Inrext Logo"
                      width={40}
                      height={40}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                </Box>
                {/* Error Alert */}
                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      mb: 3,
                      borderRadius: 2,
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    {error}
                  </Alert>
                )}
                {/* Login Form */}
                <Box component="form" onSubmit={handleLogin}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={form.email}
                    onChange={handleInputChange("email")}
                    required
                    sx={{ mb: { xs: 2, sm: 3 } }}
                    variant="outlined"
                    autoComplete="email"
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleInputChange("password")}
                    required
                    sx={{ mb: { xs: 3, sm: 4 } }}
                    variant="outlined"
                    autoComplete="current-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePassword}
                            onMouseDown={(e) => e.preventDefault()}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: { xs: 1.25, sm: 1.5 },
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: "none",
                      fontSize: { xs: "1rem", sm: "1.1rem" },
                      background:
                        "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                      "&:hover": {
                        background:
                          "linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)",
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  {/* Forgot Password Link */}
                  <Box sx={{ textAlign: "center", mt: 2 }}>
                    <Link
                      component="button"
                      type="button"
                      onClick={() => {
                        setResetDialogOpen(true);
                        setError(null); // Clear login error
                        setForm({ email: "", password: "" }); // Clear login inputs
                      }}
                      sx={{
                        color: theme.palette.primary.main,
                        textDecoration: "none",
                        fontSize: { xs: "0.875rem", sm: "0.9rem" },
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Forgot Password?
                    </Link>
                  </Box>
                </Box>{" "}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
      {/* Footer */}
      <Box sx={{ mt: { xs: 4, sm: 6 }, textAlign: "center" }}>
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
          }}
        >
          © 2024 Inrext. All rights reserved.
        </Typography>
      </Box>
      {/* Forgot Password Dialog (OTP Flow) */}
      <ForgotPasswordDialog
        open={resetDialogOpen}
        onClose={handleResetDialogClose}
      />
    </Box>
  );
};

export default LandingPage;
