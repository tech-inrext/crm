/**
 * Extracts a filename from the Content-Disposition header.
 * Handles both filename and filename*.
 */
export const getFilenameFromContentDisposition = (
  disposition: string,
): string | null => {
  if (!disposition) return null;

  let name: string | null = null;
  const fnStarMatch = disposition.match(
    /filename\*=(?:UTF-8'')?([^;\n\r\"]+)/i,
  );
  const fnMatch = disposition.match(/filename=\"([^\"]+)\"/i);

  if (fnStarMatch && fnStarMatch[1]) {
    try {
      name = decodeURIComponent(fnStarMatch[1]);
    } catch (e) {
      name = fnStarMatch[1];
    }
  } else if (fnMatch && fnMatch[1]) {
    name = fnMatch[1];
  }

  return name ? name.replace(/\s+/g, "") : null;
};

/**
 * Sanitizes a string for use as a filename.
 */
export const sanitizeFilename = (name: string): string => {
  return String(name)
    .replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII
    .replace(/[^a-zA-Z0-9 _\-\.]/g, "") // Remove special chars
    .replace(/\s+/g, "") // Remove spaces
    .trim() || "preview";
};

/**
 * Triggers a browser download for a blob.
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

/**
 * Generates initials from a name (max 2 characters).
 */
export const getInitials = (name?: string): string => {
  if (!name) return "";
  return name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
};

/**
 * Checks if a user has the 'system admin' role based on their current role or roles array.
 */
export function isSystemAdmin(user: any): boolean {
  if (!user) return false;
  const cur = user.currentRole;
  if (cur && typeof cur !== "string") {
    return Boolean((cur as any).isSystemAdmin);
  } else if (Array.isArray(user.roles)) {
    const roleObj = user.roles.find((r: any) => r._id === cur);
    if (roleObj) return Boolean(roleObj.isSystemAdmin);
  }
  return false;
}
