/**
 * Convert image URL to base64 data URL
 */
export const convertImageToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0);

      try {
        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = url.includes("?")
      ? `${url}&t=${Date.now()}`
      : `${url}?t=${Date.now()}`;
  });
};

export interface UserData {
  name: string;
  phone: string;
  email: string;
  altPhone: string;
  photo: string;
  designation: string;
  specialization: string;
  branch: string;
}