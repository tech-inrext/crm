// utils/shareActions.ts

export const getShareText = (name?: string) =>
  encodeURIComponent(`Check out ${name}'s profile`);

export const getShareUrl = (name?: string) => {
  if (typeof window === "undefined") return "";
  const baseUrl = window.location.origin;
  if (name) {
    return encodeURIComponent(`${baseUrl}/visiting-card/${encodeURIComponent(name)}`);
  }
  return encodeURIComponent(baseUrl);
};

export const shareLinks = (name?: string) => {
  const text = getShareText(name);
  const url = getShareUrl(name);

  return {
    whatsapp: `https://wa.me/?text=${text}%20${url}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    instagram: `https://www.instagram.com/`,
    visitingCard: name ? `/visiting-card/${encodeURIComponent(name)}` : "/",
  };
};