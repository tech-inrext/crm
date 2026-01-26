import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface UserData {
  name: string;
  phone: string;
  email: string;
  altPhone: string;
  photo: string;
  designation: string;
  specialization: string;
  branch: string;
}

/**
 * Convert image URL to base64 data URL
 */
const convertImageToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      try {
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`;
  });
};

export const generateVisitingCardPDF = async (userData: UserData) => {
  try {
    console.log('🔵 Starting PDF generation with data:', userData);
    
    // Convert photo to base64 if it exists
    let photoBase64 = '';
    if (userData.photo && userData.photo.trim() !== '') {
      console.log('🔵 Converting photo to base64:', userData.photo);
      try {
        photoBase64 = await convertImageToBase64(userData.photo);
        console.log('✅ Photo converted successfully');
      } catch (error) {
        console.error('❌ Failed to convert photo:', error);
        photoBase64 = ''; // Fallback to initials
      }
    } else {
      console.log('⚠️ No photo URL provided');
    }

    // Convert logo to base64
    const logoBase64 = await convertImageToBase64('/inrext white logo png.png');

    // Create temporary div
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '360px'; // Same as visiting card width
    tempDiv.style.height = '640px'; // 9:16 ratio
    
    // Build HTML with exact same structure as VisitingCardPage
    tempDiv.innerHTML = `
      <div id="pdf-visiting-card" style="
        width: 360px;
        height: 640px;
        background-color: #1a1a1a;
        color: white;
        position: relative;
        overflow: hidden;
        font-family: 'Arial', sans-serif;
        box-sizing: border-box;
      ">
        <!-- Background Image with Overlay -->
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('/digital-visiting-card_BG.jpg');
          background-size: cover;
          background-position: center;
        ">
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(180deg, rgba(28, 79, 163, 0.8) 0%, rgba(11, 44, 102, 0.85) 40%, rgba(0, 0, 0, 0.95) 100%);
          "></div>
        </div>

        <!-- Content Container -->
        <div style="
          position: relative;
          z-index: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px 0;
        ">
          <!-- Logo -->
          <div style="
            padding-top: 20px;
            padding-left: 24px;
            padding-right: 24px;
            text-align: center;
            z-index: 2;
          ">
            <img src="${logoBase64}" alt="Inrext Logo" style="height: 28px;" />
          </div>

          <!-- Inverted Triangle Section with Profile -->
          <div style="
            position: relative;
            height: 480px;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 32px;
          ">
            <!-- Inverted Triangle Background -->
            <div style="
              position: absolute;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 0;
              height: 0;
              border-left: 450px solid transparent;
              border-right: 450px solid transparent;
              border-top: 520px solid rgba(28, 79, 163, 0.35);
              filter: drop-shadow(0 10px 42px rgba(0,0,0,0.65));
            ">
              <div style="
                position: absolute;
                left: -440px;
                top: -510px;
                width: 0;
                height: 0;
                border-left: 440px solid transparent;
                border-right: 440px solid transparent;
                border-top: 510px solid rgba(28, 79, 163, 0.35);
              "></div>
            </div>

            <!-- Profile Image -->
            <div style="
              position: relative;
              z-index: 2;
              border-radius: 50%;
              border: 1px solid #ffffff;
              padding: 5px;
            ">
              ${
                photoBase64 ? 
                  `<img src="${photoBase64}" alt="${userData.name}" style="
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    object-fit: cover;
                    object-position: top;
                  " />` : 
                  `<div style="
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
                  ">${userData.name?.charAt(0)?.toUpperCase() || 'U'}</div>`
              }
            </div>

            <!-- Name -->
            <div style="
              position: relative;
              z-index: 2;
              margin-top: 16px;
              padding-left: 16px;
              padding-right: 16px;
              text-align: center;
            ">
              <h1 style="
                margin: 0;
                font-size: 16px;
                font-weight: 700;
                text-transform: uppercase;
                line-height: 1.2;
                white-space: pre-line;
              ">${userData.name?.split(' ')
                .map((word, i) => (i === 2 ? `\n${word}` : word))
                .join(' ')}</h1>
            </div>
          </div>

          <!-- Designation Section -->
          <div style="
            text-align: center;
            padding-left: 24px;
            padding-right: 24px;
            margin-top: -176px;
          ">
            <!-- Designation -->
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              color: white;
              opacity: 0.9;
            ">
              <span style="font-size: 16.8px;">💼</span>
              <p style="
                margin: 0;
                font-size: 16.8px;
                font-weight: 400;
              ">${userData.designation || ''}</p>
            </div>

            <!-- Divider -->
            <hr style="
              background-color: rgba(255,255,255,0.35);
              width: 65%;
              margin: 6.4px auto;
              height: 1px;
              border: none;
            " />

            <!-- Specialization -->
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              color: white;
              opacity: 0.9;
            ">
              <span style="font-size: 16.8px;">💼</span>
              <p style="
                margin: 0;
                font-size: 16.8px;
                font-weight: 400;
              ">${userData.specialization || ''}</p>
            </div>
          </div>

          <!-- Contact Icons -->
          <div style="
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 32px;
            padding-left: 24px;
            padding-right: 24px;
          ">
            ${userData.phone ? `
              <a href="tel:${userData.phone}" style="
                background-color: white;
                color: #333;
                width: 58px;
                height: 58px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                text-decoration: none;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
              ">
                <span style="font-size: 24px;">📞</span>
              </a>
            ` : ''}
            
            ${userData.altPhone ? `
              <a href="https://wa.me/${userData.altPhone}" style="
                background-color: white;
                color: #333;
                width: 58px;
                height: 58px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                text-decoration: none;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
              ">
                <span style="font-size: 24px;">💬</span>
              </a>
            ` : ''}
            
            ${userData.email ? `
              <a href="mailto:${userData.email}" style="
                background-color: white;
                color: #333;
                width: 58px;
                height: 58px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                text-decoration: none;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
              ">
                <span style="font-size: 24px;">📧</span>
              </a>
            ` : ''}
            
            <a href="https://www.inrext.com" style="
              background-color: white;
              color: #333;
              width: 58px;
              height: 58px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              text-decoration: none;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
            ">
              <span style="font-size: 24px;">🌐</span>
            </a>
          </div>

          <!-- Address -->
          <div style="
            margin-top: auto;
            padding-bottom: 28px;
            padding-left: 24px;
            padding-right: 24px;
            text-align: center;
          ">
            <p style="
              opacity: 0.9;
              font-size: 14px;
              line-height: 1.7;
              letter-spacing: 0.02em;
              margin: 0;
            ">
              3rd Floor, D4, Block-D, Sector 10,<br />
              Noida, Uttar Pradesh-201301
            </p>
          </div>
        </div>
      </div>
    `;
    
    // Append to document
    document.body.appendChild(tempDiv);
    console.log('🔵 Temporary div appended to body');

    // Wait for all images to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('🔵 Capturing canvas...');
    // Capture with optimal settings
    const canvas = await html2canvas(tempDiv, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#1a1a1a',
      logging: false,
      imageTimeout: 30000,
      removeContainer: false,
    });

    console.log('✅ Canvas captured successfully');

    // Remove temporary div
    document.body.removeChild(tempDiv);
    console.log('🔵 Temporary div removed');

    // Create PDF with exact dimensions (360x640 = 95x169 mm at 96 DPI)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [95, 169] // Exact dimensions matching the card
    });
    
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Add image to fill entire PDF
    pdf.addImage(imgData, 'PNG', 0, 0, 95, 169);

    // Set metadata
    pdf.setProperties({
      title: `${userData.name} - Digital Visiting Card`,
      subject: 'Digital Visiting Card',
      author: 'Inrext',
      keywords: 'visiting card, digital card, professional',
    });

    // Save PDF
    const filename = `${userData.name.replace(/\s+/g, '_')}_Visiting_Card.pdf`;
    pdf.save(filename);
    
    console.log('✅ PDF saved:', filename);

  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw error;
  }
};
