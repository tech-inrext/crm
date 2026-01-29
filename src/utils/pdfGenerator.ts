import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { convertImageToBase64, UserData } from "./imageConverter";

export const generateVisitingCardPDF = async (userData: UserData) => {
  try {
    console.log("🔵 Starting PDF generation with data:", userData);

    // Convert photo to base64 if it exists
    let photoBase64 = "";
    if (userData.photo && userData.photo.trim() !== "") {
      console.log("🔵 Converting photo to base64:", userData.photo);
      try {
        photoBase64 = await convertImageToBase64(userData.photo);
        console.log("✅ Photo converted successfully");
      } catch (error) {
        console.error("❌ Failed to convert photo:", error);
        photoBase64 = ""; // Fallback to initials
      }
    } else {
      console.log("⚠️ No photo URL provided");
    }

    // Convert logo to base64
    const logoBase64 = await convertImageToBase64("https://inrext.s3.ap-south-1.amazonaws.com/Static+Assets/digital-visiting-card_BG.jpg");

    // Prepare WhatsApp number (use altPhone if available, otherwise use phone)
    const whatsappNumber = (userData.altPhone || userData.phone || "").replace(
      /[^0-9]/g,
      "",
    );

    // Build HTML content using template literals
    const htmlContent = buildHTMLContent(userData, logoBase64, photoBase64, whatsappNumber);

    // Create temporary div
    const tempDiv = createTempDiv(htmlContent);
    
    // Append to document
    document.body.appendChild(tempDiv);
    console.log("🔵 Temporary div appended to body");

    // Wait for all images to load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("🔵 Capturing canvas...");
    // Capture with optimal settings
    const canvas = await html2canvas(tempDiv, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#1a1a1a",
      logging: false,
      imageTimeout: 30000,
      removeContainer: false,
    });

    console.log("✅ Canvas captured successfully");

    // Remove temporary div
    document.body.removeChild(tempDiv);
    console.log("🔵 Temporary div removed");

    // Create and save PDF
    createAndSavePDF(canvas, userData);

    console.log("✅ PDF generation completed");
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    throw error;
  }
};

/**
 * Build complete HTML content for the visiting card
 */
const buildHTMLContent = (
  userData: UserData,
  logoBase64: string,
  photoBase64: string,
  whatsappNumber: string
): string => {
  // Build profile image HTML
  const profileImageHTML = photoBase64
    ? `<img src="${photoBase64}" alt="${userData.name}" style="${profileImageStyle}" />`
    : `<div style="${initialFallbackStyle}">${userData.name?.charAt(0)?.toUpperCase() || "U"}</div>`;

  // Format name with line break after 2nd word
  const formattedName = userData.name
    ?.split(" ")
    .map((word, i) => (i === 2 ? `\n${word}` : word))
    .join(" ");

  return `
    <div id="pdf-visiting-card" style="${cardContainerStyle}">
      <!-- Background Image with Overlay -->
      <div style="${backgroundImageStyle}">
        <div style="${gradientOverlayStyle}"></div>
      </div>

      <!-- Content Container -->
      <div style="${contentContainerStyle}">
        <!-- Logo -->
        <div style="${logoSectionStyle}">
          <img src="${logoBase64}" alt="Inrext Logo" style="height: 28px;" />
        </div>

        <!-- Inverted Triangle Section with Profile -->
        <div style="${profileContainerStyle}">
          <!-- Inverted Triangle Background -->
          <div style="${triangleBackgroundStyle}">
            <div style="${innerTriangleStyle}"></div>
          </div>

          <!-- Profile Image -->
          <div style="${profileImageContainerStyle}">
            ${profileImageHTML}
          </div>

          <!-- Name -->
          <div style="${userNameContainerStyle}">
            <h1 style="${userNameStyle}">${formattedName}</h1>
          </div>
        </div>

        <!-- Designation Section -->
        <div style="${designationContainerStyle}">
          <!-- Designation -->
          <div style="${fieldContainerStyle}">
            <span style="${iconWrapperStyle}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style="opacity: 0.9;">
                <path d="M10 16v-1H3.01L3 19c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2v-4h-7v1h-4zm10-9h-4.01V5l-2-2h-4l-2 2v2H4c-1.1 0-2 .9-2 2v3c0 1.11.89 2 2 2h6v-2h4v2h6c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-6 0h-4V5h4v2z"/>
              </svg>
            </span>
            <p style="${fieldTextStyle}">${userData.designation || ""}</p>
          </div>

          <!-- Divider -->
          <hr style="${dividerStyle}" />

          <!-- Specialization -->
          <div style="${fieldContainerStyle}">
            <span style="${iconWrapperStyle}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style="opacity: 0.9;">
                <path d="M10 16v-1H3.01L3 19c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2v-4h-7v1h-4zm10-9h-4.01V5l-2-2h-4l-2 2v2H4c-1.1 0-2 .9-2 2v3c0 1.11.89 2 2 2h6v-2h4v2h6c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-6 0h-4V5h4v2z"/>
              </svg>
            </span>
            <p style="${fieldTextStyle}">${userData.specialization || ""}</p>
          </div>
        </div>

        <!-- Contact Icons -->
        <div style="${contactIconsContainerStyle}">
          ${buildContactIcons(userData, whatsappNumber)}
        </div>

        <!-- Address -->
        <div style="${addressContainerStyle}">
          <p style="${addressTextStyle}">
            3rd Floor, D4, Block-D, Sector 10,<br />
            Noida, Uttar Pradesh-201301
          </p>
        </div>
      </div>
    </div>
  `;
};

/**
 * Build contact icons HTML
 */
const buildContactIcons = (userData: UserData, whatsappNumber: string): string => {
  const icons = [
    {
      href: `tel:${userData.phone || ""}`,
      svg: `<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>`
    },
    {
      href: `https://wa.me/${whatsappNumber}`,
      svg: `<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>`
    },
    {
      href: `mailto:${userData.email || ""}`,
      svg: `<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>`
    },
    {
      href: "https://www.inrext.com",
      svg: `<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 00-1.38-3.56A8.03 8.03 0 0118.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 015.08 16zm2.95-8H5.08a7.987 7.987 0 014.33-3.56A15.65 15.65 0 008.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 01-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>`
    }
  ];

  return icons.map(icon => `
    <a href="${icon.href}" style="${iconLinkStyle}">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#333">
        ${icon.svg}
      </svg>
    </a>
  `).join('');
};

/**
 * Create temporary div element
 */
const createTempDiv = (htmlContent: string): HTMLDivElement => {
  const tempDiv = document.createElement("div");
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  tempDiv.style.top = "0";
  tempDiv.style.width = "360px";
  tempDiv.style.height = "640px";
  tempDiv.innerHTML = htmlContent;
  return tempDiv;
};

/**
 * Create and save PDF file
 */
const createAndSavePDF = (canvas: HTMLCanvasElement, userData: UserData) => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [95, 169],
  });

  const imgData = canvas.toDataURL("image/png", 1.0);
  pdf.addImage(imgData, "PNG", 0, 0, 95, 169);

  pdf.setProperties({
    title: `${userData.name} - Digital Visiting Card`,
    subject: "Digital Visiting Card",
    author: "Inrext",
    keywords: "visiting card, digital card, professional",
  });

  const filename = `${userData.name.replace(/\s+/g, "_")}_Visiting_Card.pdf`;
  pdf.save(filename);
  console.log("✅ PDF saved:", filename);
};

// CSS Styles as constants
const cardContainerStyle = `
  width: 360px;
  height: 640px;
  background-color: #1a1a1a;
  color: white;
  position: relative;
  overflow: hidden;
  font-family: 'Arial', sans-serif;
  box-sizing: border-box;
`;

const backgroundImageStyle = `
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/digital-visiting-card_BG.jpg');
  background-size: cover;
  background-position: center;
`;

const gradientOverlayStyle = `
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(28, 79, 163, 0.8) 0%, rgba(11, 44, 102, 0.85) 40%, rgba(0, 0, 0, 0.95) 100%);
`;

const contentContainerStyle = `
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
`;

const logoSectionStyle = `
  padding-top: 20px;
  padding-left: 24px;
  padding-right: 24px;
  text-align: center;
  position: relative;
  z-index: 2;
`;

const profileContainerStyle = `
  position: relative;
  height: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 32px;
`;

const triangleBackgroundStyle = `
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  border-left: 450px solid transparent;
  border-right: 450px solid transparent;
  border-top: 520px solid rgba(28, 79, 163, 0.35);
  filter: drop-shadow(0 10px 42px rgba(0,0,0,0.65));
`;

const innerTriangleStyle = `
  position: absolute;
  left: -440px;
  top: -510px;
  width: 0;
  height: 0;
  border-left: 440px solid transparent;
  border-right: 440px solid transparent;
  border-top: 510px solid rgba(28, 79, 163, 0.35);
`;

const profileImageContainerStyle = `
  position: relative;
  z-index: 2;
  border-radius: 50%;
  border: 1px solid #ffffff;
  padding: 5px;
`;

const profileImageStyle = `
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  object-position: top;
`;

const initialFallbackStyle = `
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a1a1a;
  font-size: 48px;
  font-weight: bold;
`;

const userNameContainerStyle = `
  position: relative;
  z-index: 2;
  margin-top: 16px;
  padding-left: 16px;
  padding-right: 16px;
  text-align: center;
`;

const userNameStyle = `
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  line-height: 1.2;
  white-space: pre-line;
`;

const designationContainerStyle = `
  text-align: center;
  padding-left: 24px;
  padding-right: 24px;
  margin-top: -176px;
`;

const fieldContainerStyle = `
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: white;
  opacity: 0.9;
`;

const iconWrapperStyle = `
  margin-top: 14.5px;
`;

const fieldTextStyle = `
  margin: 0;
  font-size: 16.8px;
  font-weight: 400;
`;

const dividerStyle = `
  background-color: rgba(255,255,255,0.35);
  width: 65%;
  margin: 6.4px auto;
  height: 1px;
  border: none;
`;

const contactIconsContainerStyle = `
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-top: 32px;
  padding-left: 24px;
  padding-right: 24px;
`;

const iconLinkStyle = `
  background-color: white;
  color: #333;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
`;

const addressContainerStyle = `
  margin-top: auto;
  padding-bottom: 30px;
  padding-left: 24px;
  padding-right: 24px;
  text-align: center;
`;

const addressTextStyle = `
  opacity: 0.9;
  font-size: 14px;
  line-height: 1.5;
  letter-spacing: 0.02em;
  margin: 0;
`;