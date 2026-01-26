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
import { useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

import { shareLinks } from "@/utils/shareActions";

interface ShareMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
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

const ShareMenu: React.FC<ShareMenuProps> = ({
  anchorEl,
  open,
  onClose,
  userName,
  userData = {},
}) => {
  const router = useRouter();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info">("success");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const links = shareLinks(userName);
  const { phone, email, altPhone, photo, designation, specialization, branch } = userData;
  const whatsappNumber = altPhone || phone;

  const handleCopyLink = async () => {
    try {
      const url = links.visitingCard;
      const fullUrl = `${window.location.origin}${url}`;
      
      await navigator.clipboard.writeText(fullUrl);
      
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
    if (userName) {
      const encodedName = encodeURIComponent(userName);
      router.push(`/visiting-card/${encodedName}`);
      onClose();
    }
  };

  const handlePhoneCall = () => {
    if (phone) {
      window.open(`tel:${phone}`, '_blank');
      onClose();
    }
  };

  const handleWhatsApp = () => {
    if (whatsappNumber) {
      const cleanedNumber = whatsappNumber.replace(/[^0-9]/g, "");
      window.open(`https://wa.me/${cleanedNumber}`, '_blank');
      onClose();
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
      setIsGeneratingPDF(true);
      
      // Show loading message
      setSnackbarMessage("Generating PDF... Please wait");
      setSnackbarSeverity("info");
      setSnackbarOpen(true);
      
      // Prepare user data - ENSURE all fields are strings
      const pdfUserData = {
        name: userName || "User",
        phone: phone || "",
        email: email || "",
        altPhone: altPhone || "",
        photo: photo || "",
        designation: designation || "",
        specialization: specialization || "", // ✅ CRITICAL: Specialization must be here
        branch: branch || "",
      };

      // 🔍 DEBUG: Log the data being sent to PDF generator
      console.log('=== PDF Generation Debug ===');
      console.log('User Data received in ShareMenu:', userData);
      console.log('PDF User Data being sent:', pdfUserData);
      console.log('Specialization value:', pdfUserData.specialization);
      console.log('Photo value:', pdfUserData.photo);
      console.log('===========================');
      
      // Dynamically import the PDF generation function
      const { generateVisitingCardPDF } = await import('@/utils/pdfGenerator');
      
      // Call the PDF generation function
      await generateVisitingCardPDF(pdfUserData);
      
      setSnackbarMessage("PDF downloaded successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      
      // Close menu after a short delay
      setTimeout(() => {
        onClose();
      }, 1000);
      
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
        PaperProps={{ sx: { borderRadius: 2, minWidth: 220 } }}
      >
        <MenuItem onClick={handlePreviewVisitingCard}>
          <VisibilityIcon sx={{ mr: 1, color: "#2196F3" }} />
          Preview Visiting Card
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleCopyLink}>
          <ContentCopyIcon sx={{ mr: 1, color: "#757575" }} />
          Copy Link
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
          onClick={handleWhatsApp} 
          disabled={!whatsappNumber}
          sx={{ 
            opacity: whatsappNumber ? 1 : 0.6,
            cursor: whatsappNumber ? "pointer" : "default"
          }}
        >
          <WhatsAppIcon sx={{ mr: 1, color: whatsappNumber ? "#25D366" : "#cccccc" }} />
          {whatsappNumber ? "WhatsApp" : "No WhatsApp"}
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
          disabled={isGeneratingPDF}
          sx={{
            position: 'relative',
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

