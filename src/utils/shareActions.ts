// utils/shareActions.ts

export const getShareUrl = (name?: string) => {
  if (typeof window === "undefined") return "";
  const baseUrl = window.location.origin;
  if (name) {
    return encodeURIComponent(`${baseUrl}/visiting-card/${encodeURIComponent(name)}`);
  }
  return encodeURIComponent(baseUrl);
};

export const shareLinks = (name?: string) => {
  const url = getShareUrl(name);

  return {
    whatsapp: `https://wa.me/?text=${url}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    instagram: `https://www.instagram.com/`,
    visitingCard: name ? `/visiting-card/${encodeURIComponent(name)}` : "/",
  };
};