// components/ui/ShareMenu.tsx - Updated version with _id
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { useRouter } from "next/navigation";

import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LanguageIcon from "@mui/icons-material/Language";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import { useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

interface ShareMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  userId?: string;
  userName?: string;
  userData?: {
    phone?: string;
    email?: string;
    altPhone?: string;
    photo?: string;
    designation?: string;
    specialization?: string;
    branch?: string;
  };
}

// Phone formatter utility function
const formatPhoneForWhatsApp = (phone?: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Handle Indian numbers (10 digits)
  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }
  
  // Handle numbers with country code but without + (12 digits for India)
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return `+${digitsOnly}`;
  }
  
  // If already has +, return as is
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // Default: add + for international format
  return `+${digitsOnly}`;
};

// Format for display
const formatPhoneForDisplay = (phone?: string): string => {
  if (!phone) return '';
  const formatted = formatPhoneForWhatsApp(phone);
  
  // Format for display: +91 XXXXX XXXXX
  if (formatted.startsWith('+91') && formatted.length === 13) {
    return `${formatted.substring(0, 3)} ${formatted.substring(3, 8)} ${formatted.substring(8)}`;
  }
  
  return phone;
};

const ShareMenu: React.FC<ShareMenuProps> = ({
  anchorEl,
  open,
  onClose,
  userId,
  userName,
  userData = {},
}) => {
  const router = useRouter();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info">("success");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { phone, email, altPhone, photo, designation, specialization, branch } = userData;

  // Use altPhone if available, otherwise phone
  const whatsappNumber = altPhone || phone;
  // Format for WhatsApp
  const formattedWhatsAppNumber = formatPhoneForWhatsApp(whatsappNumber);
  // Format for display
  const displayPhone = formatPhoneForDisplay(phone);
  const displayAltPhone = formatPhoneForDisplay(altPhone);

  // Generate visiting card URL using userId (MongoDB _id)
  const getVisitingCardUrl = () => {
    if (!userId) return "https://inrext.com";
    
    // Use userId for the URL parameter
    return `https://inrext.com/visiting-card/${userId}`;
  };

  const handleCopyLink = async () => {
    try {
      const url = getVisitingCardUrl();
      
      await navigator.clipboard.writeText(url);
      
      setSnackbarMessage("Link copied to clipboard!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      onClose();
    } catch (err) {
      console.error("Failed to copy link:", err);
      setSnackbarMessage("Failed to copy link");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handlePreviewVisitingCard = () => {
    if (userId) {
      // Use userId to navigate to visiting card page
      const url = getVisitingCardUrl();
      window.open(url, '_blank');
      onClose();
    } else {
      setSnackbarMessage("User ID is required");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleShareWhatsApp = () => {
    if (userId && userName) {
      const url = getVisitingCardUrl();
      const message = `Check out ${userName}'s digital visiting card: ${url}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      onClose();
    }
  };

  const handleShareFacebook = () => {
    if (userId) {
      const url = getVisitingCardUrl();
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      window.open(facebookUrl, '_blank');
      onClose();
    }
  };

  const handlePhoneCall = () => {
    if (phone) {
      window.open(`tel:${phone}`, '_blank');
      onClose();
    }
  };

  const handleWhatsAppDirect = () => {
    if (whatsappNumber) {
      let cleanedNumber = whatsappNumber.replace(/[^0-9]/g, "");

      // Auto prepend 91 if not included
      if (!cleanedNumber.startsWith("91")) {
        cleanedNumber = "91" + cleanedNumber;
      }

      window.open(`https://wa.me/${cleanedNumber}`, '_blank');
      onClose();
    } else {
      setSnackbarMessage("No valid WhatsApp number available");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleEmail = () => {
    if (email) {
      window.open(`mailto:${email}`, '_blank');
      onClose();
    }
  };

  const handleWebsite = () => {
    window.open("https://www.inrext.com", '_blank');
    onClose();
  };

  const handleDownloadPDF = async () => {
    try {
      if (!userId) {
        setSnackbarMessage("User ID is required for PDF generation");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
      
      setIsGeneratingPDF(true);
      
      // Show loading message
      setSnackbarMessage("Generating PDF... Please wait");
      setSnackbarSeverity("info");
      setSnackbarOpen(true);
      
      // Prepare user data with userId
      const pdfUserData = {
        id: userId, // Add userId for backend fetching
        name: userName || "User",
        phone: phone || "",
        email: email || "",
        altPhone: altPhone || "",
        photo: photo || "",
        designation: designation || "",
        specialization: specialization || "",
        branch: branch || "",
      };

      // Dynamically import the PDF generation function
      const { generateVisitingCardPDF } = await import('@/utils/pdfGenerator');
      
      // Call the PDF generation function with userId
      await generateVisitingCardPDF(pdfUserData);
      
      setSnackbarMessage("PDF downloaded successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      
      onClose();
      
    } catch (error) {
      console.error("❌ Failed to generate PDF:", error);
      setSnackbarMessage("Failed to generate PDF. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 220, maxWidth: 300 } }}
      >
        <MenuItem 
          onClick={handlePreviewVisitingCard}
          disabled={!userId}
          sx={{ 
            opacity: userId ? 1 : 0.6,
            cursor: userId ? "pointer" : "default"
          }}
        >
          <VisibilityIcon sx={{ mr: 1, color: "#2196F3" }} />
          Preview Visiting Card
        </MenuItem>

        <Divider />

        <MenuItem 
          onClick={handleCopyLink}
          disabled={!userId}
          sx={{ 
            opacity: userId ? 1 : 0.6,
            cursor: userId ? "pointer" : "default"
          }}
        >
          <ContentCopyIcon sx={{ mr: 1, color: "#757575" }} />
          Copy Link
        </MenuItem>

        <Divider />

        <MenuItem 
          onClick={handleShareWhatsApp}
          disabled={!userId}
          sx={{ 
            opacity: userId ? 1 : 0.6,
            cursor: userId ? "pointer" : "default"
          }}
        >
          <WhatsAppIcon sx={{ mr: 1, color: "#25D366" }} />
          Share on WhatsApp
        </MenuItem>

        <MenuItem 
          onClick={handleShareFacebook}
          disabled={!userId}
          sx={{ 
            opacity: userId ? 1 : 0.6,
            cursor: userId ? "pointer" : "default"
          }}
        >
          <ShareIcon sx={{ mr: 1, color: "#1877F2" }} />
          Share on Facebook
        </MenuItem>

        <Divider />

        <MenuItem 
          onClick={handlePhoneCall} 
          disabled={!phone}
          sx={{ 
            opacity: phone ? 1 : 0.6,
            cursor: phone ? "pointer" : "default"
          }}
        >
          <PhoneIcon sx={{ mr: 1, color: phone ? "#1976d2" : "#cccccc" }} />
          {phone ? "Call" : "No Phone"}
        </MenuItem>

        <MenuItem 
          onClick={handleWhatsAppDirect} 
          disabled={!whatsappNumber}
          sx={{ 
            opacity: whatsappNumber ? 1 : 0.6,
            cursor: whatsappNumber ? "pointer" : "default"
          }}
        >
          <WhatsAppIcon sx={{ mr: 1, color: whatsappNumber ? "#25D366" : "#cccccc" }} />
          {whatsappNumber ? "WhatsApp Direct" : "No WhatsApp"}
        </MenuItem>

        <MenuItem 
          onClick={handleEmail} 
          disabled={!email}
          sx={{ 
            opacity: email ? 1 : 0.6,
            cursor: email ? "pointer" : "default"
          }}
        >
          <EmailIcon sx={{ mr: 1, color: email ? "#D44638" : "#cccccc" }} />
          {email ? "Email" : "No Email"}
        </MenuItem>

        <MenuItem onClick={handleWebsite}>
          <LanguageIcon sx={{ mr: 1, color: "#4285F4" }} />
          Website
        </MenuItem>

        <Divider />

        <MenuItem 
          onClick={handleDownloadPDF} 
          disabled={isGeneratingPDF || !userId}
          sx={{
            position: 'relative',
            opacity: userId ? 1 : 0.6,
            cursor: userId ? (isGeneratingPDF ? "wait" : "pointer") : "default"
          }}
        >
          {isGeneratingPDF ? (
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Generating...
            </Box>
          ) : (
            <>
              <PictureAsPdfIcon sx={{ mr: 1 }} color="error" />
              Download PDF
            </>
          )}
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ShareMenu;