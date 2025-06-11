"use client";

import React, { useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
} from "@mui/material";
import {
  Login as LoginIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const theme = useTheme();
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const handleInputChange =
    (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (error) setError(null); // Clear error when user starts typing
    };
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleResetPassword = async () => {
    if (!resetEmail || !newPassword) {
      setResetError("Please fill in all fields");
      return;
    }

    setResetLoading(true);
    setResetError(null);

    try {
      const response = await axios.post("/api/v0/employee/resetPassword", {
        email: resetEmail,
        newPassword: newPassword,
      });

      if (response.data.success) {
        setResetSuccess(true);
        setResetError(null);
        // Clear form
        setResetEmail("");
        setNewPassword("");
        // Close dialog after 2 seconds
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
        setResetError("No account found with this email address");
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
      // Use AuthContext login method
      await authLogin(form.email, form.password);
      // Login successful, redirect to dashboard
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Login failed:", error);

      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (
        axiosError.response?.status === 404 ||
        axiosError.response?.status === 401
      ) {
        setError("Invalid email or password");
      } else if (axiosError.response?.status === 403) {
        const message = axiosError.response.data?.message || "Access denied";
        setError(message);
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
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 4,
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 20px 40px rgba(0,0,0,0.3)"
                : "0 20px 40px rgba(0,0,0,0.1)",
            bgcolor: theme.palette.mode === "dark" ? "#1e2328" : "#ffffff",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {/* Logo/Title Section */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: theme.palette.primary.main,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <LoginIcon sx={{ fontSize: 40, color: "white" }} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.mode === "dark" ? "#ffffff" : "#1a202c",
                  mb: 1,
                }}
              >
                Welcome Back
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.mode === "dark" ? "#a0aec0" : "#4a5568",
                }}
              >
                Sign in to access your CRM dashboard
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={form.email}
                onChange={handleInputChange("email")}
                required
                sx={{ mb: 3 }}
                variant="outlined"
                autoComplete="email"
                autoFocus
              />{" "}
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleInputChange("password")}
                required
                sx={{ mb: 4 }}
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
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "1.1rem",
                  background:
                    "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)",
                  },
                }}
              >
                {" "}
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Sign In"
                )}{" "}
              </Button>
              {/* Forgot Password Link */}
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Link
                  component="button"
                  type="button"
                  onClick={() => setResetDialogOpen(true)}
                  sx={{
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Forgot Password?
                </Link>
              </Box>
            </Box>

            {/* Reset Password Dialog */}
            <Dialog
              open={resetDialogOpen}
              onClose={handleResetDialogClose}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Reset Password</DialogTitle>
              <DialogContent>
                {resetSuccess ? (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Password reset successfully! You can now login with your new
                    password.
                  </Alert>
                ) : (
                  <>
                    {resetError && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {resetError}
                      </Alert>
                    )}
                    <Typography sx={{ mb: 2, color: "text.secondary" }}>
                      Enter your email address and a new password to reset your
                      account.
                    </Typography>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      sx={{ mb: 2 }}
                      autoFocus
                    />
                    <TextField
                      fullWidth
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                  </>
                )}
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleResetDialogClose}
                  disabled={resetLoading}
                >
                  Cancel
                </Button>
                {!resetSuccess && (
                  <Button
                    onClick={handleResetPassword}
                    variant="contained"
                    disabled={resetLoading || !resetEmail || !newPassword}
                  >
                    {resetLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                )}
              </DialogActions>
            </Dialog>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;
